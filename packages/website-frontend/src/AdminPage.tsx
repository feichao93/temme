import React from 'react'
import { Redirect } from 'react-router'
import { useSession } from './utils/session'

export default function AdminPage() {
  const session = useSession()

  if (!session.connected) {
    return null
  }
  if (!session.isAdmin) {
    return <Redirect to="/" />
  }

  return (
    <div style={{fontSize: 40}}>
      <h2>管理员页面正在开发中。功能列表：</h2>
      <ul>
        <li>浏览网站用户与项目列表</li>
        <li>封禁用户或项目</li>
        <li>查看网站最近流量</li>
        <li>配置「推荐项目」</li>
      </ul>
    </div>
  )
}
