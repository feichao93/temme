import React from 'react'
import classNames from 'classnames'
import { PageRecord, ProjectRecord } from './interfaces'
import { AddFileIcon, AddFolderIcon, DeleteIcon, RenameIcon } from './icons'
import { Atom } from '../utils/atoms'
import './Sidebar.styl'
import { getSelectorUri } from './utils'

export interface SidebarProps {
  projectAtom: Atom<ProjectRecord>
  activePageId: number
  activeSelectorName: string
  onChoosePage(pageId: number): void
  onChooseSelector(uri: string): void
  onAddPage(pageName: string): void
  onDeletePage(pageId: number): void
  onRenamePage(pageId: number, oldName: string): void
  onAddSelector(selectorName: string): void
  onDeleteSelector(pageId: number, selectorName: string): void
  onRenameSelector(pageId: number, selectorName: string): void
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
function getRandomSelectorName(page: PageRecord) {
  let n = 1
  while (true) {
    const name = `selector-${n}`
    if (page.selectors.every(s => s.name !== name)) {
      return name
    }
    n++
  }
}

export default function Sidebar({
  projectAtom,
  activePageId,
  activeSelectorName,
  onChoosePage,
  onChooseSelector,
  onAddPage,
  onDeletePage,
  onRenamePage,
  onAddSelector,
  onDeleteSelector,
  onRenameSelector,
}: SidebarProps) {
  const pages = projectAtom.status === 'ready' ? projectAtom.value.pages : []
  const description = projectAtom.status === 'ready' ? projectAtom.value.description : 'loading...'

  const activePage = pages.find(page => page.pageId === activePageId)

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
            <AddFolderIcon onClick={() => onAddPage(getRandomPageName(projectAtom.value))} />
          </div>
        </div>
        <div className="part-content">
          <ul className="list page-list">
            {pages.map(page => (
              <li
                key={page.pageId}
                className={classNames({ active: page.pageId === activePageId })}
                onClick={() => onChoosePage(page.pageId)}
              >
                <span className="folder-name">{page.name}</span>
                <span className="actions">
                  <RenameIcon
                    onClick={e => {
                      e.stopPropagation()
                      onRenamePage(page.pageId, page.name)
                    }}
                  />
                  <DeleteIcon
                    onClick={e => {
                      e.stopPropagation()
                      onDeletePage(page.pageId)
                    }}
                  />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="part selectors-part">
        <div className="part-title">
          <span>Selectors</span>
          <div className="actions">
            <AddFileIcon
              disabled={activePage == null}
              onClick={() => onAddSelector(getRandomSelectorName(activePage))}
            />
          </div>
        </div>
        <div className="part-content">
          {activePage && (
            <ul className="list selectors-list">
              {activePage.selectors.map(sel => (
                <li
                  key={sel.name}
                  className={classNames({ active: sel.name === activeSelectorName })}
                  onClick={() => onChooseSelector(getSelectorUri(activePageId, sel.name))}
                >
                  <span className="selector-name">{sel.name}</span>
                  <span className="actions">
                    <RenameIcon
                      onClick={e => {
                        e.stopPropagation()
                        onRenameSelector(activePageId, sel.name)
                      }}
                    />
                    <DeleteIcon
                      onClick={e => {
                        e.stopPropagation()
                        onDeleteSelector(activePageId, sel.name)
                      }}
                    />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
