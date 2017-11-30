import examples from './examples'

function gotoExample(name) {
  window.location = `?example=${name}`
}

function enterExampleMode(currentExampleName) {
  const exitExampleModeLink = document.querySelector('#exit-example-mode')
  exitExampleModeLink.textContent = 'Exit Example Mode'
  const url = new URL(document.URL)
  url.search = ''
  exitExampleModeLink.href = url.href

  const formatHtmlButton = document.querySelector('#format-html')
  formatHtmlButton.style.display = 'none'

  const exampleSelectPart = document.querySelector('#example-select-part')
  exampleSelectPart.style.display = 'block'

  const exampleSelect = document.querySelector('#example-select')
  for (const example of examples) {
    const option = document.createElement('option')
    option.value = example.name
    option.textContent = example.name
    exampleSelect.appendChild(option)
  }
  exampleSelect.value = currentExampleName
  exampleSelect.onchange = () => gotoExample(exampleSelect.value)

  const prevButton = document.querySelector('#prev-example-button')
  prevButton.onclick = () => {
    const index = examples.findIndex(example => example.name === currentExampleName)
    if (index > 0) {
      gotoExample(examples[index - 1].name)
    }
  }

  const nextButton = document.querySelector('#next-example-button')
  nextButton.onclick = () => {
    const index = examples.findIndex(example => example.name === currentExampleName)
    if (index < examples.length - 1) {
      gotoExample(examples[index + 1].name)
    }
  }
}

export default async function loadExample(exampleName, htmlEditor, selectorEditor) {
  enterExampleMode(exampleName)
  selectorEditor.setValue('')
  htmlEditor.setValue('')
  const example = examples.find(example => example.name === exampleName)
  if (!example) {
    alert('Invalid example name')
    return
  }
  if (example.htmlUrl) {
    try {
      const response = await fetch(example.htmlUrl)
      if (response.ok) {
        const html = await response.text()
        htmlEditor.setValue(html)
        htmlEditor.getSession().selection.moveCursorFileStart()
        selectorEditor.setValue(example.selector.trim())
        selectorEditor.getSession().selection.moveCursorFileStart()
      } else {
        throw new Error('server does not respond with 200')
      }
    } catch (e) {
      alert('Loading html resources error...')
    }
  } else if (example.html) {
    htmlEditor.setValue(example.html.trim())
    htmlEditor.getSession().selection.moveCursorFileStart()
    selectorEditor.setValue(example.selector.trim())
    selectorEditor.getSession().selection.moveCursorFileStart()
  }
}
