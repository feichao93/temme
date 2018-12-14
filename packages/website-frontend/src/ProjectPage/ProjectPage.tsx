// @ts-ignore
import * as monaco from 'monaco-editor'
// @ts-ignore
import temme from 'temme'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { RouteComponentProps } from 'react-router'
import { Link } from 'react-router-dom'
import Sidebar from './Sidebar'
import PageLayout from './PageLayout'
import { ProjectRecord } from './interfaces'
import * as server from '../utils/server'
import './ProjectPage.styl'

type CodeEditor = monaco.editor.IStandaloneCodeEditor

// TODO 应该用额外的字段来记录数据的加载状态
const EMPTY_PROJECT: ProjectRecord = {
  pages: [],
  createdAt: null,
  description: '',
  name: '',
  projectId: 0,
  updatedAt: '',
  userId: 0,
}

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
      value: '',
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
  // useEffect(() => {
  //   if (pages.length > 0) {
  //     onChoosePage(pages[0].pageId)
  //   }
  // }, [])

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

  const [project, setProject] = useState<ProjectRecord>(EMPTY_PROJECT)

  function fetchProject() {
    return fetch(`/api/project/${login}/${projectName}`).then(async res => {
      const json = await res.json()
      setProject(json)
      return json
    })
  }

  useEffect(() => {
    fetchProject().then((project: ProjectRecord) => {
      // 载入 project 内容之后自动选中第一个目录
      if (project.pages.length > 0) {
        const firstPage = project.pages[0]

        setActivePageId(firstPage.pageId)
        htmlEditorRef.current.setValue(firstPage.html)

        if (firstPage.selectors.length > 0) {
          const selector = firstPage.selectors[0]
          setActiveSelectorName(selector.name)
          selectorEditorRef.current.setValue(selector.content)
        }
      }
    })
  }, [])

  function layout() {
    htmlEditorRef.current.layout()
    selectorEditorRef.current.layout()
    outputEditorRef.current.layout()
  }

  function onChoosePage(pageId: number) {
    const page = project.pages.find(p => p.pageId === pageId)
    setActivePageId(pageId)
    htmlEditorRef.current.setValue(page.html)

    if (page.selectors.length > 0) {
      const selector = page.selectors[0]
      setActiveSelectorName(selector.name)
      selectorEditorRef.current.setValue(selector.content)
    }
  }

  async function onAddPage(pageName: string) {
    try {
      const result = await server.addPage(project.projectId, pageName)
      if (result.ok) {
        const nextPages = project.pages.concat([result.pageRecord])
        setProject({ ...project, pages: nextPages })
      } else {
        // TODO use the global dialog
        console.warn(result.reason)
      }
    } catch (e) {
      // TODO use the global dialog
      console.error(e)
    }
  }

  async function onDeletePage(pageId: number) {
    const page = project.pages.find(page => page.pageId === pageId)
    if (!confirm(`确定要删除 ${page.name} 吗？该页面内的选择器都将被清空`)) {
      return
    }
    // 乐观更新
    const nextPages = project.pages.filter(page => page.pageId !== pageId)
    setProject({ ...project, pages: nextPages })
    if (activePageId === pageId) {
      setActivePageId(-1)
    }

    try {
      const { ok, reason } = await server.deletePage(pageId)
      if (!ok) {
        // 更新失败，回滚
        setProject(project)
        console.warn(reason)
        return
      }
    } catch (e) {
      // 更新失败，回滚
      setProject(project)
      console.error(e)
    }
  }

  async function onAddSelector(selectorName: string) {
    console.assert(activePageId !== -1)
    try {
      // TODO add-file 这个路由有点不太对劲
      const response = await fetch('/api/add-file', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ pageId: activePageId, name: selectorName }),
      })
      if (!response.ok) {
        // TODO use the global dialog
        console.warn(await response.text())
        return
      }
      fetchProject()
    } catch (e) {
      // TODO use the global dialog
      console.error(e)
    }
  }

  function onChooseSelector(selectorName: string) {
    const page = project.pages.find(pg => pg.pageId === activePageId)
    const selector = page.selectors.find(sel => sel.name === selectorName)
    selectorEditorRef.current.setValue(selector.content)
    setActiveSelectorName(selectorName)
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
            project={project}
            onChooseSelector={onChooseSelector}
            activePageId={activePageId}
            activeSelectorName={activeSelectorName}
            onChoosePage={onChoosePage}
            onAddPage={onAddPage}
            onDeletePage={onDeletePage}
            onAddSelector={onAddSelector}
          />
        }
        left={<div className="editor-container" ref={htmlEditorDOMRef} />}
        rightTop={<div className="editor-container" ref={selectorEditorDOMRef} />}
        rightBottom={<div className="editor-container" ref={outputEditorDOMRef} />}
      />
    </div>
  )
}
