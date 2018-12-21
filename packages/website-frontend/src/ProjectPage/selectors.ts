import { EditorPageState } from './interfaces'

export function selector(state: EditorPageState, selectorId: number) {
  return state.selectorAtoms.get(selectorId)
}

export function html(state: EditorPageState, htmlId: number) {
  return state.htmlAtoms.get(htmlId)
}

export function nextHtmlTabPlaceOrder(state: EditorPageState) {
  if (state.htmlTabs.isEmpty()) {
    return 1
  } else {
    return state.htmlTabs.map(t => t.placeOrder).max() + 1
  }
}

export function nextSelectorTabPlaceOrder(state: EditorPageState) {
  if (state.selectorTabs.isEmpty()) {
    return 1
  } else {
    return state.selectorTabs.map(t => t.placeOrder).max() + 1
  }
}

export function nextSelectorToOpen(state: EditorPageState) {
  return state.selectorTabs.maxBy(tab => tab.openOrder)
}

export function nextHtmlToOpen(state: EditorPageState) {
  return state.htmlTabs.maxBy(tab => tab.openOrder)
}
