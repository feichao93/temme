import temme, { temmeParser, cheerio } from '../src/temme'
import debounce from 'lodash.debounce'
import loadExamples from './examples'

/* example mode */
const url = new URL(document.URL)
const exampleName = url.searchParams.get('example')
const EXAMPLE_MODE = exampleName !== null

/* static elements */
const lsKeyHtml = 'temme-playground-html'
const lsKeySelectorString = 'temme-playground-selector-string'
const htmlInputDiv = document.querySelector('#html-input')
const selectorInputDiv = document.querySelector('#selector-input')
const outputDiv = document.querySelector('#output')
const resultTimeHint = document.querySelector('#result-time-hint')
const errorIndicator = document.querySelector('#error-indicator')
const copyResultButton = document.querySelector('#copy-result-button')
const htmlPart = document.querySelector('#html-part')
const selectorOutputPart = document.querySelector('#selector-output-part')
const toggleWidthButton = document.querySelector('#toggle-width-button')

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

const syntaxError = {
  show(e) {
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
  return function (arg) {
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
  if (selectorString) {
    try {
      const selector = parseSelector(selectorString)
      if (html) {
        const { time, result: json } = measureExecutionTime(() => {
          const cheerioStatic = parseHtml(html)
          return temme(cheerioStatic, selector)
        })
        outputEditor.setValue(JSON.stringify(json, null, 2))
        outputEditor.getSession().selection.moveCursorFileStart()
        resultHint.setTime(time)
        syntaxError.hide()
      }
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
  session.setMode('ace/mode/html')
  session.setUseSoftTabs(true)
  session.setTabSize(2)
  editor.$blockScrolling = Infinity
  if (EXAMPLE_MODE) {
    editor.setReadOnly(true)
  } else {
    const html = localStorage.getItem(lsKeyHtml)
    if (html) {
      editor.setValue(html)
    }
  }
  return editor
}

function initSelectorEditor() {
  const editor = ace.edit(selectorInputDiv)
  const session = editor.getSession()
  // session.setMode('ace/mode/temme')
  session.setUseSoftTabs(true)
  session.setTabSize(2)
  editor.$blockScrolling = Infinity
  if (!EXAMPLE_MODE) {
    const selectorString = localStorage.getItem(lsKeySelectorString)
    if (selectorString) {
      editor.setValue(selectorString)
    }
  }
  return editor
}

function initOutputEditor() {
  const editor = ace.edit(outputDiv)
  const session = editor.getSession()
  session.setMode('ace/mode/json')
  session.setUseSoftTabs(true)
  session.setTabSize(2)
  editor.setReadOnly(true)
  editor.$blockScrolling = Infinity
  return editor
}

window.addEventListener('beforeunload', () => {
  if (!EXAMPLE_MODE) {
    const html = htmlEditor.getValue()
    const selectorString = selectorEditor.getValue()
    if (html) {
      localStorage.setItem(lsKeyHtml, html)
    } else {
      localStorage.removeItem(lsKeyHtml)
    }
    if (selectorString) {
      localStorage.setItem(lsKeySelectorString, selectorString)
    } else {
      localStorage.removeItem(lsKeySelectorString)
    }
  }
})


/* kick start! */
const htmlEditor = initHtmlEditor()
const selectorEditor = initSelectorEditor()
const outputEditor = initOutputEditor()

const debouncedComputeResultAndDisplay = debounce(computeResultAndDisplay, 300)

const onChange = () => {
  const html = htmlEditor.getValue()
  const selectorString = selectorEditor.getValue()
  debouncedComputeResultAndDisplay(html, selectorString, outputEditor)
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

onChange()

if (EXAMPLE_MODE) {
  loadExamples(exampleName, htmlEditor, selectorEditor)
}
