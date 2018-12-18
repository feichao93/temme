import { UserInfo, Project } from '../types'
import { PageRecord } from '../ProjectPage/interfaces'

export async function saveHtml(pageId: number, content: string) {
  const response = await fetch('/api/update-html', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ pageId, content }),
  })
  if (!response.ok) {
    throw new Error(`${response.status} ${await response.text()}`)
  }
}

export async function saveSelector(pageId: number, selectorName: string, content: string) {
  const response = await fetch('/api/update-selector', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ pageId, name: selectorName, content }),
  })
  if (!response.ok) {
    throw new Error(`${response.status} ${await response.text()}`)
  }
}

export async function getProject(login: string, projectName: string) {
  const response = await fetch(`/api/project/${login}/${projectName}`)
  if (response.ok) {
    return { ok: true, project: await response.json() }
  } else {
    return { ok: false, reason: await response.text() }
  }
}

export async function addPage(projectId: number, pageName: string) {
  const response = await fetch('/api/add-page', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ projectId, name: pageName }),
  })
  if (response.ok) {
    const pageRecord: PageRecord = await response.json()
    return { ok: true, pageRecord }
  } else {
    return { ok: false, reason: await response.text() }
  }
}

export async function deletePage(pageId: number) {
  const response = await fetch('/api/delete-page', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ pageId }),
  })
  if (!response.ok) {
    throw new Error(`${response.status} ${await response.text()}`)
  }
}

export async function deleteSelector(pageId: number, selectorName: string) {
  const response = await fetch('/api/delete-selector', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ pageId, name: selectorName }),
  })
  if (!response.ok) {
    throw new Error(`${response.status} ${await response.text()}`)
  }
}

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
export async function addProject(name: string, description: string) {
  const res = await fetch('/api/add-project', {
    method: 'post',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ name, description }),
  })
  if (res.ok) {
    return true
  } else {
    throw new Error('创建新项目失败')
  }
}
export async function updateProject(projectId: number, name: string, description: string) {
  const res = await fetch('/api/update-project', {
    method: 'post',
    body: JSON.stringify({ projectId, name, description }),
    headers: {
      'content-type': 'application/json',
    },
  })
  if (res.ok) {
    return true
  } else {
    throw new Error(await res.text())
  }
}
export async function deleteProject(projectId: number) {
  const res = await fetch('/api/delete-project', {
    method: 'post',
    body: JSON.stringify({ projectId }),
    headers: {
      'content-type': 'application/json',
    },
  })
  if (res.ok) {
    return true
  } else {
    throw new Error(await res.text())
  }
}

export async function renamePage(projectId: number, pageId: number, name: string) {
  const res = await fetch('/api/rename-page', {
    method: 'post',
    body: JSON.stringify({ name, projectId, pageId }),
    headers: {
      'content-type': 'application/json',
    },
  })
  if (res.ok) {
    return true
  } else {
    throw new Error(await res.text())
  }
}
