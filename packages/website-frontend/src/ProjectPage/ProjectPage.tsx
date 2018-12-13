// @ts-ignore
import * as monaco from 'monaco-editor'
import React, { useEffect, useRef, useState } from 'react'
import { ahtml, btemme, folders } from './test-data'
import Sidebar from './Sidebar'
import './ProjectPage.styl'

type CodeEditor = monaco.editor.IStandaloneCodeEditor

function widthPercentage(ratio: number) {
  return (ratio * 100).toFixed(1) + '%'
}

export default function ProjectPage() {
  const htmlEditorDOMRef = useRef<HTMLDivElement>(null)
  const selectorEditorDOMRef = useRef<HTMLDivElement>(null)
  const outputEditorDOMRef = useRef<HTMLDivElement>(null)

  const htmlEditorRef = useRef<CodeEditor>(null)
  const selectorEditorRef = useRef<CodeEditor>(null)
  const outputEditorRef = useRef<CodeEditor>(null)

  const [sidebarWidth] = useState<number>(0.2)
  const [leftWidth] = useState<number>(0.4)

  const rightWidth = 1 - sidebarWidth - leftWidth

  // html-editor
  useEffect(() => {
    htmlEditorRef.current = monaco.editor.create(htmlEditorDOMRef.current, {
      value: ahtml,
      language: 'html',
      theme: 'vs-dark',
      minimap: {
        renderCharacters: false,
      },
    })

    return () => {
      htmlEditorRef.current.dispose()
    }
  }, [])

  useEffect(() => {
    function callback() {
      // TODO debounce
      htmlEditorRef.current.layout()
      selectorEditorRef.current.layout()
      outputEditorRef.current.layout()
      // deboucedLayout()
    }

    window.addEventListener('resize', callback)
    return () => window.removeEventListener('resize', callback)
  }, [])

  // 需要对 body 设置 overflow hidden，不然 monaco 编辑器中的部分元素会导致额外的滚动条
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => (document.body.style.overflow = '')
  }, [])

  // selector-editor
  useEffect(() => {
    selectorEditorRef.current = monaco.editor.create(selectorEditorDOMRef.current, {
      value: btemme,
      language: null,
      theme: 'vs-dark',
      minimap: {
        renderCharacters: false,
      },
    })

    return () => {
      selectorEditorRef.current.dispose()
    }
  }, [])

  // output-editor
  useEffect(() => {
    outputEditorRef.current = monaco.editor.create(outputEditorDOMRef.current, {
      value: '{}',
      language: 'json',
      theme: 'vs-dark',
      readOnly: true,
      minimap: {
        renderCharacters: false,
      },
    })

    return () => {
      outputEditorRef.current.dispose()
    }
  }, [])

  function getLanguageFromFilename(filename: string) {
    if (filename.endsWith('.html')) {
      return 'html'
    } else {
      return null
    }
  }

  function openFile(folderId: number, filename: string) {
    const folder = folders.find(fld => fld.folderId === folderId)
    const file = folder.files.find(file => file.filename === filename)

    htmlEditorRef.current.setModel(
      monaco.editor.createModel(file.content, getLanguageFromFilename(file.filename)),
    )
  }

  return (
    <div className="project-page">
      <nav>@shinima/test-project</nav>
      <div className="main">
        <Sidebar width={widthPercentage(sidebarWidth)} openFile={openFile} />
        <div className="resizer" style={{ left: widthPercentage(sidebarWidth) }} />
        <div className="left" style={{ width: widthPercentage(leftWidth) }}>
          <div className="editor-container" ref={htmlEditorDOMRef} />
        </div>
        <div className="resizer" style={{ left: widthPercentage(sidebarWidth + leftWidth) }} />
        <div className="right" style={{ width: widthPercentage(rightWidth) }}>
          <div className="editor-container" ref={selectorEditorDOMRef} />
          <div className="editor-container" ref={outputEditorDOMRef} />
        </div>
      </div>
    </div>
  )
}
