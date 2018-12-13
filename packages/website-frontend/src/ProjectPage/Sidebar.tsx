import React, { MouseEventHandler } from 'react'
import classNames from 'classnames'
import { pages, project } from './test-data'
import './Sidebar.styl'

export interface SidebarProps {
  activePageId: number
  activeSelectorName: string
  onChoosePage(pageId: number): void
  onChooseSelector(selectorName: string): void
}

function AddFileIcon({ onClick }: { onClick: MouseEventHandler }) {
  return (
    <svg className="icon interactive" width="16" height="16" onClick={onClick}>
      <polygon
        fill="#C5C5C5"
        points="12,3 8,3 8,4 11,4 11,7 14,7 14,14 6,14 6,8 5,8 5,15 15,15 15,6"
      />
      <path
        fill="#89D185"
        d="M7 3.018h-2v-2.018h-1.981v2.018h-2.019v1.982h2.019v2h1.981v-2h2v-1.982z"
      />
    </svg>
  )
}

export default function Sidebar({
  activePageId,
  activeSelectorName,
  onChoosePage,
  onChooseSelector,
}: SidebarProps) {
  const activePage = pages.find(page => page.pageId === activePageId)

  return (
    <div className="sidebar">
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
        <div className="part-title">
          <span>Selectors</span>
          <div className="actions">
            <AddFileIcon onClick={() => console.log('add-file')} />
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
