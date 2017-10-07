import examples from './examples'

function gotoExample(name) {
  window.location = `?example=${name}`
}

function enterExampleMode(currentExampleName) {
  const exampleModeHint = document.querySelector('#example-mode-hint')
  exampleModeHint.textContent = '(readonly in example mode)'
  const exitLink = document.querySelector('#exit-example-mode')
  exitLink.textContent = 'Exit Example Mode'

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
        selectorEditor.setValue(example.selector.trim())
      } else {
        throw new Error('server does not respond with 200')
      }
    } catch (e) {
      alert('Loading html resources error...')
    }
  } else if (example.html) {
    htmlEditor.setValue(example.html.trim())
    selectorEditor.setValue(example.selector.trim())
  }
}
