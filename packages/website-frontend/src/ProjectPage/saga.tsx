import { io, takeEvery } from 'little-saga'
import * as monaco from 'monaco-editor'
import React from 'react'
import { DialogContextType } from '../dialogs'
import toaster from '../toaster'
import { PageRecord } from '../types'
import history from '../utils/history'
import * as server from '../utils/server'
import { CreateProjectData } from '../utils/server'
import * as actions from './actions'
import { a } from './actions'
import { State } from './interfaces'
import * as selectors from './selectors'
import * as updaters from './updaters'
import {
  AsyncReturnType,
  CodeEditor,
  getHtmlUriObject,
  getNewPageName,
  getSelectorUriObject,
  inc,
  matchNewPagePostfix,
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

export default function* saga(login: string, projectName: string, initPageName?: string) {
  yield io.fork(loadProjectData, login, projectName, initPageName)

  yield takeEvery(
    a('update-active-html-avid'),
    applyReducer((state, action: actions.UpdateActiveHtmlAvid) =>
      state.setIn(['pages', state.activePageId, 'htmlAvid'], action.avid),
    ),
  )
  yield takeEvery(
    a('update-active-selector-avid'),
    applyReducer((state, action: actions.UpdateActiveSelectorAvid) =>
      state.setIn(['pages', state.activePageId, 'selectorAvid'], action.avid),
    ),
  )

  yield takeEvery(a('request-download-project'), handleRequestDownloadProject, login, projectName)
  yield takeEvery(a('open-page'), function*({ pageId }: actions.OpenPage) {
    yield openPage(pageId)
  })

  yield takeEvery(a('request-add-page'), handleRequestAddPage)
  yield takeEvery(a('request-update-page-meta'), handleRequestUpdatePageMeta)
  yield takeEvery(a('request-delete-page'), handleRequestDeletePage)
  yield takeEvery(a('request-import-project'), handleRequestImportProject)

  yield takeEvery(a('request-save-current-page'), function*() {
    const state: State = yield io.select()
    yield savePage(state.activePageId)
    toaster.show({
      intent: 'success',
      icon: 'saved',
      message: '保存成功',
    })
  })
}

function* handleRequestDownloadProject(login: string, projectName: string) {
  // 在下载之前需要先确保当前更改都已被保存
  const { dialogs }: SagaEnv = yield io.getEnv()
  const state: State = yield io.select()
  const modifiedPages = state.pages.filter(p => p.isModified())
  if (!modifiedPages.isEmpty()) {
    const message = '在下载前需要保存当前所有更改，是否继续？'
    const confirmed: boolean = yield dialogs.confirm({ title: '确认', message })
    if (!confirmed) {
      return
    }
    try {
      const saveHtmlEffects = modifiedPages
        .map(page => savePage(page._id))
        .valueSeq()
        .toArray()
      yield io.all(saveHtmlEffects)
    } catch (e) {
      console.error(e)
      yield dialogs.alert({ title: '保存失败', message: e.message })
      return
    }
  }

  const url = new URL(document.URL)
  url.pathname = `/archive/@${login}/${projectName}`
  // 创建一个用于下载的 anchor 标签，并点击该 anchor
  const anchor = document.createElement('a')
  anchor.href = url.href
  anchor.download = ''
  anchor.click()
}

function* loadProjectData(login: string, projectName: string, initPageName?: string) {
  type Data = AsyncReturnType<typeof server.getProject>
  const { dialogs }: SagaEnv = yield io.getEnv()
  try {
    yield io.update((s: State) => s.set('readyState', 'loading'))
    const data: Data = yield server.getProject(login, projectName)

    const { pages }: State = yield io.update((state: State) => {
      const maxPagePostfix = data.pages
        .map(fld => matchNewPagePostfix(fld.name))
        .filter(Boolean)
        .max()
      return state
        .set('project', data.project)
        .set('pages', data.pages.toOrderedMap().mapKeys((_, p) => p._id))
        .set('nextPagePostfix', (maxPagePostfix || 0) + 1)
        .set('readyState', 'ready')
    })

    // 首次载入 project 时选中指定 page
    if (!pages.isEmpty()) {
      const pageToOpen = pages.find(p => p.name === initPageName, null, pages.first())
      yield io.put(actions.openPage(pageToOpen._id))
    }
  } catch (e) {
    console.error(e)
    yield io.update((s: State) => s.set('readyState', 'aborted'))
    yield dialogs.alert({
      title: '加载失败',
      message: (
        <span>
          <b style={{ color: '#b13b00' }}>
            @{login}/{projectName}
          </b>{' '}
          加载失败，请确保该项目存在。刷新页面以尝试重试加载。
        </span>
      ),
    })
  }
}

function* closePage() {
  const { htmlEditorRef, selectorEditorRef }: SagaEnv = yield io.getEnv()
  htmlEditorRef.current.setModel(null)
  selectorEditorRef.current.setModel(null)
  yield io.update((state: State) => state.set('activePageId', ''))
}

function* openPage(pageId: string) {
  const { activePageId, pages }: State = yield io.select()
  if (pageId === activePageId) {
    return
  }

  const { htmlEditorRef, selectorEditorRef }: SagaEnv = yield io.getEnv()

  // 假设在这里 page 已经加载完成
  const page = pages.get(pageId)

  const htmlUriObject = getHtmlUriObject(page)
  let htmlModel = monaco.editor.getModel(htmlUriObject)
  if (htmlModel == null) {
    htmlModel = monaco.editor.createModel(page.html, 'html', htmlUriObject)
  }
  const htmlAvid = htmlModel.getAlternativeVersionId()

  const selectorUriObject = getSelectorUriObject(page)
  let selectorModel = monaco.editor.getModel(selectorUriObject)
  if (selectorModel == null) {
    selectorModel = monaco.editor.createModel(page.selector, 'temme', selectorUriObject)
  }
  const selectorAvid = selectorModel.getAlternativeVersionId()

  htmlEditorRef.current.setModel(htmlModel)
  selectorEditorRef.current.setModel(selectorModel)
  selectorEditorRef.current.focus()

  yield io.update(updaters.updatePage, page._id, page.merge({ htmlAvid, selectorAvid }))
  yield io.update((state: State) => state.set('activePageId', pageId))
}

/** 获取 page 在编辑器中的 model 的值，将其保存到服务器，然后更新相关前端状态 */
function* savePage(pageId: string) {
  const page: PageRecord = yield io.select(selectors.page, pageId)
  const htmlModel = monaco.editor.getModel(getHtmlUriObject(page))
  const html = htmlModel.getValue()
  const nextHtmlInitAvid = htmlModel.getAlternativeVersionId()
  const selectorModel = monaco.editor.getModel(getSelectorUriObject(page))
  const selector = selectorModel.getValue()
  const nextSelectorInitAvid = selectorModel.getAlternativeVersionId()
  const nextPage = page.merge({
    html,
    selector,
    htmlInitAvid: nextHtmlInitAvid,
    selectorInitAvid: nextSelectorInitAvid,
  })
  yield server.savePage(nextPage)
  yield io.update(updaters.updatePage, page._id, nextPage)
}

function* handleRequestUpdatePageMeta({ pageId }: actions.RequestUpdatePageMeta) {
  const { dialogs }: SagaEnv = yield io.getEnv()
  const state: State = yield io.select()
  const page = state.pages.get(pageId)

  const newName: string = yield dialogs.prompt({
    title: '重命名',
    icon: 'edit',
    initValue: page.name,
    message: '新的页面名称',
  })
  if (newName == null || newName === page.name) {
    return
  }
  if (state.pages.some(p => p.name === newName)) {
    yield dialogs.alert({ message: '已存在相同名称的页面' })
    return
  }
  try {
    yield server.updatePageMeta(pageId, newName)
    const nextPage = page.set('name', newName)
    yield io.update(updaters.updatePage, pageId, nextPage)
  } catch (e) {
    console.error(e)
    yield dialogs.alert({ title: '更新页面失败', message: e.message })
  }
}

function* handleRequestAddPage() {
  const { dialogs }: SagaEnv = yield io.getEnv()
  const state: State = yield io.select()
  const projectId = state.project._id
  const pageName = getNewPageName(state.nextPagePostfix)
  yield io.update((state: State) => state.update('nextPagePostfix', inc))
  try {
    const page: PageRecord = yield server.addPage(projectId, pageName)
    yield io.update((state: State) => state.update('pages', pages => pages.set(page._id, page)))
    yield openPage(page._id)
    toaster.show({ intent: 'success', message: `已创建 ${page.name}` })
  } catch (e) {
    console.error(e)
    yield dialogs.alert({ title: '添加文件夹失败', message: e.message })
  }
}

function* handleRequestDeletePage({ pageId }: actions.RequestDeletePage) {
  const { dialogs }: SagaEnv = yield io.getEnv()
  const page = yield io.select(selectors.page, pageId)
  const confirmed: boolean = yield dialogs.confirm({
    title: '确认删除',
    confirmIntent: 'danger',
    message: (
      <span>
        确定要删除页面 <b style={{ color: '#b13b00' }}>{page.name}</b> 吗？该操作无法撤销
      </span>
    ),
  })
  if (!confirmed) {
    return
  }

  try {
    yield server.deletePage(pageId)
    const state: State = yield io.update(updaters.deletePage, pageId)
    if (pageId === state.activePageId) {
      if (state.pages.isEmpty()) {
        closePage()
      } else {
        openPage(state.pages.map(p => p._id).min())
      }
    }
    toaster.show({
      intent: 'primary',
      message: `已删除 ${page.name}`,
    })
  } catch (e) {
    console.error(e)
    yield dialogs.alert({ title: '删除页面失败', message: e.message })
  }
}

function* handleRequestImportProject() {
  const state: State = yield io.select()

  const data: CreateProjectData = {
    name: state.project.name,
    description: state.project.description,
    pages: [],
  }
  for (const page of state.pages.values()) {
    const htmlModel = monaco.editor.getModel(getHtmlUriObject(page))
    const html = htmlModel != null ? htmlModel.getValue() : page.html
    const selectorModel = monaco.editor.getModel(getSelectorUriObject(page))
    const selector = selectorModel != null ? selectorModel.getValue() : page.selector
    data.pages.push({ name: page.name, html, selector })
  }
  const activePage = state.pages.get(state.activePageId)

  try {
    const { login, projectName } = yield server.createProject(data)
    toaster.show({
      intent: 'success',
      message: `已创建 @${login}/${projectName}`,
      action: {
        onClick() {
          history.push(`/@${login}/${projectName}?page=${activePage.name}`)
        },
        text: '打开',
      },
    })
  } catch (e) {
    console.error(e)
    toaster.show({ intent: 'danger', message: `导入项目失败. ${yield e.response.text()}` })
  }
}
