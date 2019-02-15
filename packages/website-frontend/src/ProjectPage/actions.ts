export type Action =
  | UpdateActiveHtmlAvid
  | UpdateActiveSelectorAvid
  | RequestDownloadProject
  | OpenPage
  | RequestSaveCurrentPage
  | RequestAddPage
  | RequestUpdatePageMeta
  | RequestDeletePage
  | RequestImportProject

/** 确保参数一定是合法的 action 类型 */
export function a(actionType: Action['type']) {
  return actionType
}

export type UpdateActiveHtmlAvid = ReturnType<typeof updateActiveHtmlAvid>
export function updateActiveHtmlAvid(avid: number) {
  return { type: 'update-active-html-avid' as 'update-active-html-avid', avid }
}

export type UpdateActiveSelectorAvid = ReturnType<typeof updateActiveSelectorAvid>
export function updateActiveSelectorAvid(avid: number) {
  return { type: 'update-active-selector-avid' as 'update-active-selector-avid', avid }
}

export type RequestDownloadProject = ReturnType<typeof requestDownloadProject>
export function requestDownloadProject() {
  return { type: 'request-download-project' as 'request-download-project' }
}

export type OpenPage = ReturnType<typeof openPage>
export function openPage(pageId: number) {
  return { type: 'open-page' as 'open-page', pageId }
}

export type RequestSaveCurrentPage = ReturnType<typeof requestSaveCurrentPage>
export function requestSaveCurrentPage() {
  return { type: 'request-save-current-page' as 'request-save-current-page' }
}

export type RequestAddPage = ReturnType<typeof requestAddPage>
export function requestAddPage() {
  return { type: 'request-add-page' as 'request-add-page' }
}

export type RequestUpdatePageMeta = ReturnType<typeof requestUpdatePageMeta>
export function requestUpdatePageMeta(pageId: number) {
  return { type: 'request-update-page-meta' as 'request-update-page-meta', pageId }
}

export type RequestDeletePage = ReturnType<typeof requestDeletePage>
export function requestDeletePage(pageId: number) {
  return { type: 'request-delete-page' as 'request-delete-page', pageId }
}

// 将当前浏览的 project 导入至自己的项目列表
export type RequestImportProject = ReturnType<typeof requestImportProject>
export function requestImportProject() {
  return { type: 'request-import-project' as 'request-import-project' }
}
