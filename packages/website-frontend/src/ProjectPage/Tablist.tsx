import React from 'react'
import classNames from 'classnames'
import { FileIcon } from '../icons'
import { CloseIcon } from './icons'
import './Tablist.styl'

export default function Tablist({ activeTab, tabs }: { tabs: string[]; activeTab: string }) {
  return (
    <div className="tablist">
      {tabs.map((tab, index) => (
        <div key={index} className={classNames('tab', { active: tab === activeTab })} draggable>
          <FileIcon />
          <span className="tabname">{tab}</span>
          <CloseIcon onClick={null} />
        </div>
      ))}
    </div>
  )
}
