export interface OAuthData {
  access_token: string
  token_type: 'bearer'
  scope: ''
}

export interface OAuthError {
  error: string
  error_description: string
  error_uri: string
}

export interface UserInfo {
  login: string
  id: number
  avatar_url: string
  html_url: string
  name: string
  // 这里忽略了其他许多暂时用不到的字段
}

export interface UserProfile {
  userId: number
  login: string
  access_token: string
  userInfo: UserInfo
}

export interface Project {
  projectId: number
  userId: number
  name: string
  description: string
  folders: Array<{
    folderId: number
    name: string
    description: string
    selectorIds: number[]
    htmlIds: number[]
  }>
  createdAt: string
  updatedAt: string
}

export interface Selector {
  selectorId: number
  folderId: number
  name: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface Html {
  htmlId: number
  folderId: number
  name: string
  content: string
  createdAt: string
  updatedAt: string
}
