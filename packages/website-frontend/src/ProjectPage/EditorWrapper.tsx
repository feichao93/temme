// @ts-ignore
import * as monaco from 'monaco-editor'
import { useEffect, useRef } from 'react'
import React from 'react'
import { CodeEditor, EditorConstructionOptions } from './utils'

type EditorWrapperProps = {
  editorRef: { current: CodeEditor }
  options: EditorConstructionOptions
}

export default function EditorWrapper({ editorRef, options }: EditorWrapperProps) {
  const tablistHeight = 35
  const domRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    editorRef.current = monaco.editor.create(domRef.current, options)

    return () => {
      editorRef.current.dispose()
    }
  }, [])

  return (
    <div
      style={{ position: 'absolute', left: 0, right: 0, top: tablistHeight, bottom: 0 }}
      ref={domRef}
    />
  )
}
