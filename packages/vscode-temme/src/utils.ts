import fs from 'fs'
import fetch from 'node-fetch'
import path from 'path'
import { Range, TextDocument, Uri, ViewColumn, window, workspace, WorkspaceEdit } from 'vscode'

/** 从链接中下载 HTML */
export async function downloadHtmlFromLink(url: string, base: string) {
  let isHttpLink = url.startsWith('http')

  if (url.startsWith('file:///')) {
    url = url.replace('file:///', '')
  }

  if (isHttpLink) {
    const response = await fetch(url, { timeout: 10e3 })
    if (response.ok) {
      return await response.text()
    } else {
      const { status, statusText } = response
      const msg = `Fail to download html from ${url}. Server responds with ${status} ${statusText}`
      throw new Error(msg)
    }
  } else {
    return fs.readFileSync(path.resolve(base, url), 'utf8')
  }
}

export async function placeOutputDocInAnotherViewColumnIfNotVisible(
  temmeDoc: TextDocument,
  outputDoc: TextDocument,
) {
  const visibleDocs = new Set(window.visibleTextEditors.map(editor => editor.document))
  if (!visibleDocs.has(outputDoc)) {
    const activeViewColumn = window.activeTextEditor
      ? window.activeTextEditor.viewColumn
      : ViewColumn.One
    await window.showTextDocument(
      outputDoc,
      activeViewColumn === ViewColumn.Two ? ViewColumn.One : ViewColumn.Two,
    )
    await window.showTextDocument(temmeDoc, activeViewColumn)
  }
}

export async function openOutputDocument(temmeDoc: TextDocument) {
  const outputFileName = path.resolve(temmeDoc.uri.fsPath, '../', `${temmeDoc.fileName}.json`)
  const exists = fs.existsSync(outputFileName)
  const fileUri = Uri.file(outputFileName).with({
    scheme: exists ? 'file' : 'untitled',
  })
  return await workspace.openTextDocument(fileUri)
}

export async function replaceWholeDocument(document: TextDocument, content: string) {
  const range = new Range(0, 0, document.lineCount, 0)
  const edit = new WorkspaceEdit()
  edit.replace(document.uri, range, content)
  await workspace.applyEdit(edit)
}

export function pprint(object: any) {
  return JSON.stringify(object, null, 2)
}

export function isTemmeDocActive() {
  return window.activeTextEditor && window.activeTextEditor.document.languageId === 'temme'
}

export function now() {
  const d = new Date()
  const YYYY = String(d.getFullYear()).padStart(4, '0')
  const MM = String(d.getMonth() + 1).padStart(2, '0')
  const DD = String(d.getDate()).padStart(2, '0')
  const HH = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  const SSS = String(d.getMilliseconds()).padStart(3, '0')
  return `[${YYYY}-${MM}-${DD} ${HH}:${mm}:${ss}.${SSS}]`
}
