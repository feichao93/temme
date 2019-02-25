import { Collection, Db } from 'mongodb'
import uuid from 'uuid/v1'
import { CreateProjectData, Page, Project, UserInfo, UserProfile } from './interfaces'

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

  async createProject(userId: number, data: CreateProjectData) {
    const now = new Date().toISOString()
    const projectId = uuid()
    const pageIds: string[] = []
    for (const page of data.pages) {
      const pageId = uuid()
      await this.pages.insertOne({
        _id: pageId,
        projectId,
        name: page.name,
        html: page.html,
        selector: page.selector,
        updatedAt: now,
        createdAt: now,
      })
      pageIds.push(pageId)
    }

    const project: Project = {
      _id: projectId,
      userId,
      name: data.name,
      description: data.description,
      updatedAt: now,
      createdAt: now,
      pageIds,
    }
    await this.projects.insertOne(project)

    return project
  }
}
