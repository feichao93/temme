// @ts-ignore
import * as monaco from 'monaco-editor'
// @ts-ignore
import temme from 'temme'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { RouteComponentProps } from 'react-router'
import { btemme, pages } from './test-data'
import Sidebar from './Sidebar'
import PageLayout from './PageLayout'
import './ProjectPage.styl'
import { Link } from 'react-router-dom'

type CodeEditor = monaco.editor.IStandaloneCodeEditor

export default function ProjectPage(
  props: RouteComponentProps<{ login: string; projectName: string }>,
) {
  const { login, projectName } = props.match.params

  const htmlEditorDOMRef = useRef<HTMLDivElement>(null)
  const selectorEditorDOMRef = useRef<HTMLDivElement>(null)
  const outputEditorDOMRef = useRef<HTMLDivElement>(null)

  const htmlEditorRef = useRef<CodeEditor>(null)
  const selectorEditorRef = useRef<CodeEditor>(null)
  const outputEditorRef = useRef<CodeEditor>(null)

  const [activePageId, setActivePageId] = useState(-1)
  const [activeSelectorName, setActiveSelectorName] = useState('')

  // html-editor
  useEffect(() => {
    htmlEditorRef.current = monaco.editor.create(htmlEditorDOMRef.current, {
      value: '',
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

  // 需要对 body 设置 overflow hidden，不然 monaco 编辑器中的部分元素会导致额外的滚动条
  useLayoutEffect(() => {
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

  // choose first-page when mount
  useEffect(() => {
    if (pages.length > 0) {
      onChoosePage(pages[0].pageId)
    }
  }, [])

  useEffect(() => {
    const htmlEditor = htmlEditorRef.current
    const selectorEditor = selectorEditorRef.current

    const a = htmlEditor.onDidChangeModelContent(compute)
    const b = selectorEditor.onDidChangeModelContent(compute)

    function compute() {
      try {
        const html = htmlEditor.getValue()
        const selector = selectorEditor.getValue()

        const result = temme(html, selector)
        outputEditorRef.current.setValue(JSON.stringify(result, null, 2))
      } catch (e) {
        console.error(e)
      }
    }

    return () => {
      a.dispose()
      b.dispose()
    }
  }, [])

  function layout() {
    // TODO debounce
    htmlEditorRef.current.layout()
    selectorEditorRef.current.layout()
    outputEditorRef.current.layout()
  }

  function onChoosePage(pageId: number) {
    const page = pages.find(p => p.pageId === pageId)
    setActivePageId(pageId)
    htmlEditorRef.current.setValue(page.html)

    if (page.selectors.length > 0) {
      const selector = page.selectors[0]
      setActiveSelectorName(selector.name)
      selectorEditorRef.current.setValue(selector.content)
    }
  }

  function onChooseSelector(selectorName: string) {
    const page = pages.find(pg => pg.pageId === activePageId)
    const selector = page.selectors.find(sel => sel.name === selectorName)
    selectorEditorRef.current.setValue(selector.content)
  }

  return (
    <div className="project-page">
      <nav>
        <h1>
          <Link to="/">T</Link>
        </h1>
        <Link style={{ color: 'white' }} to={`/@${login}`}>
          @{login}
        </Link>
        <span>&nbsp;/&nbsp;{projectName}</span>
      </nav>
      <PageLayout
        layout={layout}
        sidebar={
          <Sidebar
            onChooseSelector={onChooseSelector}
            activePageId={activePageId}
            activeSelectorName={activeSelectorName}
            onChoosePage={onChoosePage}
          />
        }
        left={<div className="editor-container" ref={htmlEditorDOMRef} />}
        rightTop={<div className="editor-container" ref={selectorEditorDOMRef} />}
        rightBottom={<div className="editor-container" ref={outputEditorDOMRef} />}
      />
    </div>
  )
}
