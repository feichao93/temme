import classNames from 'classnames'
import { Map } from 'immutable'
import React from 'react'
import * as actions from './actions'
import { Action } from './actions'
import { AddFileIcon, AddFolderIcon, DeleteIcon, RenameIcon } from './icons'
import { EditorPageState, PageRecord, ProjectRecord } from './interfaces'
import './Sidebar.styl'
import { noop } from './utils'

export interface SidebarProps {
  state: EditorPageState
  dispatch(action: Action): void
}

// TODO
function getRandomPageName(project: ProjectRecord) {
  let n = 1
  while (true) {
    const name = `page-${n}`
    if (project.pages.every(p => p.name !== name)) {
      return name
    }
    n++
  }
}

function getRandomHtmlName() {
  return `selector-${Math.random().toFixed(3)}`
}

function getRandomSelectorName() {
  return `selector-${Math.random().toFixed(3)}`
}

export default function Sidebar({ state, dispatch }: SidebarProps) {
  const {
    activePageId: activeFolderId,
    projectAtom,
    htmlAtoms,
    selectorAtoms,
    activeHtmlId,
    activeSelectorId,
  } = state

  function wrap<ARGS extends any[]>(actionCreator: (...args: ARGS) => actions.Action) {
    return (...args: ARGS) => dispatch(actionCreator(...args))
  }

  const folderHandlers = {
    add: wrap(actions.requestAddFolder),
    delete: wrap(actions.requestDeleteFolder),
    choose: wrap(actions.openFolder),
    rename: wrap(actions.requestRenameFolder),
  }
  const htmlHandlers = {
    add: noop,
    choose: wrap(actions.openHtmlTab),
    delete: noop,
    rename: noop,
  }
  const selectorHandlers = {
    add: noop,
    choose: wrap(actions.openSelectorTab),
    delete: noop,
    rename: noop,
  }

  const folders =
    projectAtom.status === 'ready' ? projectAtom.value.pages : Map<number, PageRecord>()
  const description = projectAtom.status === 'ready' ? projectAtom.value.description : 'loading...'

  const activeFolder = folders.find(folder => folder.pageId === activeFolderId)

  // todo 假设所有的 atom 已经加载完成
  const visibleHtmls = htmlAtoms
    .map(atom => atom.value)
    .filter(html => html.folderId === activeFolderId)
  const visibleSelectors = selectorAtoms
    .map(atom => atom.value)
    .filter(selector => selector.folderId === activeFolderId)

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
      <div className="part pages-part">
        <div className="part-title">
          <span>Pages</span>
          <div className="actions">
            <AddFolderIcon
              onClick={() => folderHandlers.add(getRandomPageName(projectAtom.value), '')}
            />
          </div>
        </div>
        <div className="part-content">
          <ul className="list folder-list">
            {folders
              .sortBy(folder => folder.pageId)
              .map(folder => (
                <li
                  key={folder.pageId}
                  className={classNames({ active: folder.pageId === activeFolderId })}
                  onClick={() => folderHandlers.choose(folder.pageId)}
                >
                  <span className="folder-name">{folder.name}</span>
                  <span className="actions">
                    <RenameIcon
                      onClick={e => {
                        e.stopPropagation()
                        // TODO get new folder name from user input
                        folderHandlers.rename(folder.pageId, '')
                      }}
                    />
                    <DeleteIcon
                      onClick={e => {
                        e.stopPropagation()
                        // TODO 需要让用户确认删除
                        folderHandlers.delete(folder.pageId)
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
              onClick={() => selectorHandlers.add(getRandomHtmlName())}
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
                          htmlHandlers.delete(html.htmlId)
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
                          // TODO user confirmation
                          selectorHandlers.delete(selector.selectorId)
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
