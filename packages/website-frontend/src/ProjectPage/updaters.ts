import { HtmlRecord, HtmlTabRecord, SelectorRecord, SelectorTabRecord, State, } from './interfaces'
import * as selectors from './selectors'
import { inc } from './utils'

export function updateHtmlContent(state: State, htmlId: number, content: string) {
  return state.setIn(['htmls', htmlId, 'content'], content)
}

export function updateSelectorContent(state: State, selectorId: number, content: string) {
  return state.setIn(['selectors', selectorId, 'content'], content)
}

export function updateHtmlInitAvid(state: State, htmlId: number, initAvid: number) {
  return state.setIn(['htmlTabs', htmlId, 'initAvid'], initAvid)
}

export function updateSelectorInitAvid(state: State, selectorId: number, initAvid: number) {
  return state.setIn(['selectorTabs', selectorId, 'initAvid'], initAvid)
}

export function pushHtmlTabRecord(state: State, htmlId: number, avid: number) {
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

export function clearHtmlTabRecord(state: State) {
  return state.update('htmlTabs', tabs => tabs.clear())
}

export function refreshHtmlTabOpenOrder(state: State, htmlId: number) {
  return state
    .setIn(['htmlTabs', htmlId, 'openOrder'], state.nextOpenOrder)
    .update('nextOpenOrder', inc)
}

export function refreshSelectorTabOpenOrder(state: State, selectorId: number) {
  return state
    .setIn(['selectorTabs', selectorId, 'openOrder'], state.nextOpenOrder)
    .update('nextOpenOrder', inc)
}

export function pushSelectorTabRecord(state: State, selectorId: number, avid: number) {
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

export function clearSelectorTabRecord(state: State) {
  return state.update('selectorTabs', tabs => tabs.clear())
}

export function setActiveFolderId(state: State, folderId: number) {
  return state.set('activeFolderId', folderId)
}

export function setActiveHtmlId(state: State, htmlId: number) {
  return state.set('activeHtmlId', htmlId)
}

export function setActiveSelectorId(state: State, selectorId: number) {
  return state.set('activeSelectorId', selectorId)
}

export function deleteSelectorTabRecord(state: State, selectorId: number) {
  return state.update('selectorTabs', tabs => tabs.delete(selectorId))
}

export function deleteHtmlTabRecord(state: State, htmlId: number) {
  return state.update('htmlTabs', tabs => tabs.delete(htmlId))
}

export function updateHtml(state: State, html: HtmlRecord) {
  return state.setIn(['htmls', html.htmlId], html)
}

export function updateSelector(state: State, selector: SelectorRecord) {
  return state.setIn(['selectors', selector.selectorId], selector)
}
