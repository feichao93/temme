import { Record } from 'immutable'

export interface UserInfo {
  login: string
  id: number
  avatar_url: string
  html_url: string
  name: string
  location: string
  email: string
  bio: string
}

export interface Project {
  _id: string
  userId: number
  name: string
  description: string
  pageIds: number[]
  createdAt: string
  updatedAt: string
}

const PageRecordBase = Record({
  _id: '',
  name: '',
  html: '',
  selector: '',
  createdAt: '',
  updatedAt: '',
  htmlAvid: 0,
  htmlInitAvid: 0,
  selectorAvid: 0,
  selectorInitAvid: 0,
})
export class PageRecord extends PageRecordBase {
  isModified() {
    return this.htmlAvid !== this.htmlInitAvid || this.selectorAvid !== this.selectorInitAvid
  }
}

const ProjectRecordBase = Record({
  _id: '',
  userId: 0,
  name: '',
  description: '',
  createdAt: '',
  updatedAt: '',
})
export class ProjectRecord extends ProjectRecordBase {}
