import React from 'react'
import classNames from 'classnames'
import { pages, project } from './test-data'
import './Sidebar.styl'

export interface SidebarProps {
  width: string
  activePageId: number
  activeSelectorName: string
  onChoosePage(pageId: number): void
  onChooseSelector(selectorName: string): void
}

export default function Sidebar({
  width,
  activePageId,
  activeSelectorName,
  onChoosePage,
  onChooseSelector,
}: SidebarProps) {
  const activePage = pages.find(page => page.pageId === activePageId)

  return (
    <div className="sidebar" style={{ width }}>
      <div className="header">
        <div className="title">PROJECT</div>
        <div>DOWNLOAD</div>
      </div>
      <div className="part">
        <div className="part-title">Info</div>
        <div className="part-content">
          <div className="description">{project.description}</div>
        </div>
      </div>
      <div className="part pages-part">
        <div className="part-title">Pages</div>
        <div className="part-content">
          <ul className="list page-list">
            {pages.map(page => (
              <li
                key={page.pageId}
                className={classNames({ active: page.pageId === activePageId })}
              >
                <div className="folder-name" onClick={() => onChoosePage(page.pageId)}>
                  {page.name}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="part selectors-page">
        <div className="part-title">Selectors</div>
        <div className="part-content">
          {activePage && (
            <ul className="list selectors-list">
              {activePage.selectors.map(sel => (
                <li
                  key={sel.name}
                  className={classNames({ active: sel.name === activeSelectorName })}
                  onClick={() => onChooseSelector(sel.name)}
                >
                  {sel.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
