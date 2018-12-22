import { Map } from 'immutable'
import { FolderRecord, HtmlRecord, ProjectRecord, SelectorRecord } from '../ProjectPage/interfaces'
import { Project, UserInfo } from '../types'

export async function saveHtml(htmlId: number, content: string) {
  const response = await fetch('/api/update-html', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ htmlId, content }),
  })
  if (!response.ok) {
    throw new Error(`${response.status} ${await response.text()}`)
  }
}

export async function saveSelector(selectorId: number, content: string) {
  const response = await fetch('/api/update-selector', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ selectorId, content }),
  })
  if (!response.ok) {
    throw new Error(`${response.status} ${await response.text()}`)
  }
}

export async function getProject(login: string, projectName: string) {
  const response = await fetch(`/api/project/${login}/${projectName}`)
  if (!response.ok) {
    throw new Error(`${response.status} ${response.text()}`)
  }
  const json = await response.json()

  const folders: Map<number, FolderRecord> = Map(
    json.project.folders.map((folder: any) => [folder.folderId, new FolderRecord(folder)]),
  )
  const project = new ProjectRecord({ ...json.project, folders })
  const htmls = Map(json.htmls.map((sel: any) => [sel.htmlId, new HtmlRecord(sel)]))
  const selectors = Map(json.selectors.map((sel: any) => [sel.selectorId, new SelectorRecord(sel)]))

  return { project, selectors, htmls }
}

export async function addFolder(projectId: number, name: string, description: string) {
  const response = await fetch('/api/add-folder', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ projectId, name: name, description }),
  })
  if (response.ok) {
    const json = await response.json()
    return new FolderRecord(json)
  } else {
    throw new Error(`${response.status} ${await response.text()}`)
  }
}

export async function deleteFolder(folderId: number) {
  const response = await fetch('/api/delete-folder', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ folderId }),
  })
  if (!response.ok) {
    throw new Error(`${response.status} ${await response.text()}`)
  }
}

export async function deleteHtml(htmlId: number) {
  const response = await fetch('/api/delete-html', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ htmlId }),
  })
  if (!response.ok) {
    throw new Error(`${response.status} ${await response.text()}`)
  }
}

export async function deleteSelector(selectorId: number) {
  const response = await fetch('/api/delete-selector', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ selectorId }),
  })
  if (!response.ok) {
    throw new Error(`${response.status} ${await response.text()}`)
  }
}

export async function logout() {
  const res = await fetch('/api/logout', { method: 'POST' })
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
    headers: { 'content-type': 'application/json' },
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
    headers: { 'content-type': 'application/json' },
  })
  if (res.ok) {
    return true
  } else {
    throw new Error(await res.text())
  }
}

export async function renameFolder(projectId: number, folderId: number, name: string) {
  const res = await fetch('/api/rename-folder', {
    method: 'post',
    body: JSON.stringify({ name, projectId, folderId }),
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

export async function renameSelector(selectorId: number, newName: string) {
  const res = await fetch('/api/rename-selector', {
    method: 'post',
    body: JSON.stringify({ selectorId, newName }),
    headers: { 'content-type': 'application/json' },
  })
  if (res.ok) {
    return true
  } else {
    throw new Error(await res.text())
  }
}

export async function addHtml(folderId: number, name: string) {
  const response = await fetch('/api/add-html', {
    method: 'post',
    body: JSON.stringify({ folderId, name }),
    headers: { 'content-type': 'application/json' },
  })
  if (response.ok) {
    const json = await response.json()
    return new HtmlRecord(json)
  } else {
    throw new Error(`${response.status} ${await response.text()}`)
  }
}

export async function addSelector(folderId: number, name: string) {
  const response = await fetch('/api/add-selector', {
    method: 'post',
    body: JSON.stringify({ folderId, name }),
    headers: { 'content-type': 'application/json' },
  })
  if (response.ok) {
    const json = await response.json()
    return new SelectorRecord(json)
  } else {
    throw new Error(`${response.status} ${await response.text()}`)
  }
}
