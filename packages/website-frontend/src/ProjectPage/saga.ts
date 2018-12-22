import { io, takeEvery } from 'little-saga'
import * as monaco from 'monaco-editor'
import React from 'react'
import { DialogContextType } from '../Dialog/dialogs'
import * as server from '../utils/server'
import * as actions from './actions'
import { a } from './actions'
import { EditorPageState, FolderRecord, HtmlRecord, SelectorRecord } from './interfaces'
import * as selectors from './selectors'
import * as updaters from './updaters'
import { CodeEditor } from './utils'

type SagaEnv = {
  htmlEditorRef: React.MutableRefObject<CodeEditor>
  outputEditorRef: React.MutableRefObject<CodeEditor>
  selectorEditorRef: React.MutableRefObject<CodeEditor>
  dialogs: DialogContextType
}

function applyReducer<A extends actions.Action>(
  reducer: (state: EditorPageState, action: A) => EditorPageState,
) {
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

  yield takeEvery(a('open-html-tab'), handleOpenHtmlTab)
  yield takeEvery(a('open-selector-tab'), handleOpenSelectorTab)
  yield takeEvery(a('close-html-tab'), handleCloseHtmlTab)
  yield takeEvery(a('close-selector-tab'), handleCloseSelectorTab)
  yield takeEvery(a('open-folder'), handleOpenFolder)
  yield takeEvery(a('request-delete-selector'), handleRequestDeleteSelector)
  yield takeEvery(a('request-add-folder'), handleRequestAddFolder)
  yield takeEvery(a('request-delete-folder'), handleRequestDeleteFolder)
  yield takeEvery(a('request-add-html'), handleRequestAddHtml)
  yield takeEvery(a('request-delete-html'), handleRequestDeleteHtml)
  yield takeEvery(a('request-add-selector'), handleRequestAddSelector)

  yield takeEvery(a('request-save-current-html'), function*() {
    const state: EditorPageState = yield io.select()
    yield saveHtml(state.activeHtmlId)
  })
  yield takeEvery(a('request-save-current-selector'), function*() {
    const state: EditorPageState = yield io.select()
    yield saveSelector(state.activeSelectorId)
  })
}

function* loadProjectData(login: string, projectName: string) {
  const data = yield server.getProject(login, projectName)
  const { project }: EditorPageState = yield io.update((state: EditorPageState) =>
    state.merge(data),
  )

  // 首次载入 project 之后，自动选中第一个 folder 下的 第一个 html 和第一个 selector
  if (!project.folders.isEmpty()) {
    const firstFolder = project.folders.first<null>()
    yield io.put(actions.openFolder(firstFolder.folderId))
  }
}

function* handleOpenHtmlTab({ htmlId }: actions.OpenHtmlTab) {
  // todo 目前我们假设 html.status 一定是 ready 的
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
  yield io.update((state: EditorPageState) => state.set('activeHtmlId', htmlId))
}

function* handleOpenSelectorTab({ selectorId }: actions.OpenSelectorTab) {
  // todo 目前我们假设 selector 一定是 ready 的
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
  yield io.update((state: EditorPageState) => state.set('activeSelectorId', selectorId))
}

function* handleCloseHtmlTab({ htmlId }: actions.CloseHtmlTab) {
  const { dialogs }: SagaEnv = yield io.getEnv()
  const { htmlTabs, htmls, activeHtmlId }: EditorPageState = yield io.select()
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
        console.log(e)
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
      yield io.update((state: EditorPageState) => state.set('activeHtmlId', -1))
    }
  }
}

function* handleCloseSelectorTab({ selectorId }: actions.CloseSelectorTab) {
  const { dialogs }: SagaEnv = yield io.getEnv()
  const {
    selectorTabs,
    selectors: selectorMap,
    activeSelectorId,
  }: EditorPageState = yield io.select()
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
        console.log(e)
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
      yield io.update((state: EditorPageState) => state.set('activeSelectorId', -1))
    }
  }
}

function* handleOpenFolder({ folderId }: actions.OpenFolder) {
  const {
    project,
    selectorTabs,
    htmlTabs,
    htmls,
    selectors: selectorMap,
  }: EditorPageState = yield io.select()
  // TODO 这里假设 selectorAtoms, htmlAtoms, projectAtom 已经全部加载完毕

  // const isHtmlDirty = htmlTabInfo.initAvid !== htmlTabInfo.avid
  // const dirtySelectors = selectorTabItems.filter(item => item.avid !== item.initAvid)
  //
  // const needSave = isHtmlDirty || dirtySelectors.length > 0
  // if (needSave) {
  //   const option = await dialogs.ternary({
  //     message: 'HTML或部分选择器尚未保存，是否保存当前更改？',
  //   })
  //   if (option === 'cancel') {
  //     return
  //   }
  //   if (option === 'yes') {
  //     try {
  //       const saveHtmlPromise = isHtmlDirty ? saveHtml(activePageId) : Promise.resolve()
  //       const saveSelectorPromises = dirtySelectors.map(selector =>
  //         saveSelector(activePageId, selector.name),
  //       )
  //       await Promise.all([saveHtmlPromise, ...saveSelectorPromises])
  //     } catch (e) {
  //       dialogs.alert(e)
  //       return
  //     }
  //   }
  // }

  // 销毁当前 folder 下所有的 html model
  htmlTabs.forEach(tab => {
    const html = htmls.get(tab.htmlId)
    const model = monaco.editor.getModel(html.getUriObject())
    model.dispose()
  })
  yield io.update(updaters.clearHtmlTabRecord)

  // 销毁当前 folder 下所有的 selector model
  selectorTabs.forEach(tab => {
    const selector = selectorMap.get(tab.selectorId)
    const model = monaco.editor.getModel(selector.getUriObject())
    model.dispose()
  })
  yield io.update(updaters.clearSelectorTabRecord)

  yield io.update(updaters.setActiveFolderId, folderId)

  // 自动打开第一个 html
  const firstHtmlId = htmls
    .filter(html => html.folderId === folderId)
    .map(html => html.htmlId)
    .min()
  if (firstHtmlId != null) {
    yield io.put(actions.openHtmlTab(firstHtmlId))
  }
  // TODO
  //  htmlEditorRef.current.setModel(null)
  //  activeHtmlId ?

  // 自动打开第一个 selector
  const firstSelectorId = selectorMap
    .filter(selector => selector.folderId === folderId)
    .map(selector => selector.selectorId)
    .min()

  if (firstSelectorId != null) {
    yield io.put(actions.openSelectorTab(firstSelectorId))
  }
  // TODO
  //  selectorEditorRef.current.setModel(null)
  //  activeSelectorId ?
}

function* handleRequestDeleteSelector({ selectorId }: actions.RequestDeleteSelector) {
  const selector: SelectorRecord = yield io.select(selectors.selector, selectorId)
  yield server.deleteSelector(selectorId)
  const { activeSelectorId }: EditorPageState = yield io.update((state: EditorPageState) =>
    state
      .update('selectors', selectors => selectors.delete(selectorId))
      .update('selectorTabs', tabs => tabs.delete(selectorId))
      .set('activeSelectorId', state.activeSelectorId === selectorId ? -1 : state.activeSelectorId),
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
  // todo 错误处理
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
  // todo 错误处理
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
  // todo 错误处理
}

function* handleRequestAddFolder({ name, description }: actions.RequestAddFolder) {
  const projectId: number = yield io.select(selectors.projectId)
  const newFolder: FolderRecord = yield server.addFolder(projectId, name, description)
  yield io.update(updaters.updateFolder, newFolder)
  // todo 错误处理
}

function* handleRequestDeleteFolder({ folderId }: actions.RequestDeleteFolder) {
  yield server.deleteFolder(folderId)
  yield io.update((state: EditorPageState) => {
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
  // todo 错误处理
}

function* handleRequestAddHtml({ name }: actions.RequestAddHtml) {
  const folderId: number = yield io.select((s: EditorPageState) => s.activeFolderId)
  const newHtml: HtmlRecord = yield server.addHtml(folderId, name)
  yield io.update(updaters.updateHtml, newHtml)
  yield io.put(actions.openHtmlTab(newHtml.htmlId))
  // todo 错误处理
}

function* handleRequestDeleteHtml({ htmlId }: actions.RequestDeleteHtml) {
  const html: HtmlRecord = yield io.select(selectors.html, htmlId)
  yield server.deleteHtml(htmlId)
  const { activeHtmlId }: EditorPageState = yield io.update((state: EditorPageState) =>
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
  // todo 错误处理
}

function* handleRequestAddSelector({ name }: actions.RequestAddSelector) {
  const folderId: number = yield io.select((s: EditorPageState) => s.activeFolderId)
  const newSelector: SelectorRecord = yield server.addSelector(folderId, name)
  yield io.update(updaters.updateSelector, newSelector)
  yield io.put(actions.openSelectorTab(newSelector.selectorId))
  // todo 错误处理
}
