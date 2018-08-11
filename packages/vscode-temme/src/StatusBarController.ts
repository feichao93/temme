import { StatusBarAlignment, StatusBarItem, window } from 'vscode'
import { isTemmeDocActive } from './utils'

let frameIndex = 0
const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
function spinner() {
  return frames[frameIndex++ % frames.length]
}

export default class StatusBarController {
  private item: StatusBarItem
  private cancelButton: StatusBarItem
  private handle: any

  constructor() {
    this.item = window.createStatusBarItem(StatusBarAlignment.Left, 2)
    this.cancelButton = window.createStatusBarItem(StatusBarAlignment.Left, 1)
    this.cancelButton.text = '$(circle-slash)'
    this.cancelButton.command = 'temme.stop'
  }

  autoUpdate() {
    if (isTemmeDocActive()) {
      this.setReady()
    } else {
      this.hide()
    }
  }

  setFetching() {
    clearInterval(this.handle)
    this.handle = setInterval(() => {
      this.item.text = `${spinner()} temme: fetching html`
    }, 50)
    this.item.show()
    this.cancelButton.hide()
  }

  setReady() {
    clearInterval(this.handle)
    this.item.text = 'temme: ready'
    this.item.show()
    this.cancelButton.hide()
  }

  setWatching() {
    clearInterval(this.handle)
    this.handle = setInterval(() => {
      this.item.text = `${spinner()} temme: watching`
    }, 150)
    this.item.show()
    this.cancelButton.show()
  }

  hide() {
    clearInterval(this.handle)
    this.item.hide()
    this.cancelButton.hide()
  }

  dispose() {
    this.item.dispose()
    this.cancelButton.dispose()
    clearInterval(this.handle)
  }
}
