import { Collection, Db } from 'mongodb'
import { Project, UserInfo, UserProfile, Html, Selector } from './interfaces'

export default class Service {
  users: Collection<UserProfile>
  projects: Collection<Project>
  htmls: Collection<Html>
  selectors: Collection<Selector>

  constructor(readonly db: Db) {
    this.users = this.db.collection('users')
    this.projects = this.db.collection('projects')
    this.htmls = this.db.collection('htmls')
    this.selectors = this.db.collection('selectors')
  }

  updateUserProfile(userId: number, access_token: string, userInfo: UserInfo) {
    return this.users.updateOne(
      { userId },
      { $set: { userId, login: userInfo.login, access_token, userInfo } },
      { upsert: true },
    )
  }

  /**  判断一个用户是否具有一个 project 的权限 */
  async checkProjectOwnership(userId: number, projectId: number) {
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

  /** 获取下一个 folder 的 id */
  async getNextFolderId() {
    const [withMaxFolderId] = await this.projects
      .aggregate<{ folders: { folderId: number } }>([
        { $unwind: '$folders' },
        { $sort: { 'folders.folderId': -1 } },
        { $limit: 1 },
      ])
      .toArray()
    return withMaxFolderId == null ? 1 : withMaxFolderId.folders.folderId + 1
  }

  async getNextHtmlId() {
    const [htmlWithMaxId] = await this.htmls
      .find()
      .project({ htmlId: true })
      .sort({ htmlId: -1 })
      .limit(1)
      .toArray()
    return htmlWithMaxId == null ? 1 : htmlWithMaxId.htmlId + 1
  }

  async getNextSelectorId() {
    const [selectorWithMaxId] = await this.selectors
      .find()
      .project({ selectorId: true })
      .sort({ selectorId: -1 })
      .limit(1)
      .toArray()
    return selectorWithMaxId == null ? 1 : selectorWithMaxId.selectorId + 1
  }
}
