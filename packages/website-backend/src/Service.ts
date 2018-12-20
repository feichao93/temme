import { Collection, Db } from 'mongodb'
import { Page, Project, UserInfo, UserProfile } from './interfaces'

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

  /**  判断一个用户是否具有一个 project 的权限 */
  async checkOwnership(userId: number, projectId: number) {
    const project = await this.projects.findOne({ userId, projectId })
    return project != null
  }

  /** 获取下一个 project 的 id */
  async getNextProjectId() {
    const [projectWithMaxId] = await this.projects
      .find()
      .project({ projectId: true })
      .sort({ projectId: -1 })
      .limit(1)
      .toArray()
    return projectWithMaxId == null ? 1 : projectWithMaxId.projectId + 1
  }

  /** 获取下一个 page 的 id */
  async getNextPageId() {
    const [pageWithMaxId] = await this.pages
      .find()
      .project({ pageId: true })
      .sort({ pageId: -1 })
      .limit(1)
      .toArray()
    return pageWithMaxId == null ? 1 : pageWithMaxId.pageId + 1
  }
}
