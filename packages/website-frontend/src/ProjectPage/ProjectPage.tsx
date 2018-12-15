// @ts-ignore
import * as monaco from 'monaco-editor'
// @ts-ignore
import temme from 'temme'
import React, { useEffect, useRef, useState } from 'react'
import { RouteComponentProps } from 'react-router'
import { Link } from 'react-router-dom'
import Sidebar from './Sidebar'
import PageLayout from './PageLayout'
import { ProjectRecord } from './interfaces'
import * as server from '../utils/server'
import { HtmlTablist, SelectTabList, OutputTablist } from './tablists'
import { useBodyOverflowHidden, useDidMount } from '../utils/common-hooks'
import debounce from '../utils/debounce'
import { Atom, atomReady } from '../utils/atoms'
import { CodeEditor, INIT_EDITOR_OPTIONS } from './utils'
import EditorWrapper from './EditorWrapper'
import './ProjectPage.styl'

export default function ProjectPage(
  props: RouteComponentProps<{ login: string; projectName: string }>,
) {
  const { login, projectName } = props.match.params

  const htmlEditorRef = useRef<CodeEditor>(null)
  const selectorEditorRef = useRef<CodeEditor>(null)
  const outputEditorRef = useRef<CodeEditor>(null)

  const [activePageId, setActivePageId] = useState(-1)
  const [activeSelectorName, setActiveSelectorName] = useState('')

  // selTabInfo 总是与当前 page 已打开的 selector model 相对应
  // TODO 利用该对应关系来优化代码，例如 将该变量重命名为 aliveSelectorModelInfoList
  const [selTabInfo, updateSelTabInfo] = useState<
    { uriString: string; name: string; initAvid: number; avid: number }[]
  >([])
  const selectorTabItems = selTabInfo.map(t => ({ ...t, dirty: t.initAvid !== t.avid }))
  const activeSelectorTabIndex = selectorTabItems.findIndex(
    item => item.name === activeSelectorName,
  )
  const onChangeActiveSelectorTabIndex = (index: number) => {
    openSelector(activePageId, selectorTabItems[index].name)
  }

  const onCloseSelectorTab = (index: number) => {
    const info = selTabInfo[index]

    // TODO 如果当前文件尚未保存，需要询问用户是否需要保存

    if (activeSelectorName === info.name) {
      // 如果正在关闭当前 tab 页，则需要自动打开另一个 tab 页
      if (selTabInfo.length === 1) {
        closeSelector()
      } else {
        if (index === 0) {
          openSelector(activePageId, selTabInfo[1].name)
        } else {
          openSelector(activePageId, selTabInfo[index - 1].name)
        }
      }
    }
    selTabInfoUpdaters.remove(index)
    const model = monaco.editor.getModel(monaco.Uri.parse(info.uriString))
    model.dispose()
  }

  const selTabInfoUpdaters = {
    add(uriString: string, name: string, avid: number) {
      updateSelTabInfo(list => list.concat([{ uriString, name, initAvid: avid, avid }]))
    },
    remove(index: number) {
      updateSelTabInfo(list => {
        const slice = list.slice()
        slice.splice(index, 1)
        return slice
      })
    },
    updateAvid(uriString: string, avid: number) {
      updateSelTabInfo(list =>
        list.map(item => (item.uriString === uriString ? { ...item, avid } : item)),
      )
    },
    clear() {
      updateSelTabInfo([])
    },
  }

  // 将 body.style.overflow 设置为 hidden
  // 防止 monaco 编辑器中部分元素导致的额外滚动条
  useBodyOverflowHidden()

  // 监听 htmlEditor 和 selectorEditor 中的变化，自动重新计算 output
  useEffect(
    () => {
      const htmlEditor = htmlEditorRef.current
      const selectorEditor = selectorEditorRef.current
      const outputEditor = outputEditorRef.current

      function compute() {
        try {
          const html = htmlEditor.getValue()
          const selector = selectorEditor.getValue()

          // TODO should use try-catch to catch parse/execution exceptions
          const result = temme(html, selector)
          const oldValue = outputEditor.getValue()
          const newValue = JSON.stringify(result, null, 2)
          if (oldValue !== newValue) {
            outputEditor.setValue(newValue)
          }
        } catch (e) {
          // TODO use the global dialog
          console.error(e)
        }
      }

      // 首次计算结果
      compute()
      // 每次 html 或 选择器的内容发生变化时，重新计算结果
      const debouncedCompute = debounce(compute, 300)
      const res1 = htmlEditor.onDidChangeModelContent(debouncedCompute)
      const res2 = selectorEditor.onDidChangeModelContent(debouncedCompute)

      return () => {
        res1.dispose()
        res2.dispose()
      }
    },
    [activePageId, activeSelectorName],
  )

  // 监听 selectorEditor 中的变化，自动更新 selTabInfo 中的 avid
  useEffect(
    () => {
      const selectorEditor = selectorEditorRef.current

      const disposable = selectorEditor.onDidChangeModelContent(() => {
        const model = selectorEditor.getModel()
        const uriString = model.uri.toString()
        selTabInfoUpdaters.updateAvid(uriString, model.getAlternativeVersionId())
      })

      return () => {
        disposable.dispose()
      }
    },
    [activePageId, activeSelectorName],
  )

  const [projectAtom, setProjectAtom] = useState<Atom<ProjectRecord>>({
    status: 'loading',
    value: null,
  })
  const setProject = (project: ProjectRecord) => setProjectAtom(atomReady(project))

  // 组件加载时，请求后端获取 project 的相关信息
  useDidMount(() => {
    server.getProject(login, projectName).then(({ ok, reason, project }) => {
      if (ok) {
        setProject(project)
      } else {
        alert(reason)
      }
    })
  })

  // 首次载入 project 内容之后，自动选中第一个目录和第一个选择器
  useEffect(
    () => {
      if (projectAtom.status === 'ready') {
        const project = projectAtom.value
        if (project.pages.length > 0) {
          const firstPage = project.pages[0]
          openHtml(firstPage.pageId)

          if (firstPage.selectors.length > 0) {
            openSelector(firstPage.pageId, firstPage.selectors[0].name)
          }
        }
      }
    },
    [projectAtom.status],
  )

  /** 让各个编辑器重新根据父元素的大小进行布局 */
  function layout() {
    htmlEditorRef.current.layout()
    selectorEditorRef.current.layout()
    outputEditorRef.current.layout()
  }

  /** 在 html 编辑器中打开 pageId 对应的 html model */
  function openHtml(pageId: number) {
    const project = projectAtom.value
    const page = project.pages.find(p => p.pageId === pageId)
    const uri = monaco.Uri.parse(`inmemory://html/${pageId}`)
    let htmlModel = monaco.editor.getModel(uri)
    if (htmlModel == null) {
      htmlModel = monaco.editor.createModel(page.html, 'html', uri)
    }
    setActivePageId(pageId)
    htmlEditorRef.current.setModel(htmlModel)
  }

  /** 在 selector 编辑器中打开 pageId / selectorName 对应的 selector model */
  function openSelector(pageId: number, selectorName: string) {
    const project = projectAtom.value
    const page = project.pages.find(p => p.pageId === pageId)
    const selector = page.selectors.find(sel => sel.name === selectorName)
    const uriString = `inmemory://selector/${pageId}/${selectorName}`
    const uri = monaco.Uri.parse(uriString)
    let selectorModel = monaco.editor.getModel(uri)
    if (selectorModel == null) {
      selectorModel = monaco.editor.createModel(selector.content, null, uri)
      const initAvid = selectorModel.getAlternativeVersionId()
      selTabInfoUpdaters.add(uriString, selectorName, initAvid)
    }
    selectorEditorRef.current.setModel(selectorModel)
    setActiveSelectorName(selector.name)
  }

  function closeSelector() {
    selectorEditorRef.current.setModel(null)
    setActiveSelectorName('')
  }

  function onChoosePage(pageId: number) {
    const project = projectAtom.value
    const page = project.pages.find(p => p.pageId === pageId)
    openHtml(pageId)

    // 销毁当前 page 下所有的 selector model
    selTabInfo.forEach(item => {
      // TODO 如果当前 model 尚未保存，需要询问用户是否需要保存
      const uri = monaco.Uri.parse(item.uriString)
      const model = monaco.editor.getModel(uri)
      model.dispose()
    })
    selTabInfoUpdaters.clear()

    if (page.selectors.length > 0) {
      openSelector(pageId, page.selectors[0].name)
    } else {
      closeSelector()
    }
  }

  function onChooseSelector(selectorName: string) {
    openSelector(activePageId, selectorName)
  }

  async function onAddPage(pageName: string) {
    try {
      const project = projectAtom.value
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
    const project = projectAtom.value
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

      // TODO 避免重新载入 project
      const { ok, reason, project } = await server.getProject(login, projectName)
      if (ok) {
        setProject(project)
      } else {
        alert(reason)
      }
    } catch (e) {
      // TODO use the global dialog
      console.error(e)
    }
  }

  async function onDeleteSelector(selectorName: string) {
    console.assert(activePageId !== -1)
    const project = projectAtom.value
    if (!confirm(`确定要删除选择器 '${selectorName}' 吗？`)) {
      return
    }
    const pageIndex = project.pages.findIndex(page => page.pageId === activePageId)
    const page = project.pages[pageIndex]
    const nextSelectors = page.selectors.filter(sel => sel.name != selectorName)

    // 乐观更新
    setProject({
      // TODO 使用 immutable-js / immer
      ...project,
      pages: [
        ...project.pages.slice(0, pageIndex),
        { ...page, selectors: nextSelectors },
        ...project.pages.slice(pageIndex + 1),
      ],
    })
    if (activeSelectorName === selectorName) {
      setActiveSelectorName('')
    }

    const { ok, reason } = await server.deleteSelector(activePageId, selectorName)
    if (!ok) {
      setProject(project)
      setActiveSelectorName(activeSelectorName)
      console.warn(reason)
    }
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
            projectAtom={projectAtom}
            onChooseSelector={onChooseSelector}
            activePageId={activePageId}
            activeSelectorName={activeSelectorName}
            onChoosePage={onChoosePage}
            onAddPage={onAddPage}
            onDeletePage={onDeletePage}
            onAddSelector={onAddSelector}
            onDeleteSelector={onDeleteSelector}
          />
        }
        left={
          <>
            <HtmlTablist />
            <EditorWrapper editorRef={htmlEditorRef} options={INIT_EDITOR_OPTIONS.html} />
          </>
        }
        rightTop={
          <>
            <SelectTabList
              tabItems={selectorTabItems}
              activeIndex={activeSelectorTabIndex}
              onChangeActiveIndex={onChangeActiveSelectorTabIndex}
              onClose={onCloseSelectorTab}
            />
            <EditorWrapper editorRef={selectorEditorRef} options={INIT_EDITOR_OPTIONS.selector} />
          </>
        }
        rightBottom={
          <>
            <OutputTablist />
            <EditorWrapper editorRef={outputEditorRef} options={INIT_EDITOR_OPTIONS.output} />
          </>
        }
      />
    </div>
  )
}
