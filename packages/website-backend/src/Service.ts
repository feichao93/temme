import { Collection, Db } from 'mongodb'
import { UserInfo } from './interfaces'

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
  folders: Folder[]
  createdAt: string
  updatedAt: string
}

export interface Folder {
  name: string
  description: string
  files: Array<{
    filename: string
    content: string
    createdAt: string
    updatedAt: string
  }>
}

export default class Service {
  users: Collection<UserProfile>
  projects: Collection<Project>

  constructor(readonly db: Db) {
    this.users = this.db.collection('users')
    this.projects = this.db.collection('projects')
  }

  updateUserProfile(userId: number, access_token: string, userInfo: UserInfo) {
    return this.users.updateOne(
      { userId },
      { $set: { userId, login: userInfo.login, access_token, userInfo } },
      { upsert: true },
    )
  }

  async checkOwnerShip(userId: number, projectId: number) {
    const project = await this.projects.findOne({ userId, projectId })
    return project != null
  }

  getBriefProjectListByUser(userId: number) {
    return this.projects
      .find({ userId })
      .project({ folders: false })
      .toArray()
  }

  async addProject(userId: number, projectName: string, description: string) {
    const [projectWithMaxId] = await this.projects
      .find()
      .project({ projectId: true })
      .sort({ projectId: -1 })
      .limit(1)
      .toArray()
    const projectId = projectWithMaxId == null ? 1 : projectWithMaxId.projectId + 1
    const dateString = new Date().toISOString()

    return this.projects.insertOne({
      userId,
      projectId,
      name: projectName,
      description,
      folders: [],
      createdAt: dateString,
      updatedAt: dateString,
    })
  }
}
