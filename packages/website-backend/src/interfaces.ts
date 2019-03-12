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
  /** 用户名，例如「shinima」 */
  login: string
  /** 用户的数字 ID */
  id: number
  /** 用户头像的图片地址 */
  avatar_url: string
  /** 用户的名字，例如 「肥超」 */
  name: string

  // 这里忽略了其他许多暂时用不到的字段
}

export interface UserProfile {
  userId: number
  username: string
  access_token: string
  userInfo: UserInfo
}

export interface Project {
  _id: string
  username: string
  name: string
  description: string
  pageIds: string[]
  createdAt: string
  updatedAt: string
}

export interface Page {
  _id: string
  projectId: string
  name: string
  html: string
  selector: string
  createdAt: string
  updatedAt: string
}

export interface CreateProjectData {
  name: string
  description: string
  pages: Array<PageData>
}

export interface PageData {
  name: string
  html: string
  selector: string
}

/** 管理员在 admin-page 中的配置 */
export interface AdminConfig {
  recommendedProjects: Array<{
    username: string
    projectName: string
  }>
}
