import { EditorPageState } from './interfaces'

export type Action =
  | OpenSelectorTab
  | CloseSelectorTab
  | OpenHtmlTab
  | CloseHtmlTab
  | LoadTestData
  | OpenFolder
  | DeleteSelector
  | UpdateHtmlAvid
  | UpdateSelectorAvid
  | RequestSaveCurrentHtml
  | RequestSaveCurrentSelector
  | RequestAddFolder
  | RequestDeleteFolder
  | RequestRenameFolder

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

// TODO 测试用的 action
export type LoadTestData = ReturnType<typeof loadTestData>
export function loadTestData(data: Partial<EditorPageState>) {
  return { type: 'load-test-data' as 'load-test-data', data }
}

export type OpenFolder = ReturnType<typeof openFolder>
export function openFolder(folderId: number) {
  return { type: 'open-folder' as 'open-folder', folderId }
}

export type DeleteSelector = ReturnType<typeof deleteSelector>
export function deleteSelector(folderId: number, selectorId: number) {
  return { type: 'delete-selector' as 'delete-selector', folderId, selectorId }
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

export type RequestAddFolder = ReturnType<typeof requestAddFolder>
export function requestAddFolder(name: string, description: string) {
  return { type: 'request-add-folder' as 'request-add-folder', name, description }
}

export type RequestDeleteFolder = ReturnType<typeof requestDeleteFolder>
export function requestDeleteFolder(folderId: number) {
  return { type: 'request-delete-folder' as 'request-delete-folder', folderId }
}

export type RequestRenameFolder = ReturnType<typeof requestRenameFolder>
export function requestRenameFolder(folderId: number, newName: string) {
  return { type: 'request-rename-folder' as 'request-rename-folder', folderId, newName }
}
