import React from 'react'
import { folders, project } from './test-data'
import './Sidebar.styl'

export interface SidebarProps {
  width: string
  openFile(folderId: number, filename: string): void
}

export default function Sidebar({ width, openFile }: SidebarProps) {
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
      <div className="part folders-part">
        <div className="part-title">Folders</div>
        <div className="part-content">
          <div className="folder-list">
            {folders.map(fld => (
              <div key={fld.folderId} className="folder-item">
                <div className="folder-name">{fld.name}</div>
                <div className="file-list">
                  {fld.files.map(file => (
                    <div
                      key={file.filename}
                      className="file-item"
                      onClick={() => openFile(fld.folderId, file.filename)}
                    >
                      {file.filename}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
