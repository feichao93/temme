import { Collection, Db } from 'mongodb'
import { Project, UserInfo, UserProfile, Page } from './interfaces'

export default class Service {
  users: Collection<UserProfile>
  projects: Collection<Project>
  pages: Collection<Page>

  constructor(readonly db: Db) {
    this.users = this.db.collection('users')
    this.projects = this.db.collection('projects')
    this.pages = this.db.collection('pages')
  }

  updateUserProfile(userId: number, access_token: string, userInfo: UserInfo) {
    return this.users.updateOne(
      { userId },
      { $set: { userId, login: userInfo.login, access_token, userInfo } },
      { upsert: true },
    )
  }
}
