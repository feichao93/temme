import { io, takeEvery } from 'little-saga'
import * as monaco from 'monaco-editor'
import React from 'react'
import { DialogContextType } from '../Dialog/dialogs'
import { AtomRecord } from '../utils/atoms'
import * as server from '../utils/server'
import * as actions from './actions'
import { a } from './actions'
import { EditorPageState, HtmlRecord, SelectorRecord } from './interfaces'
import * as selectors from './selectors'
import * as updaters from './updaters'
import { CodeEditor } from './utils'

type SagaEnv = {
  htmlEditorRef: React.MutableRefObject<CodeEditor>
  outputEditorRef: React.MutableRefObject<CodeEditor>
  selectorEditorRef: React.MutableRefObject<CodeEditor>
  dialogs: DialogContextType
}

function reducer(state: EditorPageState, action: actions.Action) {
  if (action.type === 'update-html-avid') {
    return state.setIn(['htmlTabs', action.htmlId, 'avid'], action.avid)
  } else if (action.type === 'update-selector-avid') {
    return state.setIn(['selectorTabs', action.selectorId, 'avid'], action.avid)
  } else {
    return state
  }
}

export default function* saga(login: string, projectName: string) {
  yield io.fork(function*() {
    while (true) {
      const action = yield io.take('*')
      yield io.update(reducer, action)
    }
  })

  yield io.fork(loadProjectData, login, projectName)

  yield takeEvery(a('open-html-tab'), handleOpenHtmlTab)
  yield takeEvery(a('open-selector-tab'), handleOpenSelectorTab)
  yield takeEvery(a('close-html-tab'), handleCloseHtmlTab)
  yield takeEvery(a('close-selector-tab'), handleCloseSelectorTab)
  yield takeEvery(a('open-folder'), handleOpenFolder)
  yield takeEvery(a('delete-selector'), handleDeleteSelector)
  // TODO add listener for RequestSaveCurrentHtml and others
}

function* loadProjectData(login: string, projectName: string) {
  const data = yield server.getProject(login, projectName)
  const { projectAtom }: EditorPageState = yield io.update((state: EditorPageState) =>
    state.merge(data),
  )

  const project = projectAtom.value
  // 首次载入 project 之后，自动选中第一个目录下的 第一个 html 和第一个 selector
  if (!project.pages.isEmpty()) {
    const firstPage = project.pages.first<null>()
    yield io.put(actions.openFolder(firstPage.pageId))
  }
}

function* handleOpenHtmlTab({ htmlId }: actions.OpenHtmlTab) {
  // todo 目前我们假设 htmlAtom 一定是 ready 的
  const htmlAtom: AtomRecord<HtmlRecord> = yield io.select(selectors.html, htmlId)
  const uriObject = htmlAtom.value.getUriObject()
  let model = monaco.editor.getModel(uriObject)
  if (model == null) {
    model = monaco.editor.createModel(htmlAtom.value.content, 'html', uriObject)
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
  // todo 目前我们假设 selectorAtom 一定是 ready 的
  const selectorAtom: AtomRecord<SelectorRecord> = yield io.select(selectors.selector, selectorId)
  const uriObject = selectorAtom.value.getUriObject()

  let model = monaco.editor.getModel(uriObject)
  if (model == null) {
    model = monaco.editor.createModel(selectorAtom.value.content, 'temme', uriObject)
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
  const { htmlTabs, htmlAtoms, activeHtmlId }: EditorPageState = yield io.select()
  const tab = htmlTabs.get(htmlId)
  const html = htmlAtoms.get(htmlId).value

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
  const { selectorTabs, selectorAtoms, activeSelectorId }: EditorPageState = yield io.select()
  const tab = selectorTabs.get(selectorId)
  const selector = selectorAtoms.get(selectorId).value

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
    projectAtom,
    selectorTabs,
    htmlTabs,
    htmlAtoms,
    selectorAtoms,
  }: EditorPageState = yield io.select()
  const project = projectAtom.value
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
    const html = htmlAtoms.get(tab.htmlId).value
    const model = monaco.editor.getModel(html.getUriObject())
    model.dispose()
  })
  yield io.update(updaters.clearHtmlTabRecord)

  // 销毁当前 folder 下所有的 selector model
  selectorTabs.forEach(tab => {
    const selector = selectorAtoms.get(tab.selectorId).value
    const model = monaco.editor.getModel(selector.getUriObject())
    model.dispose()
  })
  yield io.update(updaters.clearSelectorTabRecord)

  yield io.update(updaters.setActiveFolderId, folderId)

  // 自动打开第一个 html
  const firstHtmlId = htmlAtoms
    .map(atom => atom.value)
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
  const firstSelectorId = selectorAtoms
    .map(atom => atom.value)
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

function* handleDeleteSelector({ folderId, selectorId }: actions.DeleteSelector) {
  const { projectAtom, selectorTabs, htmlTabs }: EditorPageState = yield io.select()
  const project = projectAtom.value
  // try {
  //   await server.deleteSelector(pageId, selector.name)
  //   setProjectAtom(
  //     produce(atom => {
  //       const project = atom.value
  //       const page = project.pages.find(page => page.pageId === pageId)
  //       const selectorIndex = page.selectors.findIndex(sel => sel.name === selectorName)
  //       page.selectors.splice(selectorIndex, 1)
  //     }),
  //   )
  //   const index = selectorTabManager.items.findIndex(item => item.name === selectorName)
  //   if (index > -1) {
  //     const nextOpen = selectorTabManager.findNext(selectorName)
  //     selectorTabManager.remove(index)
  //     if (selectorTabManager.activeTabName === selectorName) {
  //       if (nextOpen == null) {
  //         closeSelector()
  //       } else {
  //         openSelector(activePageId, nextOpen)
  //       }
  //     }
  //     const model = monaco.editor.getModel(
  //       monaco.Uri.parse(getSelectorUri(pageId, selectorName)),
  //     )
  //     model.dispose()
  //   }
  // } catch (e) {
  //   await dialogs.alert(e.message)
  // }
}

/** TODO
 * 获取 pageId 在编辑器中的 model 的值，将其保存到服务器，然后更新 htmlTabInfo */
function* saveHtml(htmlId: number) {
  yield io.select()
  // const uri = getHtmlUri(pageId)
  // const uriObject = monaco.Uri.parse(uri)
  // const model = monaco.editor.getModel(uriObject)
  // const content = model.getValue()
  // const nextInitAvid = model.getAlternativeVersionId()
  // await server.saveHtml(activePageId, content)
  // updateHtmlTabInfo(
  //   produce(info => {
  //     info.initAvid = nextInitAvid
  //   }),
  // )
}

/** TODO
 * 获取 pageId/selectorName 在编辑器中的 model 的值，将其保存到服务器
 * 然后更新 selectorTabManager 和 project 的状态 */
async function saveSelector(selectorId: number) {
  // const uri = getSelectorUri(pageId, selectorName)
  // const uriObject = monaco.Uri.parse(uri)
  // const model = monaco.editor.getModel(uriObject)
  // const content = model.getValue()
  // const nextInitAvid = model.getAlternativeVersionId()
  // await server.saveSelector(pageId, selectorName, content)
  // selectorTabManager.updateInitAvid(uri, nextInitAvid)
  // setProjectAtom(
  //   produce(draft => {
  //     const page = draft.value.pages.find(page => page.pageId === pageId)
  //     const selector = page.selectors.find(sel => sel.name === selectorName)
  //     selector.content = content
  //   }),
  // )
}
