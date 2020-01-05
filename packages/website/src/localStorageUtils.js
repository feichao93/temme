import { EXAMPLE_MODE, LS_KEY_HTML, LS_KEY_SELECTOR_STRING } from './constants'
import debounce from 'lodash.debounce'

export function saveContentToLocalStorage(html, selectorString) {
  if (!EXAMPLE_MODE) {
    if (html) {
      localStorage.setItem(LS_KEY_HTML, html)
    } else {
      localStorage.removeItem(LS_KEY_HTML)
    }
    if (selectorString) {
      localStorage.setItem(LS_KEY_SELECTOR_STRING, selectorString)
    } else {
      localStorage.removeItem(LS_KEY_SELECTOR_STRING)
    }
  }
}

export function loadContentFromLocalStorage() {
  const html = localStorage.getItem(LS_KEY_HTML) || ''
  const selectorString = localStorage.getItem(LS_KEY_SELECTOR_STRING) || ''
  return { html, selectorString }
}

export const debouncedSaveContentToLocalStorage = debounce(saveContentToLocalStorage, 300)
