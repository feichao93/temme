import { State } from './interfaces'

export function folder(state: State, folderId: number) {
  return state.project.folders.get(folderId)
}

export function selector(state: State, selectorId: number) {
  return state.selectors.get(selectorId)
}

export function html(state: State, htmlId: number) {
  return state.htmls.get(htmlId)
}

export function nextHtmlTabPlaceOrder(state: State) {
  if (state.htmlTabs.isEmpty()) {
    return 1
  } else {
    return state.htmlTabs.map(t => t.placeOrder).max() + 1
  }
}

export function nextSelectorTabPlaceOrder(state: State) {
  if (state.selectorTabs.isEmpty()) {
    return 1
  } else {
    return state.selectorTabs.map(t => t.placeOrder).max() + 1
  }
}

export function nextSelectorToOpen(state: State) {
  return state.selectorTabs.maxBy(tab => tab.openOrder)
}

export function nextHtmlToOpen(state: State) {
  return state.htmlTabs.maxBy(tab => tab.openOrder)
}
