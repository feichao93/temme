import fs from 'fs'

export interface Config {
  mongoUri: string
  oauthClientId: string
  port: number
  oauthCallbackPath: string
  oauthClientSecret: string
  appKeys: string[]
  mongoDb: string
}

const CONFIG: Config = JSON.parse(fs.readFileSync('CONFIG.json', 'utf8'))

export default CONFIG
