export interface UserInfo {
  login: string
  id: number
  avatar_url: string
  html_url: string
  name: string
  location: string
  email: string
  bio: string
}

export interface Project {
  projectId: number
  userId: number
  name: string
  description: string
  folderIds: number[]
  createdAt: string
  updatedAt: string
}
