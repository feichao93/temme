import axios from 'axios'
import CONFIG from './config'
import { OAuthData, OAuthError, UserInfo } from './interfaces'

export async function exchangeOAuthData(code: string) {
  const response = await axios.post(`https://github.com/login/oauth/access_token`, '', {
    headers: { Accept: 'application/json' },
    params: {
      client_id: CONFIG.oauthClientId,
      client_secret: CONFIG.oauthClientSecret,
      code,
    },
  })
  if (response.status !== 200) {
    throw new Error('github does not respond with 200')
  }
  const data: OAuthData | OAuthError = response.data
  if ('error' in data) {
    throw new Error([data.error, data.error_description, data.error_uri].join('\n'))
  }

  return data
}

export async function fetchUserInfo(access_token: string): Promise<UserInfo> {
  const response = await axios.get('https://api.github.com/user', {
    headers: { Authorization: `token ${access_token}` },
  })
  if (response.status !== 200) {
    throw new Error(`${response.status} ${response.statusText}`)
  }
  return response.data
}
