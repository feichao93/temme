import debounce from 'lodash.debounce'
import examples from './examples'
import temme, { cheerio, temmeParser, version } from 'temme'
import { EXAMPLE_MODE, EXAMPLE_NAME } from './constants'
import { loadContentFromUri, saveContentToUri } from './uriUtils'
import {
  debouncedSaveContentToLocalStorage,
  loadContentFromLocalStorage,
  saveContentToLocalStorage,
} from './localStorageUtils'

/* static elements */
const versionSpan = document.querySelector('#version')
const browseExampleLink = document.querySelector('#browse-example-link')
const htmlInputDiv = document.querySelector('#html-input')
const selectorInputDiv = document.querySelector('#selector-input')
const outputDiv = document.querySelector('#output')
const resultTimeHint = document.querySelector('#result-time-hint')
const errorIndicator = document.querySelector('#error-indicator')
const copyResultButton = document.querySelector('#copy-result-button')
const htmlPart = document.querySelector('#html-part')
const selectorOutputPart = document.querySelector('#selector-output-part')
const toggleWidthButton = document.querySelector('#toggle-width-button')
const formatHtmlButton = document.querySelector('#format-html')

const initContent = loadContentFromUri() || loadContentFromLocalStorage()

/* functions and utilities */
function onToggleWidth() {
  if (htmlPart.style.width === '50%') {
    htmlPart.style.width = '15%'
    selectorOutputPart.style.width = '85%'
    toggleWidthButton.textContent = '>'
  } else {
    htmlPart.style.width = '50%'
    selectorOutputPart.style.width = '50%'
    toggleWidthButton.textContent = '<'
  }
}

function formatHtml() {
  const html = htmlEditor.getValue()
  import('pretty').then(({ default: pretty }) => {
    const formatted = pretty(html, { ocd: true })
    if (formatted !== html) {
      htmlEditor.setValue(formatted)
    }
  })
}

const errorLines = new Set()

function clearGutterDecorations() {
  const session = selectorEditor.getSession()
  for (const line of errorLines) {
    session.removeGutterDecoration(line, 'ace_error')
  }
  errorLines.clear()
}

const syntaxError = {
  show(e) {
    const session = selectorEditor.getSession()
    if (e.name === 'SyntaxError' && e.location) {
      const line = e.location.start.line - 1
      errorLines.add(line)
      session.addGutterDecoration(line, 'ace_error')
    }
    errorIndicator.textContent = e.message
  },
  hide() {
    errorIndicator.textContent = ''
  },
}

let resultHintTimeoutHandle = null
const colors = {
  green: '#28a745',
  red: '#dc3545',
}
const resultHint = {
  setText(text, color = 'green') {
    resultTimeHint.style.color = colors[color]
    resultTimeHint.textContent = text
    resultHint._schedule(1500)
  },
  setTime(time) {
    resultTimeHint.style.color = colors.green
    resultTimeHint.textContent = `${time.toFixed(3)}ms`
    resultHint._schedule(3000)
  },
  clear() {
    resultTimeHint.textContent = ''
  },
  _schedule(time) {
    clearTimeout(resultHintTimeoutHandle)
    resultHintTimeoutHandle = setTimeout(() => resultHint.clear(), time)
  },
}

function cacheSingleParamFn(fn) {
  let lastArg = null
  let lastResult = null
  return function(arg) {
    if (arg !== lastArg) {
      lastResult = fn(arg)
    }
    return lastResult
  }
}

const parseSelector = cacheSingleParamFn(temmeParser.parse)
const parseHtml = cacheSingleParamFn(cheerio.load)

function measureExecutionTime(fn) {
  const start = performance.now()
  const result = fn()
  const end = performance.now()
  const time = end - start
  return { time, result }
}

function computeResultAndDisplay(html, selectorString, outputEditor) {
  clearGutterDecorations()
  if (selectorString) {
    try {
      const selector = parseSelector(selectorString)
      const { time, result: json } = measureExecutionTime(() => {
        const cheerioStatic = parseHtml(html)
        return temme(cheerioStatic, selector)
      })
      outputEditor.setValue(JSON.stringify(json, null, 2))
      outputEditor.getSession().selection.moveCursorFileStart()
      resultHint.setTime(time)
      syntaxError.hide()
    } catch (e) {
      syntaxError.show(e)
      resultHint.clear()
    }
  } else {
    syntaxError.hide()
    resultHint.clear()
  }
}

function initHtmlEditor() {
  const editor = ace.edit(htmlInputDiv)
  const session = editor.getSession()
  editor.setTheme('ace/theme/textmate')
  session.setMode('ace/mode/html')
  session.setUseSoftTabs(true)
  session.setTabSize(2)
  editor.$blockScrolling = Infinity
  if (!EXAMPLE_MODE && initContent) {
    editor.setValue(initContent.html)
  }
  return editor
}

function initSelectorEditor() {
  const editor = ace.edit(selectorInputDiv)
  const session = editor.getSession()
  editor.setTheme('ace/theme/chrome')
  session.setMode('ace/mode/temme')
  session.setUseSoftTabs(true)
  session.setTabSize(2)
  editor.$blockScrolling = Infinity
  if (!EXAMPLE_MODE && initContent) {
    editor.setValue(initContent.selectorString)
  }
  return editor
}

function initOutputEditor() {
  const editor = ace.edit(outputDiv)
  const session = editor.getSession()
  editor.setTheme('ace/theme/chrome')
  session.setMode('ace/mode/json')
  session.setUseSoftTabs(true)
  session.setTabSize(2)
  editor.setReadOnly(true)
  editor.$blockScrolling = Infinity
  return editor
}

/* kick start! */
versionSpan.textContent = version
browseExampleLink.href = `?example=${examples[0].name}`

const htmlEditor = initHtmlEditor()
const selectorEditor = initSelectorEditor()
const outputEditor = initOutputEditor()

const debouncedComputeResultAndDisplay = debounce(computeResultAndDisplay, 300)

const onChange = () => {
  const html = htmlEditor.getValue()
  const selectorString = selectorEditor.getValue()

  saveContentToUri(html, selectorString)
  debouncedComputeResultAndDisplay(html, selectorString, outputEditor)
  debouncedSaveContentToLocalStorage(html, selectorString)
}

htmlEditor.getSession().on('change', onChange)
selectorEditor.getSession().on('change', onChange)

copyResultButton.onclick = () => {
  outputEditor.focus()
  outputEditor.getSelection().selectAll()
  try {
    if (document.execCommand('copy')) {
      resultHint.setText('copied!')
    }
  } catch (e) {
    resultHint.setText('copy failed.', 'red')
  }
}

toggleWidthButton.addEventListener('click', onToggleWidth)
formatHtmlButton.addEventListener('click', formatHtml)

window.addEventListener('beforeunload', () => {
  saveContentToLocalStorage(htmlEditor.getValue(), selectorEditor.getValue())
})

onChange()

if (EXAMPLE_MODE) {
  import('./loadExample').then(({ default: loadExamples }) => {
    loadExamples(EXAMPLE_NAME, htmlEditor, selectorEditor)
  })
}
