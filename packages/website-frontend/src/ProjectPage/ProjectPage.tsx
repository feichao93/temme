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
import { CodeEditor, CTRL_S, getSelectorUri, INIT_EDITOR_OPTIONS, noop, getHtmlUri } from './utils'

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
      openSelector(activePageId, selectorTabItems[index].name)
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
            openSelector(activePageId, selectorTabItems[1].name)
          } else {
            openSelector(activePageId, selectorTabItems[index - 1].name)
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
    const handler = async () => {
      try {
        // 使用闭包来访问 onSaveHtmlRef.current 的最新值
        await onSaveHtmlRef.current()
      } catch (e) {
        dialogs.alert({ title: '', message: e.message })
      }
    }
    htmlEditor.addCommand(CTRL_S, handler, '')
    // monaco editor 不提供 removeCommand 方法，故这里不需要（也没办法）返回一个清理函数
  })
  useEffect(
    () => {
      if (activePageId === -1) {
        onSaveHtmlRef.current = noop
      } else {
        onSaveHtmlRef.current = () => saveHtml(activePageId)
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
    async function handler() {
      try {
        // 使用闭包来访问 onSaveSelectorRef.current 的最新值
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
        onSaveSelectorRef.current = () =>
          saveSelector(activePageId, selectorTabManager.activeTabName)
      } else {
        onSaveSelectorRef.current = noop
      }
    },
    [selectorTabManager.activeUri],
  )

  /** 获取 pageId 在编辑器中的 model 的值，将其保存到服务器
   * 然后更新 htmlTabInfo */
  async function saveHtml(pageId: number) {
    const uri = getHtmlUri(pageId)
    const uriObject = monaco.Uri.parse(uri)
    const model = monaco.editor.getModel(uriObject)
    const content = model.getValue()
    const nextInitAvid = model.getAlternativeVersionId()
    await server.saveHtml(activePageId, content)
    updateHtmlTabInfo(
      produce(info => {
        info.initAvid = nextInitAvid
      }),
    )
  }

  /** 获取 pageId/selectorName 在编辑器中的 model 的值，将其保存到服务器
   * 然后更新 selectorTabManager 和 project 的状态 */
  async function saveSelector(pageId: number, selectorName: string) {
    const uri = getSelectorUri(pageId, selectorName)
    const uriObject = monaco.Uri.parse(uri)
    const model = monaco.editor.getModel(uriObject)
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
            openSelector(firstPage.pageId, firstSelector.name)
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
    // 用户可能在各个编辑器尚未加载时 调整了浏览器窗口大小
    htmlEditorRef.current && htmlEditorRef.current.layout()
    selectorEditorRef.current && selectorEditorRef.current.layout()
    outputEditorRef.current && outputEditorRef.current.layout()
  }

  /** 在 html 编辑器中打开 pageId 对应的 html model */
  function openHtml(pageId: number) {
    const project = projectAtom.value
    const page = project.pages.find(p => p.pageId === pageId)
    const uriObject = monaco.Uri.parse(getHtmlUri(pageId))
    let model = monaco.editor.getModel(uriObject)
    if (model == null) {
      model = monaco.editor.createModel(page.html, 'html', uriObject)
      const avid = model.getAlternativeVersionId()
      updateHtmlTabInfo({ avid, initAvid: avid })
    }
    const editor = htmlEditorRef.current
    editor.setModel(model)
    setActivePageId(pageId)
  }

  /** 在 selector 编辑器中打开 pageId / selectorName 对应的 selector model */
  function openSelector(pageId: number, selectorName: string) {
    const project = projectAtom.value
    const page = project.pages.find(p => p.pageId === pageId)
    const selector = page.selectors.find(sel => sel.name === selectorName)
    const uri = getSelectorUri(pageId, selectorName)
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

      const isHtmlDirty = htmlTabInfo.initAvid !== htmlTabInfo.avid
      const dirtySelectors = selectorTabItems.filter(item => item.avid !== item.initAvid)

      const needSave = isHtmlDirty || dirtySelectors.length > 0
      if (needSave) {
        const option = await dialogs.ternary({
          message: 'HTML或部分选择器尚未保存，是否保存当前更改？',
        })
        if (option === 'cancel') {
          return
        }
        if (option === 'yes') {
          try {
            const saveHtmlPromise = isHtmlDirty ? saveHtml(activePageId) : Promise.resolve()
            const saveSelectorPromises = dirtySelectors.map(selector =>
              saveSelector(activePageId, selector.name),
            )
            await Promise.all([saveHtmlPromise, ...saveSelectorPromises])
          } catch (e) {
            dialogs.alert(e)
            return
          }
        }
      }

      // 销毁当前 page 下所有的 selector model
      selectorTabItems.forEach(item => {
        const uri = monaco.Uri.parse(item.uri)
        const model = monaco.editor.getModel(uri)
        model.dispose()
      })
      selectorTabManager.clear()

      const page = project.pages.find(p => p.pageId === pageId)
      openHtml(pageId)
      if (page.selectors.length > 0) {
        openSelector(pageId, page.selectors[0].name)
      } else {
        closeSelector()
      }
    },

    onChooseSelector(uri: string) {
      const page = projectAtom.value.pages.find(p => p.pageId === activePageId)
      const selector = page.selectors.find(sel => getSelectorUri(activePageId, sel.name) === uri)
      openSelector(activePageId, selector.name)
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

    async onRenamePage(pageId: number, oldName: string) {
      try {
        const project = projectAtom.value
        const newName = await dialogs.prompt({ message: '请输入新的名称', initValue: oldName })
        if (newName != null && newName !== oldName) {
          const result = await server.renamePage(project.projectId, pageId, newName)
          if (result) {
            setProjectAtom(
              produce(atom => {
                const project = atom.value
                const pageIndex = project.pages.findIndex(page => page.pageId === pageId)
                const page = project.pages[pageIndex]
                page.name = newName
              }),
            )
          }
        }
      } catch (e) {
        dialogs.alert({ message: '项目重命名失败' })
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
        const response = await fetch('/api/add-selector', {
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

    async onRenameSelector(pageId: number, selectorName: string) {
      try {
        const newName = await dialogs.prompt({ message: '请输入新的名称', initValue: selectorName })
        if (newName != null && newName !== selectorName) {
          const result = await server.renameSelector(pageId, selectorName, newName)
          if (result) {
            setProjectAtom(
              produce(atom => {
                const project = atom.value
                const page = project.pages.find(page => page.pageId === pageId)
                const selector = page.selectors.find(s => s.name === selectorName)
                selector.name = newName
              }),
            )
            selectorTabManager.updateTabName(pageId, selectorName, newName)
            const newUriObj = monaco.Uri.parse(getSelectorUri(pageId, newName))
            const oldUriObj = monaco.Uri.parse(getSelectorUri(pageId, selectorName))
            const model = monaco.editor.getModel(oldUriObj)
            monaco.editor.createModel(model.getValue(), null, newUriObj)
            model.dispose()
            if (selectorName === selectorTabManager.activeTabName) {
              openSelector(pageId, newName)
            }
          }
        }
      } catch (e) {
        dialogs.alert({ message: '重命名失败' })
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
