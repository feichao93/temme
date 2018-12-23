import classNames from 'classnames'
import { Map } from 'immutable'
import React from 'react'
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

function Part({
  name,
  actions,
  children,
}: {
  name: string
  actions: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className={classNames('part', `part-${name}`)}>
      <div className="part-title">
        <span>{name}</span>
        <div className="actions">{actions}</div>
      </div>
      <div className="part-content">{children}</div>
    </div>
  )
}

function SimpleList({ children }: { children: React.ReactNode }) {
  return <ul className="list htmls-list">{children}</ul>
}

function SimpleListItem({
  text,
  active,
  onClick,
  actions,
}: {
  active: boolean
  onClick(): void
  text: string
  actions: React.ReactNode
}) {
  return (
    <li className={classNames({ active })} onClick={onClick}>
      <span className="html-name">{text}</span>
      <span className="actions">{actions}</span>
    </li>
  )
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
                    <RenameIcon onClick={() => folderHandlers.rename(folder.folderId, '')} />
                    <DeleteIcon onClick={() => folderHandlers.delete(folder.folderId)} />
                  </span>
                </li>
              ))
              .valueSeq()}
          </ul>
        </div>
      </div>

      <Part
        name="htmls"
        actions={
          <AddFileIcon
            disabled={activeFolder == null}
            onClick={() => htmlHandlers.add(getRandomHtmlName())}
          />
        }
      >
        <SimpleList>
          {visibleHtmls
            .sortBy(html => html.htmlId)
            .map(html => (
              <SimpleListItem
                key={html.htmlId}
                active={html.htmlId === activeHtmlId}
                onClick={() => htmlHandlers.choose(html.htmlId)}
                text={html.name}
                actions={
                  <>
                    <RenameIcon onClick={() => htmlHandlers.rename(html.htmlId, '')} />
                    <DeleteIcon onClick={() => htmlHandlers.delete(html.htmlId)} />
                  </>
                }
              />
            ))
            .valueSeq()}
        </SimpleList>
      </Part>

      <Part
        name="selectors"
        actions={
          <AddFileIcon
            disabled={activeFolder == null}
            onClick={() => selectorHandlers.add(getRandomSelectorName())}
          />
        }
      >
        <SimpleList>
          {visibleSelectors
            .sortBy(selector => selector.selectorId)
            .map(selector => (
              <SimpleListItem
                key={selector.selectorId}
                active={selector.selectorId === activeSelectorId}
                onClick={() => selectorHandlers.choose(selector.selectorId)}
                text={selector.name}
                actions={
                  <>
                    <RenameIcon onClick={() => selectorHandlers.rename(selector.selectorId, '')} />
                    <DeleteIcon onClick={() => selectorHandlers.delete(selector.selectorId)} />
                  </>
                }
              />
            ))
            .valueSeq()}
        </SimpleList>
      </Part>
    </div>
  )
}
