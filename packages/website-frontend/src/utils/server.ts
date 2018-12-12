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
