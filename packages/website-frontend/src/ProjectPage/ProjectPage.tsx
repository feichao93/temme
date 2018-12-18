import produce from 'immer'
import * as monaco from 'monaco-editor'
import React, { useEffect, useRef, useState } from 'react'
import { RouteComponentProps } from 'react-router'
import { Link } from 'react-router-dom'
import temme from 'temme'
import { useDialogs } from '../Dialog/dialogs'
import { Atom, atomReady } from '../utils/atoms'
import { useBodyOverflowHidden, useDidMount, useWillUnmount } from '../utils/common-hooks'
import debounce from '../utils/debounce'
import * as server from '../utils/server'
import EditorWrapper from './EditorWrapper'
import { ProjectRecord } from './interfaces'
import PageLayout from './PageLayout'
import './ProjectPage.styl'
import Sidebar from './Sidebar'
import { HtmlTablist, OutputTablist, SelectTabList } from './tablists'
import useTabManager from './useTabManager'
import { CodeEditor, CTRL_S, getSelectorUri, INIT_EDITOR_OPTIONS, noop } from './utils'

type ProjectPageProps = RouteComponentProps<{ login: string; projectName: string }>

export default function ProjectPage(props: ProjectPageProps) {
  const { login, projectName } = props.match.params
  const dialogs = useDialogs()

  const htmlEditorRef = useRef<CodeEditor>(null)
  const selectorEditorRef = useRef<CodeEditor>(null)
  const outputEditorRef = useRef<CodeEditor>(null)

  const [activePageId, setActivePageId] = useState(-1)

  const [htmlTabInfo, updateHtmlTabInfo] = useState({ initAvid: -1, avid: -1 })
  const selectorTabManager = useTabManager()
  const selectorTabItems = selectorTabManager.items
  const activeSelectorTabIndex = selectorTabManager.activeIndex

  const selectorTabListHandlers = {
    onChangeActiveIndex(index: number) {
      openSelector(activePageId, selectorTabItems[index].uri)
    },

    async onClose(index: number) {
      const tab = selectorTabManager.items[index]

      const needSave = tab.initAvid !== tab.avid
      if (needSave) {
        const option = await dialogs.ternary({ message: `是否将更改保存到 ${tab.name}` })
        if (option === 'cancel') {
          return
        }
        if (option === 'yes') {
          try {
            await saveSelector(activePageId, tab.name)
          } catch (e) {
            console.log(e)
            dialogs.alert({ title: '保存失败', message: e.message })
            return
          }
        }
      }

      // 如果正在关闭当前 tab 页，则需要自动打开另一个 tab 页
      if (selectorTabManager.activeTabName === tab.name) {
        if (selectorTabItems.length === 1) {
          closeSelector()
        } else {
          if (index === 0) {
            openSelector(activePageId, selectorTabItems[1].uri)
          } else {
            openSelector(activePageId, selectorTabItems[index - 1].uri)
          }
        }
      }
      selectorTabManager.remove(index)
      const model = monaco.editor.getModel(monaco.Uri.parse(tab.uri))
      model.dispose()
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
          console.error(e)
        }
      }

      // 首次计算结果
      compute()
      // 每当 html 或 选择器的内容发生变化时，重新计算结果
      const debouncedCompute = debounce(compute, 300)
      const disposable1 = htmlEditor.onDidChangeModelContent(debouncedCompute)
      const disposable2 = selectorEditor.onDidChangeModelContent(debouncedCompute)

      return () => {
        debouncedCompute.dispose()
        disposable1.dispose()
        disposable2.dispose()
      }
    },
    [selectorTabManager.activeUri],
  )

  // 监听 htmlEditor 中的变化，自动更新 htmlTabInfo 中的 avid
  useEffect(
    () => {
      const model = htmlEditorRef.current.getModel()
      if (model == null) {
        return
      }
      const disposable = model.onDidChangeContent(() => {
        const avid = model.getAlternativeVersionId()
        updateHtmlTabInfo(info => ({ ...info, avid }))
      })
      return () => {
        disposable.dispose()
      }
    },
    [activePageId],
  )

  const onSaveHtmlRef = useRef(noop)
  useDidMount(() => {
    const htmlEditor = htmlEditorRef.current
    // 使用闭包来访问 onSaveSelectorRef.current 的最新值
    const handler = () => onSaveHtmlRef.current()
    htmlEditor.addCommand(CTRL_S, handler, '')
    // monaco editor 不提供 removeCommand 方法，故这里不需要（也没办法）返回一个清理函数
  })
  useEffect(
    () => {
      if (activePageId === -1) {
        return
      }

      onSaveHtmlRef.current = async () => {
        const model = htmlEditorRef.current.getModel()
        const nextInitAvid = model.getAlternativeVersionId()
        try {
          await server.saveHtml(activePageId, model.getValue())
          updateHtmlTabInfo(info => ({ ...info, initAvid: nextInitAvid }))
        } catch (e) {
          await dialogs.alert(e.message)
        }
      }
    },
    [activePageId],
  )

  // 监听 selectorEditor 中的变化，自动更新 selectorTabItems 中的 avid
  useEffect(
    () => {
      const model = selectorEditorRef.current.getModel()
      if (model == null) {
        return
      }
      const disposable = model.onDidChangeContent(() => {
        selectorTabManager.updateActiveAvid(model.getAlternativeVersionId())
      })

      return () => {
        disposable.dispose()
      }
    },
    [activePageId, selectorTabManager.activeUri],
  )

  // monaco editor 不支持 removeCommand 操作
  // 所以我们这里使用 ref 来保存 command handler
  const onSaveSelectorRef = useRef(noop)
  useDidMount(() => {
    const selectorEditor = selectorEditorRef.current
    // 使用闭包来访问 onSaveSelectorRef.current 的最新值
    async function handler() {
      try {
        onSaveSelectorRef.current()
      } catch (e) {
        await dialogs.alert({ message: e.message })
      }
    }
    selectorEditor.addCommand(CTRL_S, handler, '')
    // monaco editor 不提供 removeCommand 方法，故这里不需要（也没办法）返回一个清理函数
  })
  useEffect(
    () => {
      if (selectorTabManager.activeUri) {
        onSaveSelectorRef.current = () => {
          return saveSelector(activePageId, selectorTabManager.activeTabName)
        }
      } else {
        onSaveSelectorRef.current = noop
      }
    },
    [selectorTabManager.activeUri],
  )

  /** 获取 pageId/selectorName 在编辑器中的 model 的值，将其保存到服务器
   * 然后更新 selectorTabManager 和 project 的状态 */
  async function saveSelector(pageId: number, selectorName: string) {
    const uri = getSelectorUri(pageId, selectorName)
    const parsedUri = monaco.Uri.parse(uri)
    const model = monaco.editor.getModel(parsedUri)
    const content = model.getValue()
    const nextInitAvid = model.getAlternativeVersionId()
    await server.saveSelector(pageId, selectorName, content)
    selectorTabManager.updateInitAvid(uri, nextInitAvid)
    setProjectAtom(
      produce(draft => {
        const page = draft.value.pages.find(page => page.pageId === pageId)
        const selector = page.selectors.find(sel => sel.name === selectorName)
        selector.content = content
      }),
    )
  }

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
            const firstSelector = firstPage.selectors[0]
            openSelector(firstPage.pageId, getSelectorUri(firstPage.pageId, firstSelector.name))
          }
        }
      }
    },
    [projectAtom.status],
  )

  // 在退出页面时，销毁所有的 model
  useWillUnmount(() => {
    monaco.editor.getModels().forEach((m: monaco.editor.ITextModel) => m.dispose())
  })

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
    let model = monaco.editor.getModel(uri)
    if (model == null) {
      model = monaco.editor.createModel(page.html, 'html', uri)
      const avid = model.getAlternativeVersionId()
      updateHtmlTabInfo({ avid, initAvid: avid })
    }
    const editor = htmlEditorRef.current
    editor.setModel(model)
    setActivePageId(pageId)
  }

  /** 在 selector 编辑器中打开 pageId / selectorName 对应的 selector model */
  // TODO 将 pageId 编码到 uri 中
  function openSelector(pageId: number, uri: string) {
    const project = projectAtom.value
    const page = project.pages.find(p => p.pageId === pageId)
    const selector = page.selectors.find(sel => getSelectorUri(page.pageId, sel.name) === uri)
    const uriObject = monaco.Uri.parse(uri)
    let model = monaco.editor.getModel(uriObject)
    if (model == null) {
      model = monaco.editor.createModel(selector.content, null, uriObject)
      const initAvid = model.getAlternativeVersionId()
      selectorTabManager.add(uri, selector.name, initAvid)
    }
    const editor = selectorEditorRef.current
    editor.setModel(model)
    editor.focus()
    selectorTabManager.setActiveUri(uri)
  }

  function closeSelector() {
    selectorEditorRef.current.setModel(null)
    selectorTabManager.setActiveUri(null)
  }

  const sidebarHandlers = {
    async onChoosePage(pageId: number) {
      const project = projectAtom.value

      // const isHtmlDirty = htmlTabInfo.initAvid !== htmlTabInfo.avid
      // const dirtySelectors = selectorTabItems.filter(item => item.avid !== item.initAvid)

      // const needSave = isHtmlDirty || dirtySelectors.length > 0
      // let shouldSave:boolean
      // if (needSave) {
      //   const commonDialogs: any = {}
      //   const option = await commonDialogs.save('是否将更改保存到 xxx 中？')
      //   if (option === 'cancel') {
      //     return
      //   }
      //   shouldSave = option === 'yes'
      // }
      // if (shouldSave) {
      //   // TODO executing all the save
      // }

      const page = project.pages.find(p => p.pageId === pageId)
      openHtml(pageId)

      // 销毁当前 page 下所有的 selector model
      selectorTabItems.forEach(item => {
        // TODO 如果当前 model 尚未保存，需要询问用户是否需要保存
        const uri = monaco.Uri.parse(item.uri)
        const model = monaco.editor.getModel(uri)
        model.dispose()
      })
      selectorTabManager.clear()

      if (page.selectors.length > 0) {
        openSelector(pageId, getSelectorUri(pageId, page.selectors[0].name))
      } else {
        closeSelector()
      }
    },

    onChooseSelector(uri: string) {
      openSelector(activePageId, uri)
    },

    async onAddPage(pageName: string) {
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
    },

    async onDeletePage(pageId: number) {
      const project = projectAtom.value
      const page = project.pages.find(page => page.pageId === pageId)
      if (!confirm(`确定要删除 ${page.name} 吗？该页面内的选择器都将被清空`)) {
        return
      }

      try {
        await server.deletePage(pageId)
        const nextPages = project.pages.filter(page => page.pageId !== pageId)
        setProject({ ...project, pages: nextPages })
        if (activePageId === pageId) {
          setActivePageId(-1)
        }
      } catch (e) {
        await dialogs.alert(e.message)
      }
    },

    async onAddSelector(selectorName: string) {
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
    },

    async onDeleteSelector(uri: string) {
      console.assert(activePageId !== -1)
      const project = projectAtom.value
      const pageIndex = project.pages.findIndex(page => page.pageId === activePageId)
      const page = project.pages[pageIndex]
      const selector = page.selectors.find(sel => getSelectorUri(page.pageId, sel.name) === uri)
      if (!(await dialogs.confirm({ message: `确定要删除选择器 '${selector.name}' 吗？` }))) {
        return
      }

      try {
        await server.deleteSelector(activePageId, selector.name)
        setProjectAtom(
          produce(atom => {
            const project = atom.value
            const pageIndex = project.pages.findIndex(page => page.pageId === activePageId)
            const page = project.pages[pageIndex]
            const selectorIndex = page.selectors.findIndex(sel => sel.name === uri)
            page.selectors.splice(selectorIndex, 1)
          }),
        )
        if (selectorTabManager.activeTabName === uri) {
          selectorTabManager.setActiveUri(null)
        }
      } catch (e) {
        await dialogs.alert(e.message)
      }
    },
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
            activePageId={activePageId}
            activeSelectorName={selectorTabManager.activeTabName}
            {...sidebarHandlers}
          />
        }
        left={
          <>
            <HtmlTablist
              dirty={htmlTabInfo.avid !== htmlTabInfo.initAvid}
              onSave={onSaveHtmlRef.current}
            />
            <EditorWrapper editorRef={htmlEditorRef} options={INIT_EDITOR_OPTIONS.html} />
          </>
        }
        rightTop={
          <>
            <SelectTabList
              tabItems={selectorTabItems}
              activeIndex={activeSelectorTabIndex}
              {...selectorTabListHandlers}
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
