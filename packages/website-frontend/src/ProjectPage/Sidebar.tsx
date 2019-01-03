import classNames from 'classnames'
import { Map } from 'immutable'
import React from 'react'
import * as actions from './actions'
import { Action } from './actions'
import {
  AddFileIcon,
  AddFolderIcon,
  ContinueIcon,
  DeleteIcon,
  DownloadIcon,
  FolderIcon,
  FolderOpenIcon,
  RenameIcon,
} from './icons'
import { FolderRecord, State } from './interfaces'
import './Sidebar.styl'

export interface SidebarProps {
  state: State
  dispatch(action: Action): void
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
  const {
    activeFolderId,
    project,
    htmls,
    selectors,
    activeHtmlId,
    activeSelectorId,
    sidebarView,
  } = state

  // TODO 有更好的方法判断 project 是否加载完毕
  const folders = project.projectId > 0 ? project.folders : Map<number, FolderRecord>()
  const name = project.projectId > 0 ? project.name : 'loading...'
  const description = project.projectId > 0 ? project.description : 'loading...'

  const activeFolder = folders.find(folder => folder.folderId === activeFolderId)
  const visibleHtmls = htmls.filter(html => html.folderId === activeFolderId)
  const visibleSelectors = selectors.filter(selector => selector.folderId === activeFolderId)

  return (
    <div className="sidebar">
      <header>
        <h1 className="title">
          <span>{name}</span>
          <div className="actions">
            <DownloadIcon size={16} onClick={() => console.log('downloading...')} />
          </div>
        </h1>
        <p className="description">{description}</p>
      </header>
      <div
        className="view-container"
        style={{ transform: `translate(${sidebarView === 'folders-view' ? 0 : -100}%, 0)` }}
      >
        {renderFoldersView()}
        {renderFilesView()}
      </div>
    </div>
  )

  function renderFoldersView() {
    return (
      <div className="view folders-view">
        <div className="view-title">
          <h2>文件夹列表</h2>
          <div className="actions">
            <AddFolderIcon onClick={() => dispatch(actions.requestAddFolder())} />
          </div>
        </div>
        <div className="view-content">
          <ul className="folder-list">
            {folders
              .sortBy(folder => folder.folderId)
              .map(folder => (
                <li
                  key={folder.folderId}
                  className={classNames({ active: folder.folderId === activeFolderId })}
                  onClick={() =>
                    dispatch(
                      actions.openFolder(folder.folderId, folder.folderId !== activeFolderId),
                    )
                  }
                >
                  {folder.folderId === activeFolderId ? <FolderOpenIcon /> : <FolderIcon />}
                  <div className="text">
                    <div className="folder-name">{folder.name}</div>
                    <div className="folder-description">{folder.description || '暂无描述'}</div>
                  </div>
                  <span className="actions" style={{ marginRight: 8 }}>
                    <RenameIcon
                      onClick={() => dispatch(actions.requestUpdateFolder(folder.folderId))}
                    />
                    <DeleteIcon
                      onClick={() => dispatch(actions.requestDeleteFolder(folder.folderId))}
                    />
                    <ContinueIcon
                      onClick={() => dispatch(actions.openFolder(folder.folderId, false))}
                    />
                  </span>
                </li>
              ))
              .valueSeq()}
          </ul>
        </div>
      </div>
    )
  }

  function renderFilesView() {
    return (
      <div className="view files-view">
        <div className="view-title">
          <h2
            style={{ cursor: 'pointer', flexGrow: 1 }}
            onClick={() => dispatch(actions.useSidebarView('folders-view'))}
          >
            {activeFolder ? activeFolder.name : '加载中...'}
            <span style={{ fontWeight: 'normal', fontSize: 12, color: '#999' }}>
              （点击此处返回文件夹列表）
            </span>
          </h2>
        </div>
        <div className="view-content">
          <section>
            <div className="section-title">
              <span>htmls 列表</span>
              <div className="actions">
                <AddFileIcon
                  disabled={activeFolder == null}
                  onClick={() => dispatch(actions.requestAddHtml())}
                />
              </div>
            </div>
            <div className="simple-list">
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
                        <RenameIcon
                          onClick={() => dispatch(actions.requestRenameHtml(html.htmlId))}
                        />
                        <DeleteIcon
                          onClick={() => dispatch(actions.requestDeleteHtml(html.htmlId))}
                        />
                      </>
                    }
                  />
                ))
                .valueSeq()}
            </div>
          </section>

          <section style={{ marginTop: 16 }}>
            <div className="section-title">
              <span>选择器列表</span>
              <div className="actions">
                <AddFileIcon
                  disabled={activeFolder == null}
                  onClick={() => dispatch(actions.requestAddSelector())}
                />
              </div>
            </div>
            <div className="simple-list">
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
                          onClick={() =>
                            dispatch(actions.requestRenameSelector(selector.selectorId))
                          }
                        />
                        <DeleteIcon
                          onClick={() =>
                            dispatch(actions.requestDeleteSelector(selector.selectorId))
                          }
                        />
                      </>
                    }
                  />
                ))
                .valueSeq()}
            </div>
          </section>
        </div>
      </div>
    )
  }
}
