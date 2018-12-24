import * as monaco from 'monaco-editor'

export type CodeEditor = monaco.editor.IStandaloneCodeEditor
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
      renderCharacters: false,
    },
  },
  selector: {
    model: null,
    language: null as string,
    theme: 'vs-dark',
    minimap: {
      renderCharacters: false,
    },
  },
  output: {
    value: '',
    language: 'json',
    theme: 'vs-dark',
    readOnly: true,
    minimap: {
      renderCharacters: false,
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

export function matchNewFolderPostfix(name: string) {
  const matchResult = name.match(/^new-folder-(\d+)$/)
  if (matchResult) {
    return Number(matchResult[1])
  }
}
export function getNewFolderName(postfix: number) {
  return `new-folder-${postfix}`
}

export function matchNewHtmlPostfix(name: string) {
  const matchResult = name.match(/^new-html-(\d+)$/)
  if (matchResult) {
    return Number(matchResult[1])
  }
}
export function getNewHtmlName(postfix: number) {
  return `new-html-${postfix}`
}

export function matchNewSelectorPostfix(name: string) {
  const matchResult = name.match(/^new-selector-(\d+)$/)
  if (matchResult) {
    return Number(matchResult[1])
  }
}
export function getNewSelectorName(postfix: number) {
  return `new-selector-${postfix}`
}
