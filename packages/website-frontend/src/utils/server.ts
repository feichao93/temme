import { UserInfo, Project } from '../types'

export async function logout() {
  const res = await fetch('/api/logout')
  if (res.ok) {
    return true
  } else {
    throw new Error(await res.text())
  }
}

export async function getClientId() {
  const res = await fetch('/api/client-id')
  if (res.ok) {
    const { clientId }: { clientId: number } = await res.json()
    return { clientId }
  } else {
    throw new Error('无法连接到服务器')
  }
}

export async function getMyInfo() {
  const res = await fetch('/api/my-info')
  if (res.ok) {
    const { login: username, userId }: { login: string; userId: number } = await res.json()
    return { username, userId }
  } else {
    throw new Error(await res.text())
  }
}
// 获取用户的详细信息
export async function getDetailInfo(username: string) {
  const res = await fetch(`/api/user-info/${username}`)
  if (res.ok) {
    const {
      id,
      location,
      email,
      bio,
      name,
      avatar_url,
      login,
      html_url,
    } = (await res.json()) as UserInfo
    return { id, location, email, bio, name, avatar_url, login, html_url }
  } else {
    throw new Error(await res.text())
  }
}

export async function getUserProjects(username: string) {
  const res = await fetch(`/api/user-info/${username}/projects`)
  if (res.ok) {
    return (await res.json()) as Project[]
  } else {
    throw new Error(await res.text())
  }
}
