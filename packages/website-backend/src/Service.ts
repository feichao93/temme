import { Collection, Db } from 'mongodb'
import { Folder, Project, UserInfo, UserProfile } from './interfaces'

export default class Service {
  users: Collection<UserProfile>
  projects: Collection<Project>
  folders: Collection<Folder>

  constructor(readonly db: Db) {
    this.users = this.db.collection('users')
    this.projects = this.db.collection('projects')
    this.folders = this.db.collection('folders')
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

  /** 获取下一个 folder 的 id */
  async getNextFolderId() {
    const [folderWithMaxId] = await this.folders
      .find()
      .project({ folderId: true })
      .sort({ folderId: -1 })
      .limit(1)
      .toArray()
    return folderWithMaxId == null ? 1 : folderWithMaxId.folderId + 1
  }
}
