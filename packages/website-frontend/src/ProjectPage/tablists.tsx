import React from 'react'
import classNames from 'classnames'
import { FileIcon } from '../icons'
import {
  CloseDirtyIcon,
  CloseIcon,
  FileTypeHtmlIcon,
  FileTypeJsonIcon,
  FileTypeTSIcon,
} from './icons'
import './tablists.styl'

interface HtmlTablistProps {
  dirty: boolean
  onSave(): void
}

export const HtmlTablist = React.memo(({ dirty, onSave }: HtmlTablistProps) => (
  <div className="tablist">
    <div className="tab active">
      <FileTypeHtmlIcon />
      <span className="tabname">html</span>
      <span style={{ width: 16 }} />
    </div>
    {dirty && (
      <div className="tab-decoration" title="点击保存" onClick={onSave}>
        未保存
      </div>
    )}
  </div>
))

export const OutputTablist = React.memo(() => (
  <div className="tablist">
    <div className="tab active">
      <FileTypeJsonIcon />
      <span className="tabname">output</span>
      <span style={{ width: 16 }} />
    </div>
    <div className="tab">
      <FileTypeTSIcon />
      <span className="tabname">typings(wip)</span>
      <span style={{ width: 16 }} />
    </div>
  </div>
))

function isTabItemDirty(tabItem: TabItem) {
  return tabItem.avid !== tabItem.initAvid
}

export interface TabItem {
  uriString: string
  name: string
  avid: number
  initAvid: number
}

export interface SelectTabListProps {
  tabItems: TabItem[]
  activeIndex: number
  onChangeActiveIndex(nextIndex: number): void
  onClose(tabIndex: number): void
}

export function SelectTabList({
  activeIndex,
  tabItems,
  onChangeActiveIndex,
  onClose,
}: SelectTabListProps) {
  return (
    <div className="tablist selector-tablist">
      {tabItems.map((tabItem, index) => (
        <div
          key={index}
          className={classNames('tab', { active: index === activeIndex })}
          draggable
          onClick={() => onChangeActiveIndex(index)}
        >
          <FileIcon />
          <span className="tabname">{tabItem.name}</span>
          {React.createElement(isTabItemDirty(tabItem) ? CloseDirtyIcon : CloseIcon, {
            size: 16,
            onClick(e: any) {
              e.stopPropagation()
              onClose(index)
            },
          })}
        </div>
      ))}
    </div>
  )
}
