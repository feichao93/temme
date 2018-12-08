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
  // TODO 还有很多其他的用户信息，这里暂不记录
}
