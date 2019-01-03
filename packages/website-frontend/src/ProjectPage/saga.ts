import { io, takeEvery } from 'little-saga'
import * as monaco from 'monaco-editor'
import React from 'react'
import { DialogContextType } from '../Dialog/dialogs'
import * as server from '../utils/server'
import * as actions from './actions'
import { a } from './actions'
import { FolderRecord, HtmlRecord, SelectorRecord, State } from './interfaces'
import * as selectors from './selectors'
import * as updaters from './updaters'
import {
  AsyncReturnType,
  CodeEditor,
  getNewFolderName,
  getNewHtmlName,
  getNewSelectorName,
  inc,
  matchNewFolderPostfix,
  matchNewHtmlPostfix,
  matchNewSelectorPostfix,
} from './utils'

type SagaEnv = {
  htmlEditorRef: React.MutableRefObject<CodeEditor>
  outputEditorRef: React.MutableRefObject<CodeEditor>
  selectorEditorRef: React.MutableRefObject<CodeEditor>
  dialogs: DialogContextType
}

function applyReducer<A extends actions.Action>(reducer: (state: State, action: A) => State) {
  return function*(action: A) {
    yield io.update(reducer, action)
  }
}

export default function* saga(login: string, projectName: string) {
  yield io.fork(loadProjectData, login, projectName)

  yield takeEvery(
    a('update-html-avid'),
    applyReducer((state, action: actions.UpdateHtmlAvid) =>
      state.setIn(['htmlTabs', action.htmlId, 'avid'], action.avid),
    ),
  )
  yield takeEvery(
    a('update-selector-avid'),
    applyReducer((state, action: actions.UpdateSelectorAvid) =>
      state.setIn(['selectorTabs', action.selectorId, 'avid'], action.avid),
    ),
  )
  yield takeEvery(
    a('use-sidebar-view'),
    applyReducer((state, action: actions.UseSidebarView) =>
      state.set('sidebarView', action.sidebarView),
    ),
  )

  yield takeEvery(a('open-folder'), handleOpenFolder)
  yield takeEvery(a('open-html-tab'), handleOpenHtmlTab)
  yield takeEvery(a('open-selector-tab'), handleOpenSelectorTab)
  yield takeEvery(a('close-html-tab'), handleCloseHtmlTab)
  yield takeEvery(a('close-selector-tab'), handleCloseSelectorTab)

  yield takeEvery(a('request-add-folder'), handleRequestAddFolder)
  yield takeEvery(a('request-update-folder'), handleRequestUpdateFolder)
  yield takeEvery(a('request-delete-folder'), handleRequestDeleteFolder)
  yield takeEvery(a('request-add-html'), handleRequestAddHtml)
  yield takeEvery(a('request-rename-html'), handleRequestRenameHtml)
  yield takeEvery(a('request-delete-html'), handleRequestDeleteHtml)
  yield takeEvery(a('request-add-selector'), handleRequestAddSelector)
  yield takeEvery(a('request-rename-selector'), handleRequestRenameSelector)
  yield takeEvery(a('request-delete-selector'), handleRequestDeleteSelector)

  yield takeEvery(a('request-save-current-html'), function*() {
    const state: State = yield io.select()
    yield saveHtml(state.activeHtmlId)
  })
  yield takeEvery(a('request-save-current-selector'), function*() {
    const state: State = yield io.select()
    yield saveSelector(state.activeSelectorId)
  })
}

function* loadProjectData(login: string, projectName: string) {
  type Data = AsyncReturnType<typeof server.getProject>
  const data: Data = yield server.getProject(login, projectName)

  const { project }: State = yield io.update((state: State) => {
    const maxFolderPostfix = data.project.folders
      .map(fld => matchNewFolderPostfix(fld.name))
      .filter(Boolean)
      .max()
    const maxHtmlPostfix = data.htmls
      .map(html => matchNewHtmlPostfix(html.name))
      .filter(Boolean)
      .max()
    const maxSelectorPostfix = data.selectors
      .map(selector => matchNewSelectorPostfix(selector.name))
      .filter(Boolean)
      .max()
    return state
      .merge(data)
      .set('nextFolderPostfix', (maxFolderPostfix || 0) + 1)
      .set('nextHtmlPostfix', (maxHtmlPostfix || 0) + 1)
      .set('nextSelectorPostfix', (maxSelectorPostfix || 0) + 1)
  })

  // 首次载入 project 之后，自动选中第一个 folder 下的 第一个 html 和第一个 selector
  if (!project.folders.isEmpty()) {
    const firstFolder = project.folders.first<null>()
    yield io.put(actions.openFolder(firstFolder.folderId, true))
  }
}

function* handleOpenHtmlTab({ htmlId }: actions.OpenHtmlTab) {
  // 假设在这里 html 已经加载完成
  const html: HtmlRecord = yield io.select(selectors.html, htmlId)
  const uriObject = html.getUriObject()
  let model = monaco.editor.getModel(uriObject)
  if (model == null) {
    model = monaco.editor.createModel(html.content, 'html', uriObject)
    const avid = model.getAlternativeVersionId()
    yield io.update(updaters.pushHtmlTabRecord, htmlId, avid)
  } else {
    yield io.update(updaters.refreshHtmlTabOpenOrder, htmlId)
  }

  const { htmlEditorRef }: SagaEnv = yield io.getEnv()
  htmlEditorRef.current.setModel(model)
  htmlEditorRef.current.focus()
  yield io.update((state: State) => state.set('activeHtmlId', htmlId))
}

function* handleOpenSelectorTab({ selectorId }: actions.OpenSelectorTab) {
  // 假设在这里 selector 已经加载完成
  const selector: SelectorRecord = yield io.select(selectors.selector, selectorId)
  const uriObject = selector.getUriObject()

  let model = monaco.editor.getModel(uriObject)
  if (model == null) {
    model = monaco.editor.createModel(selector.content, 'temme', uriObject)
    const avid = model.getAlternativeVersionId()
    yield io.update(updaters.pushSelectorTabRecord, selectorId, avid)
  } else {
    yield io.update(updaters.refreshSelectorTabOpenOrder, selectorId)
  }

  const { selectorEditorRef }: SagaEnv = yield io.getEnv()
  selectorEditorRef.current.setModel(model)
  selectorEditorRef.current.focus()
  yield io.update((state: State) => state.set('activeSelectorId', selectorId))
}

function* handleCloseHtmlTab({ htmlId }: actions.CloseHtmlTab) {
  const { dialogs }: SagaEnv = yield io.getEnv()
  const { htmlTabs, htmls, activeHtmlId }: State = yield io.select()
  const tab = htmlTabs.get(htmlId)
  const html = htmls.get(htmlId)

  if (tab.isDirty()) {
    const option = yield dialogs.ternary({ message: `是否将更改保存到 ${html.name}` })
    if (option === 'cancel') {
      return
    }
    if (option === 'yes') {
      try {
        yield saveHtml(htmlId)
      } catch (e) {
        console.error(e)
        yield dialogs.alert({ title: '保存失败', message: e.message })
        return
      }
    }
  }

  yield io.update(updaters.deleteHtmlTabRecord, htmlId)
  const model = monaco.editor.getModel(html.getUriObject())
  model.dispose()

  // 如果正在关闭当前 tab 页，则需要自动打开另一个 tab 页
  if (htmlId === activeHtmlId) {
    const nextHtmlToOpen: HtmlRecord = yield io.select(selectors.nextHtmlToOpen)
    if (nextHtmlToOpen != null) {
      yield io.put(actions.openHtmlTab(nextHtmlToOpen.htmlId))
    } else {
      yield io.update((state: State) => state.set('activeHtmlId', -1))
    }
  }
}

function* handleCloseSelectorTab({ selectorId }: actions.CloseSelectorTab) {
  const { dialogs }: SagaEnv = yield io.getEnv()
  const { selectorTabs, selectors: selectorMap, activeSelectorId }: State = yield io.select()
  const tab = selectorTabs.get(selectorId)
  const selector = selectorMap.get(selectorId)

  if (tab.isDirty()) {
    const option = yield dialogs.ternary({ message: `是否将更改保存到 ${selector.name}` })
    if (option === 'cancel') {
      return
    }
    if (option === 'yes') {
      try {
        yield saveSelector(selectorId)
      } catch (e) {
        console.error(e)
        yield dialogs.alert({ title: '保存失败', message: e.message })
        return
      }
    }
  }

  yield io.update(updaters.deleteSelectorTabRecord, selectorId)
  const model = monaco.editor.getModel(selector.getUriObject())
  model.dispose()

  // 如果正在关闭当前 tab 页，则需要自动打开另一个 tab 页
  if (selectorId === activeSelectorId) {
    const nextSelectorToOpen: SelectorRecord = yield io.select(selectors.nextSelectorToOpen)
    if (nextSelectorToOpen != null) {
      yield io.put(actions.openSelectorTab(nextSelectorToOpen.selectorId))
    } else {
      yield io.update((state: State) => state.set('activeSelectorId', -1))
    }
  }
}

function* handleOpenFolder({ folderId, keepFoldersView }: actions.OpenFolder) {
  const {
    selectorTabs,
    htmlTabs,
    htmls: htmlMap,
    selectors: selectorMap,
    activeFolderId,
  }: State = yield io.select()
  if (folderId === activeFolderId) {
    if (!keepFoldersView) {
      yield io.update(updaters.useFilesView)
    }
    return
  }

  // 假设在这里 project/htmlMap/selectorMap 已经全部加载完毕
  const { dialogs, htmlEditorRef, selectorEditorRef }: SagaEnv = yield io.getEnv()
  const dirtyHtmls = htmlTabs.filter(tab => tab.isDirty()).map(tab => htmlMap.get(tab.htmlId))
  const dirtySelectors = selectorTabs
    .filter(tab => tab.isDirty())
    .map(tab => selectorMap.get(tab.selectorId))

  const needSave = !(dirtyHtmls.isEmpty() && dirtySelectors.isEmpty())
  if (needSave) {
    const option = yield dialogs.ternary({
      message: '部分 html 或选择器尚未保存，是否保存当前更改？',
    })
    if (option === 'cancel') {
      return
    }
    if (option === 'yes') {
      try {
        const saveHtmlEffects = dirtyHtmls
          .map(html => saveHtml(html.htmlId))
          .valueSeq()
          .toArray()
        const saveSelectorEffects = dirtySelectors
          .map(selector => saveSelector(selector.selectorId))
          .valueSeq()
          .toArray()
        yield io.all(saveHtmlEffects.concat(saveSelectorEffects))
      } catch (e) {
        console.error(e)
        yield dialogs.alert({ title: '保存失败', message: e.message })
        return
      }
    }
  }

  // 侧边栏进入文件列表
  if (!keepFoldersView) {
    yield io.update(updaters.useFilesView)
  }

  // 销毁当前 folder 下所有的 html model
  htmlTabs.forEach(tab => {
    const html = htmlMap.get(tab.htmlId)
    const model = monaco.editor.getModel(html.getUriObject())
    model.dispose()
  })
  yield io.update((state: State) => state.update('htmlTabs', tabs => tabs.clear()))

  // 销毁当前 folder 下所有的 selector model
  selectorTabs.forEach(tab => {
    const selector = selectorMap.get(tab.selectorId)
    const model = monaco.editor.getModel(selector.getUriObject())
    model.dispose()
  })
  yield io.update((state: State) =>
    state.update('selectorTabs', tabs => tabs.clear()).set('activeFolderId', folderId),
  )

  // 自动打开第一个 html
  const firstHtmlId = htmlMap
    .filter(html => html.folderId === folderId)
    .map(html => html.htmlId)
    .min()
  if (firstHtmlId != null) {
    yield io.put(actions.openHtmlTab(firstHtmlId))
  } else {
    htmlEditorRef.current.setModel(null)
    yield io.update((state: State) => state.set('activeHtmlId', -1))
  }

  // 自动打开第一个 selector
  const firstSelectorId = selectorMap
    .filter(selector => selector.folderId === folderId)
    .map(selector => selector.selectorId)
    .min()

  if (firstSelectorId != null) {
    yield io.put(actions.openSelectorTab(firstSelectorId))
  } else {
    selectorEditorRef.current.setModel(null)
    yield io.update((state: State) => state.set('activeSelectorId', -1))
  }
}

function* handleRequestDeleteSelector({ selectorId }: actions.RequestDeleteSelector) {
  const { dialogs }: SagaEnv = yield io.getEnv()
  const selector: SelectorRecord = yield io.select(selectors.selector, selectorId)
  const confirmed = yield dialogs.confirm({
    title: '确认删除',
    message: `确定要删除选择器 ${selector.name} 吗？该操作无法撤销`,
  })
  if (!confirmed) {
    return
  }

  try {
    yield server.deleteSelector(selectorId)
    const { activeSelectorId }: State = yield io.update((state: State) =>
      state
        .update('selectors', selectors => selectors.delete(selectorId))
        .update('selectorTabs', tabs => tabs.delete(selectorId))
        .set(
          'activeSelectorId',
          state.activeSelectorId === selectorId ? -1 : state.activeSelectorId,
        ),
    )
    const model = monaco.editor.getModel(selector.getUriObject())
    if (model) {
      model.dispose()
    }

    // 尝试自动打开另一个 tab
    if (activeSelectorId === -1) {
      const nextSelectorToOpen: SelectorRecord = yield io.select(selectors.nextSelectorToOpen)
      if (nextSelectorToOpen != null) {
        yield io.put(actions.openSelectorTab(nextSelectorToOpen.selectorId))
      } else {
        const { selectorEditorRef }: SagaEnv = yield io.getEnv()
        selectorEditorRef.current.setModel(null)
      }
    }
  } catch (e) {
    console.error(e)
    yield dialogs.alert({ title: '删除选择器失败', message: e.message })
  }
}

/** 获取 html 在编辑器中的 model 的值，将其保存到服务器，然后更新相关前端状态 */
function* saveHtml(htmlId: number) {
  const html: HtmlRecord = yield io.select(selectors.html, htmlId)
  const model = monaco.editor.getModel(html.getUriObject())
  const content = model.getValue()
  const nextInitAvid = model.getAlternativeVersionId()
  yield server.saveHtml(htmlId, content)
  yield io.update(updaters.updateHtmlInitAvid, htmlId, nextInitAvid)
  yield io.update(updaters.updateHtmlContent, htmlId, content)
}

/** 获取 selector 在编辑器中的 model 的值，将其保存到服务器，然后更新相关前端状态 */
function* saveSelector(selectorId: number) {
  const selector: SelectorRecord = yield io.select(selectors.selector, selectorId)
  const model = monaco.editor.getModel(selector.getUriObject())
  const content = model.getValue()
  const nextInitAvid = model.getAlternativeVersionId()
  yield server.saveSelector(selectorId, content)
  yield io.update(updaters.updateSelectorInitAvid, selectorId, nextInitAvid)
  yield io.update(updaters.updateSelectorContent, selectorId, content)
}

function* handleRequestUpdateFolder({ folderId }: actions.RequestUpdateFolder) {
  const { dialogs }: SagaEnv = yield io.getEnv()
  const state: State = yield io.select()
  const folder = state.project.folders.get(folderId)
  const newName: string = yield dialogs.prompt({
    initValue: folder.name,
    message: '新的文件夹名称',
  })
  if (newName == null || newName === folder.name) {
    return
  }
  if (state.project.folders.some(f => f.name === newName)) {
    yield dialogs.alert({ message: '已存在相同名称的文件夹' })
    return
  }
  try {
    yield server.renameFolder(folderId, newName)
    yield io.update((state: State) =>
      state.setIn(['project', 'folders', folderId, 'name'], newName),
    )
  } catch (e) {
    console.error(e)
    yield dialogs.alert({ title: '更新文件夹失败', message: e.message })
  }
}

function* handleRequestAddFolder() {
  const { dialogs }: SagaEnv = yield io.getEnv()
  const state: State = yield io.select()
  const projectId = state.project.projectId
  const folderName = getNewFolderName(state.nextFolderPostfix)
  yield io.update((state: State) => state.update('nextFolderPostfix', inc))
  try {
    const folder: FolderRecord = yield server.addFolder(projectId, folderName)
    yield io.update((state: State) => {
      return state.setIn(['project', 'folders', folder.folderId], folder)
    })
  } catch (e) {
    console.error(e)
    yield dialogs.alert({ title: '添加文件夹失败', message: e.message })
  }
}

function* handleRequestDeleteFolder({ folderId }: actions.RequestDeleteFolder) {
  const { dialogs }: SagaEnv = yield io.getEnv()
  const folder = yield io.select(selectors.folder, folderId)
  const confirmed: boolean = yield dialogs.confirm({
    title: '确认删除',
    message: `确定要删除文件夹 ${folder.name} 吗？该操作无法撤销`,
  })
  if (!confirmed) {
    return
  }

  try {
    yield server.deleteFolder(folderId)
    yield io.update((state: State) => {
      const selectorIdSet = state.selectors
        .filter(sel => sel.folderId === folderId)
        .keySeq()
        .toSet()
      const htmlIdSet = state.htmls
        .filter(html => html.folderId === folderId)
        .keySeq()
        .toSet()

      let nextState = state
      nextState = nextState
        .deleteIn(['project', 'folders', folderId])
        .update('selectors', selectors => selectors.filterNot(sel => sel.folderId === folderId))
        .update('htmls', htmls => htmls.filterNot(html => html.folderId === folderId))
        .update('htmlTabs', tabs => tabs.filterNot(tab => htmlIdSet.has(tab.htmlId)))
        .update('selectorTabs', tabs => tabs.filterNot(tab => selectorIdSet.has(tab.selectorId)))

      if (nextState.activeFolderId === folderId) {
        nextState = nextState.merge({
          activeSelectorId: -1,
          activeHtmlId: -1,
          activeFolderId: -1,
        })
      }
      return nextState
    })
  } catch (e) {
    console.error(e)
    yield dialogs.alert({ title: '删除文件夹失败', message: e.message })
  }
}

function* handleRequestAddHtml() {
  const { dialogs }: SagaEnv = yield io.getEnv()
  const state: State = yield io.select()
  const folderId = state.activeFolderId
  const htmlName = getNewHtmlName(state.nextHtmlPostfix)
  yield io.update((state: State) => state.update('nextHtmlPostfix', inc))
  try {
    const html: HtmlRecord = yield server.addHtml(folderId, htmlName)
    yield io.update(updaters.updateHtml, html)
    yield io.put(actions.openHtmlTab(html.htmlId))
  } catch (e) {
    console.error(e)
    yield dialogs.alert({ title: '添加 html 失败', message: e.message })
  }
}

function* handleRequestRenameHtml({ htmlId }: actions.RequestRenameHtml) {
  const { dialogs }: SagaEnv = yield io.getEnv()
  const state: State = yield io.select()
  const html = state.htmls.get(htmlId)
  const newName: string = yield dialogs.prompt({ message: '新的 html 名称', initValue: html.name })
  if (newName == null || newName === html.name) {
    return
  }
  if (state.htmls.some(h => h.folderId === html.folderId && h.name === newName)) {
    yield dialogs.alert({ message: '已存在相同名称的 html' })
    return
  }
  try {
    yield server.renameHtml(htmlId, newName)
    yield io.update((state: State) => state.setIn(['htmls', htmlId, 'name'], newName))
  } catch (e) {
    console.error(e)
    yield dialogs.alert({ title: '重命名 html 失败', message: e.message })
  }
}

function* handleRequestDeleteHtml({ htmlId }: actions.RequestDeleteHtml) {
  const { dialogs }: SagaEnv = yield io.getEnv()
  const html: HtmlRecord = yield io.select(selectors.html, htmlId)
  const confirmed: boolean = yield dialogs.confirm({
    title: '确认删除',
    message: `确定要删除 html ${html.name} 吗？该操作无法撤销`,
  })
  if (!confirmed) {
    return
  }

  try {
    yield server.deleteHtml(htmlId)
    const { activeHtmlId }: State = yield io.update((state: State) =>
      state
        .update('htmls', htmls => htmls.delete(htmlId))
        .update('htmlTabs', tabs => tabs.delete(htmlId))
        .set('activeHtmlId', state.activeHtmlId === htmlId ? -1 : state.activeHtmlId),
    )
    const model = monaco.editor.getModel(html.getUriObject())
    if (model) {
      model.dispose()
    }

    // 尝试自动打开另一个 tab
    if (activeHtmlId === -1) {
      const nextHtmlToOpen: HtmlRecord = yield io.select(selectors.nextHtmlToOpen)
      if (nextHtmlToOpen != null) {
        yield io.put(actions.openHtmlTab(nextHtmlToOpen.htmlId))
      } else {
        const { htmlEditorRef }: SagaEnv = yield io.getEnv()
        htmlEditorRef.current.setModel(null)
      }
    }
  } catch (e) {
    console.error(e)
    yield dialogs.alert({ title: '删除 html 失败', message: e.message })
  }
}

function* handleRequestAddSelector() {
  const { dialogs }: SagaEnv = yield io.getEnv()
  const state: State = yield io.select()
  const folderId = state.activeFolderId
  const selectorName = getNewSelectorName(state.nextSelectorPostfix)
  yield io.update((state: State) => state.update('nextSelectorPostfix', inc))
  try {
    const selector: SelectorRecord = yield server.addSelector(folderId, selectorName)
    yield io.update(updaters.updateSelector, selector)
    yield io.put(actions.openSelectorTab(selector.selectorId))
  } catch (e) {
    console.error(e)
    yield dialogs.alert({ title: '添加选择器失败', message: e.message })
  }
}

function* handleRequestRenameSelector({ selectorId }: actions.RequestRenameSelector) {
  const { dialogs }: SagaEnv = yield io.getEnv()
  const state: State = yield io.select()
  const selector = state.selectors.get(selectorId)
  const newName: string = yield dialogs.prompt({
    message: '新的选择器名称',
    initValue: selector.name,
  })
  if (newName == null || newName == selector.name) {
    return
  }
  if (state.selectors.some(s => s.folderId === selector.folderId && s.name === newName)) {
    yield dialogs.alert({ message: '已存在相同名称的选择器' })
    return
  }
  try {
    yield server.renameSelector(selectorId, newName)
    yield io.update((state: State) => state.setIn(['selectors', selectorId, 'name'], newName))
  } catch (e) {
    console.error(e)
    yield dialogs.alert({ title: '重命名选择器失败', message: e.message })
  }
}
