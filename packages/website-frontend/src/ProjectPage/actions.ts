import { SidebarView } from './interfaces'

export type Action =
  | RequestDownloadProject
  | OpenSelectorTab
  | CloseSelectorTab
  | OpenHtmlTab
  | CloseHtmlTab
  | OpenFolder
  | UpdateHtmlAvid
  | UpdateSelectorAvid
  | RequestSaveCurrentHtml
  | RequestSaveCurrentSelector
  | RequestAddHtml
  | RequestRenameHtml
  | RequestDeleteHtml
  | RequestAddSelector
  | RequestRenameSelector
  | RequestDeleteSelector
  | RequestAddFolder
  | RequestUpdateFolder
  | RequestDeleteFolder
  | UseSidebarView

/** 确保参数一定是合法的 action 类型 */
export function a(actionType: Action['type']) {
  return actionType
}

export type OpenSelectorTab = ReturnType<typeof openSelectorTab>
export function openSelectorTab(selectorId: number) {
  return {
    type: 'open-selector-tab' as 'open-selector-tab',
    selectorId,
  }
}

export type CloseSelectorTab = ReturnType<typeof closeSelectorTab>
export function closeSelectorTab(selectorId: number) {
  return {
    type: 'close-selector-tab' as 'close-selector-tab',
    selectorId,
  }
}

export type OpenHtmlTab = ReturnType<typeof openHtmlTab>
export function openHtmlTab(htmlId: number) {
  return {
    type: 'open-html-tab' as 'open-html-tab',
    htmlId,
  }
}

export type CloseHtmlTab = ReturnType<typeof closeHtmlTab>
export function closeHtmlTab(htmlId: number) {
  return {
    type: 'close-html-tab' as 'close-html-tab',
    htmlId,
  }
}

export type OpenFolder = ReturnType<typeof openFolder>
export function openFolder(folderId: number, keepFoldersView = false) {
  return { type: 'open-folder' as 'open-folder', folderId, keepFoldersView }
}

export type RequestDeleteSelector = ReturnType<typeof requestDeleteSelector>
export function requestDeleteSelector(selectorId: number) {
  return { type: 'request-delete-selector' as 'request-delete-selector', selectorId }
}

export type UpdateHtmlAvid = ReturnType<typeof updateHtmlAvid>
export function updateHtmlAvid(htmlId: number, avid: number) {
  return { type: 'update-html-avid' as 'update-html-avid', htmlId, avid }
}

export type UpdateSelectorAvid = ReturnType<typeof updateSelectorAvid>
export function updateSelectorAvid(selectorId: number, avid: number) {
  return { type: 'update-selector-avid' as 'update-selector-avid', selectorId, avid }
}

export type RequestSaveCurrentHtml = ReturnType<typeof requestSaveCurrentHtml>
export function requestSaveCurrentHtml() {
  return { type: 'request-save-current-html' as 'request-save-current-html' }
}

export type RequestSaveCurrentSelector = ReturnType<typeof requestSaveCurrentSelector>
export function requestSaveCurrentSelector() {
  return { type: 'request-save-current-selector' as 'request-save-current-selector' }
}

export type RequestAddHtml = ReturnType<typeof requestAddHtml>
export function requestAddHtml() {
  return { type: 'request-add-html' as 'request-add-html' }
}

export type RequestRenameHtml = ReturnType<typeof requestRenameHtml>
export function requestRenameHtml(htmlId: number) {
  return { type: 'request-rename-html' as 'request-rename-html', htmlId }
}

export type RequestDeleteHtml = ReturnType<typeof requestDeleteHtml>
export function requestDeleteHtml(htmlId: number) {
  return { type: 'request-delete-html' as 'request-delete-html', htmlId }
}

export type RequestAddSelector = ReturnType<typeof requestAddSelector>
export function requestAddSelector() {
  return { type: 'request-add-selector' as 'request-add-selector' }
}

export type RequestRenameSelector = ReturnType<typeof requestRenameSelector>
export function requestRenameSelector(selectorId: number) {
  return { type: 'request-rename-selector' as 'request-rename-selector', selectorId }
}

export type RequestAddFolder = ReturnType<typeof requestAddFolder>
export function requestAddFolder() {
  return { type: 'request-add-folder' as 'request-add-folder' }
}

export type RequestDownloadProject = ReturnType<typeof requestDownloadProject>
export function requestDownloadProject() {
  return { type: 'request-download-project' as 'request-download-project' }
}

export type RequestUpdateFolder = ReturnType<typeof requestUpdateFolder>
export function requestUpdateFolder(folderId: number) {
  return { type: 'request-update-folder' as 'request-update-folder', folderId }
}

export type RequestDeleteFolder = ReturnType<typeof requestDeleteFolder>
export function requestDeleteFolder(folderId: number) {
  return { type: 'request-delete-folder' as 'request-delete-folder', folderId }
}

export type UseSidebarView = ReturnType<typeof useSidebarView>
export function useSidebarView(sidebarView: SidebarView) {
  return { type: 'use-sidebar-view' as 'use-sidebar-view', sidebarView }
}
