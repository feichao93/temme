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
  // 第一次打开一个 model 的时候 avid (alternativeVersionId) 默认为 1
  // 我们在这里将下面这些字段的默认值设置为 1，这样在首次打开 model 时就不需要更新这些字段了
  htmlAvid: 1,
  htmlInitAvid: 1,
  selectorAvid: 1,
  selectorInitAvid: 1,
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
