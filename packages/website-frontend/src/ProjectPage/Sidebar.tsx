import classNames from 'classnames'
import { Map } from 'immutable'
import React from 'react'
import { useDialogs } from '../Dialog/dialogs'
import * as actions from './actions'
import { Action } from './actions'
import { AddFileIcon, AddFolderIcon, DeleteIcon, RenameIcon } from './icons'
import { EditorPageState, FolderRecord, ProjectRecord } from './interfaces'
import './Sidebar.styl'
import { noop } from './utils'

export interface SidebarProps {
  state: EditorPageState
  dispatch(action: Action): void
}

// TODO
function getRandomFolderName(project: ProjectRecord) {
  let n = 1
  while (true) {
    const name = `folder-${n}`
    if (project.folders.every(p => p.name !== name)) {
      return name
    }
    n++
  }
}

function getRandomHtmlName() {
  return `html-${Math.random().toFixed(3)}`
}

function getRandomSelectorName() {
  return `selector-${Math.random().toFixed(3)}`
}

export default function Sidebar({ state, dispatch }: SidebarProps) {
  const { activeFolderId, project, htmls, selectors, activeHtmlId, activeSelectorId } = state

  function wrap<ARGS extends any[]>(actionCreator: (...args: ARGS) => actions.Action) {
    return (...args: ARGS) => dispatch(actionCreator(...args))
  }

  // TODO 去掉 noop
  const folderHandlers = {
    add: wrap(actions.requestAddFolder),
    delete: wrap(actions.requestDeleteFolder),
    choose: wrap(actions.openFolder),
    rename: wrap(actions.requestRenameFolder),
  }
  const htmlHandlers = {
    add: wrap(actions.requestAddHtml),
    choose: wrap(actions.openHtmlTab),
    delete: wrap(actions.requestDeleteHtml),
    rename: noop,
  }
  const selectorHandlers = {
    add: wrap(actions.requestAddSelector),
    choose: wrap(actions.openSelectorTab),
    delete: wrap(actions.requestDeleteSelector),
    rename: noop,
  }

  const dialogs = useDialogs()

  async function onDeleteFolder(folderId: number) {
    const folder = project.folders.get(folderId)
    const confirmed = await dialogs.confirm({
      title: '确认删除',
      message: `确定要删除文件夹 ${folder.name} 吗？该操作无法撤销`,
    })
    if (!confirmed) {
      return
    }
    folderHandlers.delete(folderId)
  }

  async function onDeleteHtml(htmlId: number) {
    const html = htmls.get(htmlId)
    const confirmed = await dialogs.confirm({
      title: '确认删除',
      message: `确定要删除文档 ${html.name} 吗？该操作无法撤销`,
    })
    if (!confirmed) {
      return
    }
    htmlHandlers.delete(htmlId)
  }

  async function onDeleteSelector(selectorId: number) {
    const selector = selectors.get(selectorId)
    const confirmed = await dialogs.confirm({
      title: '确认删除',
      message: `确定要删除选择器 ${selector.name} 吗？该操作无法撤销`,
    })
    if (!confirmed) {
      return
    }
    selectorHandlers.delete(selectorId)
  }

  // TODO 有更好的方法判断 project 是否加载完毕
  const folders = project.projectId > 0 ? project.folders : Map<number, FolderRecord>()
  const description = project.projectId > 0 ? project.description : 'loading...'

  const activeFolder = folders.find(folder => folder.folderId === activeFolderId)
  const visibleHtmls = htmls.filter(html => html.folderId === activeFolderId)
  const visibleSelectors = selectors.filter(selector => selector.folderId === activeFolderId)

  return (
    <div className="sidebar">
      <div className="header">
        <div className="title">PROJECT</div>
        <button>save html</button>
        <button>download</button>
      </div>
      <div className="part">
        <div className="part-title">Info</div>
        <div className="part-content">
          <div className="description">{description}</div>
        </div>
      </div>
      <div className="part folders-part">
        <div className="part-title">
          <span>Folders</span>
          <div className="actions">
            <AddFolderIcon onClick={() => folderHandlers.add(getRandomFolderName(project), '')} />
          </div>
        </div>
        <div className="part-content">
          <ul className="list folder-list">
            {folders
              .sortBy(folder => folder.folderId)
              .map(folder => (
                <li
                  key={folder.folderId}
                  className={classNames({ active: folder.folderId === activeFolderId })}
                  onClick={() => folderHandlers.choose(folder.folderId)}
                >
                  <span className="folder-name">{folder.name}</span>
                  <span className="actions">
                    <RenameIcon
                      onClick={e => {
                        e.stopPropagation()
                        // TODO get new folder name from user input
                        folderHandlers.rename(folder.folderId, '')
                      }}
                    />
                    <DeleteIcon
                      onClick={e => {
                        e.stopPropagation()
                        onDeleteFolder(folder.folderId)
                      }}
                    />
                  </span>
                </li>
              ))
              .valueSeq()}
          </ul>
        </div>
      </div>

      <div className="part htmls-part">
        <div className="part-title">
          <span>Htmls</span>
          <div className="actions">
            <AddFileIcon
              disabled={activeFolder == null}
              onClick={() => htmlHandlers.add(getRandomHtmlName())}
            />
          </div>
        </div>
        <div className="part-content">
          {!visibleHtmls.isEmpty() && (
            <ul className="list htmls-list">
              {visibleHtmls
                .sortBy(html => html.htmlId)
                .map(html => (
                  <li
                    key={html.htmlId}
                    className={classNames({ active: html.htmlId === activeHtmlId })}
                    onClick={() => htmlHandlers.choose(html.htmlId)}
                  >
                    <span className="html-name">{html.name}</span>
                    <span className="actions">
                      <RenameIcon
                        onClick={e => {
                          e.stopPropagation()
                          // TODO dialogs.prompt
                          htmlHandlers.rename(html.htmlId, '')
                        }}
                      />
                      <DeleteIcon
                        onClick={e => {
                          e.stopPropagation()
                          // TODO user confirmation
                          onDeleteHtml(html.htmlId)
                        }}
                      />
                    </span>
                  </li>
                ))
                .valueSeq()}
            </ul>
          )}
        </div>
      </div>

      <div className="part selectors-part">
        <div className="part-title">
          <span>Selectors</span>
          <div className="actions">
            <AddFileIcon
              disabled={activeFolder == null}
              onClick={() => selectorHandlers.add(getRandomSelectorName())}
            />
          </div>
        </div>
        <div className="part-content">
          {!visibleSelectors.isEmpty() && (
            <ul className="list selectors-list">
              {visibleSelectors
                .sortBy(selector => selector.selectorId)
                .map(selector => (
                  <li
                    key={selector.selectorId}
                    className={classNames({ active: selector.selectorId === activeSelectorId })}
                    onClick={() => selectorHandlers.choose(selector.selectorId)}
                  >
                    <span className="selector-name">{selector.name}</span>
                    <span className="actions">
                      <RenameIcon
                        onClick={e => {
                          e.stopPropagation()
                          // TODO dialogs.prompt
                          selectorHandlers.rename(selector.selectorId, '')
                        }}
                      />
                      <DeleteIcon
                        onClick={e => {
                          e.stopPropagation()
                          onDeleteSelector(selector.selectorId)
                        }}
                      />
                    </span>
                  </li>
                ))
                .valueSeq()}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
