// @ts-ignore
import * as monaco from 'monaco-editor'

export type CodeEditor = monaco.editor.IStandaloneCodeEditor
export type EditorConstructionOptions = monaco.editor.IEditorConstructionOptions

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

export function noop() {}
