import { List } from 'immutable'
import { ProjectRecord, PageRecord } from '../ProjectPage/interfaces'
import { Project, UserInfo } from '../types'

export async function savePage(page: PageRecord) {
  const { pageId, html, selector } = page
  const response = await fetch('/api/update-page', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ pageId, html, selector }),
  })
  if (!response.ok) {
    throw new Error(`${response.status} ${await response.text()}`)
  }
}

export async function getProject(login: string, projectName: string) {
  const response = await fetch(`/api/project/${login}/${projectName}`)
  if (!response.ok) {
    throw new Error(`${response.status} ${await response.text()}`)
  }
  const json = await response.json()

  const project = new ProjectRecord(json.project)
  const pages = List(json.pages).map((p: any) => new PageRecord(p))

  return { project, pages }
}

export async function addPage(projectId: number, name: string) {
  const response = await fetch('/api/add-page', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ projectId, name: name, description: '' }),
  })
  if (response.ok) {
    const json = await response.json()
    return new PageRecord(json)
  } else {
    throw new Error(`${response.status} ${await response.text()}`)
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

export async function logout() {
  const response = await fetch('/api/logout', { method: 'POST' })
  if (response.ok) {
    return true
  } else {
    throw new Error(`${response.status} ${await response.text()}`)
  }
}

export async function getClientId() {
  const response = await fetch('/api/client-id')
  if (response.ok) {
    const { clientId }: { clientId: number } = await response.json()
    return { clientId }
  } else {
    throw new Error(`${response.status} ${await response.text()}`)
  }
}

export async function getMyInfo() {
  const response = await fetch('/api/my-info')
  if (response.ok) {
    const { login: username, userId }: { login: string; userId: number } = await response.json()
    return { username, userId }
  } else {
    throw new Error(`${response.status} ${await response.text()}`)
  }
}

// 获取用户的详细信息
export async function getUserInfo(username: string): Promise<UserInfo> {
  const response = await fetch(`/api/user-info/${username}`)
  if (response.ok) {
    return response.json()
  } else {
    throw new Error(`${response.status} ${await response.text()}`)
  }
}

export async function getUserProjects(username: string) {
  const response = await fetch(`/api/user-info/${username}/projects`)
  if (response.ok) {
    return (await response.json()) as Project[]
  } else {
    throw new Error(`${response.status} ${await response.text()}`)
  }
}

export async function addProject(name: string, description: string): Promise<Project> {
  const response = await fetch('/api/add-project', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name, description }),
  })
  if (response.ok) {
    return response.json()
  } else {
    throw new Error(`${response.status} ${await response.text()}`)
  }
}

export async function updateProjectMeta(projectId: number, name: string, description: string) {
  const response = await fetch('/api/update-project-meta', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ projectId, name, description }),
  })
  if (response.ok) {
    return true
  } else {
    throw new Error(`${response.status} ${await response.text()}`)
  }
}

export async function deleteProject(projectId: number) {
  const response = await fetch('/api/delete-project', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ projectId }),
  })
  if (response.ok) {
    return true
  } else {
    throw new Error(`${response.status} ${await response.text()}`)
  }
}

export async function updatePageMeta(pageId: number, name: string) {
  const response = await fetch('/api/update-page-meta', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ pageId, name }),
  })
  if (response.ok) {
    return true
  } else {
    throw new Error(`${response.status} ${await response.text()}`)
  }
}
