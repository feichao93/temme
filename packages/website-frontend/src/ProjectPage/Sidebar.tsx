import React from 'react'
import classNames from 'classnames'
import { PageRecord, ProjectRecord } from './interfaces'
import { AddFileIcon, AddFolderIcon, DeleteIcon, RenameIcon } from './icons'
import './Sidebar.styl'

export interface SidebarProps {
  project: ProjectRecord
  activePageId: number
  activeSelectorName: string
  onChoosePage(pageId: number): void
  onChooseSelector(selectorName: string): void
  onAddPage(pageName: string): void
  onDeletePage(pageId: number): void
  onAddSelector(selectorName: string): void
  onDeleteSelector(selectorName: string): void
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
  project,
  activePageId,
  activeSelectorName,
  onChoosePage,
  onChooseSelector,
  onAddPage,
  onDeletePage,
  onAddSelector,
  onDeleteSelector,
}: SidebarProps) {
  const pages = project == null ? [] : project.pages
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
          <div className="description">{project.description}</div>
        </div>
      </div>
      <div className="part pages-part">
        <div className="part-title">
          <span>Pages</span>
          <div className="actions">
            <AddFolderIcon onClick={() => onAddPage(getRandomPageName(project))} />
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
                      alert('仍在实现中')
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
                  onClick={() => onChooseSelector(sel.name)}
                >
                  <span className="selector-name">{sel.name}</span>
                  <span className="actions">
                    <RenameIcon
                      onClick={e => {
                        e.stopPropagation()
                        alert('仍在实现中')
                      }}
                    />
                    <DeleteIcon
                      onClick={e => {
                        e.stopPropagation()
                        onDeleteSelector(sel.name)
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
