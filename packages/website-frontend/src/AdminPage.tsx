import { Button, Code, Tab, Tabs } from '@blueprintjs/core'
import React, { useEffect, useState } from 'react'
import { Redirect } from 'react-router'
import { Link } from 'react-router-dom'
import './AdminPage.styl'
import Header from './Header'
import { ProjectRecord } from './types'
import { useSession } from './utils/session'

enum TabId {
  dataManagement,
  trafficStat,
  hotProjects,
}

function getPageCount(project: any) {
  return project.pageIds.length
}

function DataManagementTab() {
  const [users, setUsers] = useState<any[]>([]) // TODO 完善类型信息

  useEffect(() => {
    const url = new URL('/api/admin/list-users', document.URL)
    url.searchParams.set('skip', String(0))
    url.searchParams.set('limit', String(20))
    fetch(url.href).then(response => {
      if (response.ok) {
        response.json().then(setUsers)
      } else {
        throw new Error()
      }
    })
  }, [])

  return (
    <ul className="user-list">
      {users.map(user => (
        <li key={user.username}>
          <div className="user-info">
            <Link to={`/@${user.username}`}>
              <img className="avatar" src={user.userInfo.avatar_url} alt="avatar-icon" />
            </Link>
            <span className="username">{user.username}</span>
          </div>
          <div className="project-list-wrapper">
            <div style={{ fontWeight: 'bold' }}>项目列表({user.projects.length})：</div>
            <ul className="project-list">
              {user.projects.map((project: ProjectRecord, index: number) => (
                <li key={project._id}>
                  {index + 1}. <Code>{getPageCount(project)}</Code> {project.name}
                  <Link to={`/@${user.username}/${project.name}`}>
                    <Button style={{ marginLeft: 4 }} minimal small icon="eye-open" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default function AdminPage() {
  const session = useSession()

  const [selectedTabId, setSelectTabId] = useState(TabId.dataManagement)

  if (!session.connected) {
    return null
  }
  if (!session.isAdmin) {
    return <Redirect to="/" />
  }

  return (
    <div className="admin-page">
      <Header />
      <main>
        <Tabs
          id="admin-tabs"
          vertical
          onChange={(x: TabId) => setSelectTabId(x)}
          selectedTabId={selectedTabId}
        >
          <Tab
            panelClassName="fg1"
            id={TabId.dataManagement}
            title="用户与项目管理"
            panel={<DataManagementTab />}
          />
          <Tab id={TabId.trafficStat} title="查看最近流量" panel={<h1>仍在开发中...</h1>} />
          <Tab id={TabId.hotProjects} title="推荐项目配置" panel={<h1>仍在开发中...</h1>} />
        </Tabs>
      </main>
    </div>
  )
}
