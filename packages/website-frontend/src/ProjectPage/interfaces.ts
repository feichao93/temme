import { Map, Record } from 'immutable'
import * as monaco from 'monaco-editor'

const PageRecordBase = Record({
  pageId: 0,
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
  getHtmlUriObject() {
    return monaco.Uri.parse(`inmemory://htmls/${this.pageId}`)
  }
  getSelectorUriObject() {
    return monaco.Uri.parse(`inmemory://selectors/${this.pageId}`)
  }
  isModified() {
    return this.htmlAvid !== this.htmlInitAvid || this.selectorAvid !== this.selectorInitAvid
  }
}

const ProjectRecordBase = Record({
  projectId: 0,
  userId: 0,
  name: '',
  description: '',
  createdAt: '',
  updatedAt: '',
})
export class ProjectRecord extends ProjectRecordBase {}

export class State extends Record({
  project: new ProjectRecord(),
  pages: Map<number, PageRecord>(),
  activePageId: -1,

  // 当用户创建新 page 时，使用下面的 postfix 来作为新对象的名称（的一部分）
  nextPagePostfix: 1,
}) {}
