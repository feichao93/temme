import EventEmitter from 'events'
import path from 'path'
import temme, { cheerio, temmeParser } from 'temme'
import { TAGGED_LINK_PATTERN, TEMME_MODE } from './constants'
import StatusBarController from './StatusBarController'
import TemmeCodeActionProvider from './TemmeCodeActionProvider'
import {
  commands,
  Diagnostic,
  DiagnosticCollection,
  ExtensionContext,
  languages,
  OutputChannel,
  Position,
  Range,
  TextDocument,
  TextDocumentChangeEvent,
  window,
  workspace,
} from 'vscode'
import {
  downloadHtmlFromLink,
  isTemmeDocActive,
  now,
  openOutputDocument,
  placeOutputDocInAnotherViewColumnIfNotVisible,
  pprint,
  replaceWholeDocument,
} from './utils'

type Status = 'ready' | 'fetching' | 'watching'

let log: OutputChannel
let emitter: EventEmitter
let diagnosticCollection: DiagnosticCollection
let status: Status
let changeCallback: any
let statusBarController: StatusBarController

/** 解析文档中的 temme 选择器，并报告选择器语法错误 */
function detectAndReportTemmeGrammarError(temmeDoc: TextDocument) {
  try {
    temmeParser.parse(temmeDoc.getText())
    diagnosticCollection.delete(temmeDoc.uri)
  } catch (e) {
    let start: Position
    let end: Position
    if (e.location != null && e.location.start != null && e.location.end != null) {
      start = new Position(e.location.start.line - 1, e.location.start.column - 1)
      const endLine = e.location.end.line - 1
      end = new Position(endLine, temmeDoc.lineAt(endLine).text.length)
    } else {
      // 如果错误位置无法确定的话，就使用第一行
      start = new Position(0, 0)
      end = new Position(0, temmeDoc.lineAt(0).text.length)
    }
    diagnosticCollection.set(temmeDoc.uri, [new Diagnostic(new Range(start, end), e.message)])
  }
}

/** 从temme文档中挑选链接。
 * 如果文档中没有链接，则什么也不做
 * 如果文档中有多个链接，则弹出快速选择框让用户进行选择
 * */
async function pickLink(temmeDoc: TextDocument) {
  const taggedLinks: { tag: string; link: string }[] = []

  const lineCount = temmeDoc.lineCount
  for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
    const line = temmeDoc.lineAt(lineIndex)
    const match = line.text.match(TAGGED_LINK_PATTERN)
    if (match) {
      taggedLinks.push({
        tag: match[1],
        link: match[2].trim(),
      })
    }
  }

  if (taggedLinks.length === 0) {
    window.showInformationMessage('No link is found in current file.')
    return
  } else {
    const options = taggedLinks.map(({ tag, link }) => `${tag} ${link}`)
    const result = await window.showQuickPick(options, { placeHolder: 'Choose an url:' })
    if (result) {
      return taggedLinks[options.indexOf(result)].link
    }
  }
}

async function getLink(link?: string) {
  const editor = window.activeTextEditor
  if (editor == null) {
    window.showWarningMessage('No temme file opened.')
    return
  }
  const document = editor.document
  if (document.languageId !== 'temme') {
    window.showWarningMessage('Not a temme file.')
    return
  }
  if (link == null) {
    link = await pickLink(document)
  }
  return link
}

async function runSelector(link?: string) {
  if (status === 'fetching') {
    log.appendLine(`${now()} runSelector when fetching html.`)
    window.showWarningMessage('Try again after the current running task is completed.')
    return
  }
  stop()
  link = await getLink(link)
  if (link == null) {
    return
  }
  const temmeDoc = window.activeTextEditor!.document
  const start = process.hrtime()

  try {
    status = 'fetching'
    statusBarController.setFetching()
    log.appendLine(`${now()} Fetching html from ${link}`)
    const html = await downloadHtmlFromLink(link, path.resolve(temmeDoc.uri.fsPath, '..'))
    log.appendLine(`${now()} Fetch html success`)
    const result = temme(html, temmeDoc.getText())
    const outputDoc = await openOutputDocument(temmeDoc)
    await placeOutputDocInAnotherViewColumnIfNotVisible(temmeDoc, outputDoc)
    await replaceWholeDocument(outputDoc, pprint(result))
    window.showInformationMessage('Success')
  } catch (e) {
    window.showErrorMessage(e.message)
    log.appendLine(`${now()} Fail to run selector due to the following error:`)
    log.appendLine(e.stack || e.message)
  }

  const diff = process.hrtime(start)
  const timeInMS = diff[0] * 1e3 + diff[1] / 1e6
  log.appendLine(`${now()} Selector executed in ${timeInMS}ms`)
  status = 'ready'
  statusBarController.autoUpdate()
}

async function startWatch(link?: string) {
  if (status === 'fetching') {
    log.appendLine(`${now()} runSelector when fetching html.`)
    window.showWarningMessage('Try again after the current running task is completed.')
    return
  }
  stop()
  if (!isTemmeDocActive()) {
    return
  }

  const temmeDoc = window.activeTextEditor!.document
  link = await getLink(link)
  if (link == null) {
    return
  }

  status = 'fetching'
  statusBarController.setFetching()

  try {
    log.appendLine(`${now()} Downloading html from ${link}`)
    const html = await downloadHtmlFromLink(link, path.resolve(temmeDoc.uri.fsPath, '..'))
    log.appendLine(`${now()} Download html success`)
    const $ = cheerio.load(html, { decodeEntities: false })

    const outputDoc = await openOutputDocument(temmeDoc)
    await placeOutputDocInAnotherViewColumnIfNotVisible(temmeDoc, outputDoc)

    async function onThisTemmeDocumentChange() {
      const start = process.hrtime()
      try {
        const result = temme($, temmeDoc.getText())
        await replaceWholeDocument(outputDoc, pprint(result))
        const diff = process.hrtime(start)
        const timeInMS = diff[0] * 1e3 + diff[1] / 1e6
        log.appendLine(`${now()} Selector executed in ${timeInMS}ms`)
      } catch (e) {
        if (e.name === 'SyntaxError' && !e.message.includes('pseudo-class')) {
          log.appendLine(`${e.name}  ${e.message}`)
        } else {
          // TODO 需要根据错误信息来获取出错的那一行
          const errorLine = 0
          diagnosticCollection.set(temmeDoc.uri, [
            new Diagnostic(
              new Range(errorLine, 0, errorLine + 1, 0),
              'Runtime Error: ' + e.message,
            ),
          ])
          log.appendLine(e.stack || e.message)
        }
      }
    }

    changeCallback = async function({ document }: TextDocumentChangeEvent) {
      if (document === temmeDoc) {
        await onThisTemmeDocumentChange()
      }
    }

    log.appendLine(`${now()} Start watching ${temmeDoc.uri.toString(true)}`)
    emitter.addListener('did-change-text-document', changeCallback)
    status = 'watching'
    statusBarController.setWatching()

    // 手动触发更新
    await onThisTemmeDocumentChange()
  } catch (e) {
    window.showErrorMessage(e.message)
    log.appendLine(`${now()} Fail to start watching due to the following error:`)
    log.appendLine(e.stack || e.message)
    status = 'ready'
    statusBarController.autoUpdate()
  }
}

function stop() {
  if (status === 'watching') {
    emitter.removeListener('did-change-text-document', changeCallback)
    changeCallback = null
    status = 'ready'
    statusBarController.autoUpdate()
    log.appendLine(`${now()} Stop watching`)
  }
}

export function activate(ctx: ExtensionContext) {
  status = 'ready'
  log = window.createOutputChannel('temme')

  emitter = new EventEmitter()
  diagnosticCollection = languages.createDiagnosticCollection('temme')
  statusBarController = new StatusBarController()

  ctx.subscriptions.push(
    commands.registerCommand('temme.runSelector', runSelector),
    commands.registerCommand('temme.startWatch', startWatch),
    commands.registerCommand('temme.stop', stop),
    languages.registerCodeActionsProvider(TEMME_MODE, new TemmeCodeActionProvider()),
    workspace.onDidChangeTextDocument(event => {
      if (event.document.languageId === 'temme') {
        detectAndReportTemmeGrammarError(event.document)
        emitter.emit('did-change-text-document', event)
      }
    }),
    window.onDidChangeActiveTextEditor(() => {
      if (status === 'ready') {
        statusBarController.autoUpdate()
      }
    }),
    diagnosticCollection,
    statusBarController,
    {
      dispose() {
        stop()
      },
    },
  )

  log.appendLine(`${now()} vscode-temme started.`)

  if (isTemmeDocActive()) {
    statusBarController.setReady()
    detectAndReportTemmeGrammarError(window.activeTextEditor!.document)
  }
}
