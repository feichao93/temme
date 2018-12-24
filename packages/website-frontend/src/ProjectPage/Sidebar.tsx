import classNames from 'classnames'
import { Map } from 'immutable'
import React from 'react'
import * as actions from './actions'
import { Action } from './actions'
import { AddFileIcon, AddFolderIcon, DeleteIcon, RenameIcon } from './icons'
import { FolderRecord, State } from './interfaces'
import './Sidebar.styl'

export interface SidebarProps {
  state: State
  dispatch(action: Action): void
}

interface PartProps {
  name: string
  actions: React.ReactNode
  children: React.ReactNode
}
function Part({ name, actions, children }: PartProps) {
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

interface SimpleListItemProps {
  active: boolean
  onClick(): void
  text: string
  actions: React.ReactNode
}
function SimpleListItem({ text, active, onClick, actions }: SimpleListItemProps) {
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
            <AddFolderIcon onClick={wrap(actions.requestAddFolder)} />
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
                  onClick={() => dispatch(actions.openFolder(folder.folderId))}
                >
                  <span className="folder-name">{folder.name}</span>
                  <span className="actions">
                    <RenameIcon
                      onClick={() => dispatch(actions.requestUpdateFolder(folder.folderId))}
                    />
                    <DeleteIcon
                      onClick={() => dispatch(actions.requestDeleteFolder(folder.folderId))}
                    />
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
            onClick={() => dispatch(actions.requestAddHtml())}
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
                onClick={() => dispatch(actions.openHtmlTab(html.htmlId))}
                text={html.name}
                actions={
                  <>
                    <RenameIcon onClick={() => dispatch(actions.requestRenameHtml(html.htmlId))} />
                    <DeleteIcon onClick={() => dispatch(actions.requestDeleteHtml(html.htmlId))} />
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
            onClick={() => dispatch(actions.requestAddSelector())}
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
                onClick={() => dispatch(actions.openSelectorTab(selector.selectorId))}
                text={selector.name}
                actions={
                  <>
                    <RenameIcon
                      onClick={() => dispatch(actions.requestRenameSelector(selector.selectorId))}
                    />
                    <DeleteIcon
                      onClick={() => dispatch(actions.requestDeleteSelector(selector.selectorId))}
                    />
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
