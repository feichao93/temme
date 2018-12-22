import {
  EditorPageState,
  FolderRecord,
  HtmlRecord,
  HtmlTabRecord,
  SelectorRecord,
  SelectorTabRecord,
} from './interfaces'
import * as selectors from './selectors'
import { inc } from './utils'

export function updateHtmlContent(state: EditorPageState, htmlId: number, content: string) {
  return state.setIn(['htmls', htmlId, 'content'], content)
}

export function updateSelectorContent(state: EditorPageState, selectorId: number, content: string) {
  return state.setIn(['selectors', selectorId, 'content'], content)
}

export function updateHtmlInitAvid(state: EditorPageState, htmlId: number, initAvid: number) {
  return state.setIn(['htmlTabs', htmlId, 'initAvid'], initAvid)
}

export function updateSelectorInitAvid(
  state: EditorPageState,
  selectorId: number,
  initAvid: number,
) {
  return state.setIn(['selectorTabs', selectorId, 'initAvid'], initAvid)
}

export function pushHtmlTabRecord(state: EditorPageState, htmlId: number, avid: number) {
  const openOrder = state.nextOpenOrder
  const placeOrder = selectors.nextHtmlTabPlaceOrder(state)
  const tabRecord = new HtmlTabRecord({
    avid,
    initAvid: avid,
    htmlId,
    openOrder,
    placeOrder,
  })
  return state.update('htmlTabs', tabs => tabs.set(htmlId, tabRecord)).update('nextOpenOrder', inc)
}

export function clearHtmlTabRecord(state: EditorPageState) {
  return state.update('htmlTabs', tabs => tabs.clear())
}

export function refreshHtmlTabOpenOrder(state: EditorPageState, htmlId: number) {
  return state
    .setIn(['htmlTabs', htmlId, 'openOrder'], state.nextOpenOrder)
    .update('nextOpenOrder', inc)
}

export function refreshSelectorTabOpenOrder(state: EditorPageState, selectorId: number) {
  return state
    .setIn(['selectorTabs', selectorId, 'openOrder'], state.nextOpenOrder)
    .update('nextOpenOrder', inc)
}

export function pushSelectorTabRecord(state: EditorPageState, selectorId: number, avid: number) {
  const openOrder = state.nextOpenOrder
  const placeOrder = selectors.nextSelectorTabPlaceOrder(state)
  const tabRecord = new SelectorTabRecord({
    avid,
    initAvid: avid,
    selectorId,
    openOrder,
    placeOrder,
  })
  return state
    .update('selectorTabs', tabs => tabs.set(selectorId, tabRecord))
    .update('nextOpenOrder', inc)
}

export function clearSelectorTabRecord(state: EditorPageState) {
  return state.update('selectorTabs', tabs => tabs.clear())
}

export function setActiveFolderId(state: EditorPageState, folderId: number) {
  return state.set('activeFolderId', folderId)
}

export function deleteSelectorTabRecord(state: EditorPageState, selectorId: number) {
  return state.update('selectorTabs', tabs => tabs.delete(selectorId))
}

export function deleteHtmlTabRecord(state: EditorPageState, htmlId: number) {
  return state.update('htmlTabs', tabs => tabs.delete(htmlId))
}

export function updateFolder(state: EditorPageState, folder: FolderRecord) {
  return state.setIn(['project', 'folders', folder.folderId], folder)
}

export function updateHtml(state: EditorPageState, html: HtmlRecord) {
  return state.setIn(['htmls', html.htmlId], html)
}

export function updateSelector(state: EditorPageState, selector: SelectorRecord) {
  return state.setIn(['selectors', selector.selectorId], selector)
}
