export const LS_KEY_HTML = 'temme-playground-html'
export const LS_KEY_SELECTOR_STRING = 'temme-playground-selector-string'

const url = new URL(document.URL)
export const EXAMPLE_NAME = url.searchParams.get('example')
export const EXAMPLE_MODE = EXAMPLE_NAME !== null
