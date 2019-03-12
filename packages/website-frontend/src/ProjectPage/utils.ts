import * as monaco from 'monaco-editor'
import { PageRecord } from '../types'

export type CodeEditor = monaco.editor.IStandaloneCodeEditor
export type Model = monaco.editor.ITextModel
export type EditorConstructionOptions = monaco.editor.IEditorConstructionOptions
export type AsyncReturnType<T> = T extends (...args: any[]) => Promise<infer P> ? P : any

export type InitEditorOptions = {
  html: EditorConstructionOptions
  selector: EditorConstructionOptions
  output: EditorConstructionOptions
}

export const INIT_EDITOR_OPTIONS: InitEditorOptions = {
  html: {
    model: null,
    language: 'html',
    theme: 'vs-dark',
    minimap: {
      enabled: false,
    },
  },
  selector: {
    model: null,
    language: null as string,
    theme: 'vs-dark',
    minimap: {
      enabled: false,
    },
  },
  output: {
    value: '',
    language: 'json',
    theme: 'vs-dark',
    readOnly: true,
    minimap: {
      enabled: false,
    },
  },
}

export const CTRL_S = monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S

export function disposeAllEditorModels() {
  for (const model of monaco.editor.getModels()) {
    model.dispose()
  }
}

export const inc = (x: number) => x + 1

export function matchNewPagePostfix(name: string) {
  const matchResult = name.match(/^new-page-(\d+)$/)
  if (matchResult) {
    return Number(matchResult[1])
  }
}
export function getNewPageName(postfix: number) {
  return `new-page-${postfix}`
}

export function getHtmlUriObject(page: PageRecord) {
  return monaco.Uri.parse(`inmemory://htmls/${page._id}`)
}

export function getSelectorUriObject(page: PageRecord) {
  return monaco.Uri.parse(`inmemory://selectors/${page._id}`)
}

// 清除 model 上的诊断信息
export function clearModelMarkers(model: Model) {
  monaco.editor.setModelMarkers(model, '', [])
}

// 根据错误在 model 上设置诊断信息
export function setModelMarkersByError(model: Model, e: any) {
  // 默认使用第一行
  let startLineNumber = 1
  let startColumn = 1
  let endLineNumber = 1
  let endColumn = model.getLineLength(1) + 1

  // 如果能够确定错误位置的话，就使用正确的位置
  if (e.location != null && e.location.start != null && e.location.end != null) {
    startLineNumber = e.location.start.line
    startColumn = e.location.start.column
    endLineNumber = e.location.end.line
    endColumn = model.getLineLength(e.location.end.line) + 1
  }

  monaco.editor.setModelMarkers(model, '', [
    {
      startLineNumber,
      startColumn,
      endLineNumber,
      endColumn,
      message: e.message,
      severity: monaco.MarkerSeverity.Error,
    },
  ])
}

const temmeErrors: any[] = []
;(window as any).temmeErrors = temmeErrors
let hinted = false
export function addTemmeError(e: any) {
  if (!hinted) {
    hinted = true
    console.log(
      '%cType `window.temmeErrors` to view recent errors when parsing/executing selector.',
      'background: #d18139; color: white; font-size: 16px',
    )
  }
  temmeErrors.push(e)
  if (temmeErrors.length > 100) {
    temmeErrors.pop()
  }
}
