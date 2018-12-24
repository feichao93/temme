import { Map, Record } from 'immutable'
import * as monaco from 'monaco-editor'

const SelectorRecordBase = Record({
  // TODO status
  selectorId: 0,
  folderId: 0,
  name: '',
  content: '',
  createdAt: '',
  updatedAt: '',
})
export class SelectorRecord extends SelectorRecordBase {
  getUri() {
    return `inmemory://selectors/${this.selectorId}`
  }

  getUriObject() {
    return monaco.Uri.parse(this.getUri())
  }
}

const HtmlRecordBase = Record({
  // TODO status
  htmlId: 0,
  folderId: 0,
  name: '',
  content: '',
  createdAt: '',
  updatedAt: '',
})
export class HtmlRecord extends HtmlRecordBase {
  getUri() {
    return `inmemory://htmls/${this.htmlId}`
  }

  getUriObject() {
    return monaco.Uri.parse(this.getUri())
  }
}

const FolderRecordBase = Record({
  folderId: 0,
  name: '',
  description: '',
  createdAt: '',
  updatedAt: '',
})

export class FolderRecord extends FolderRecordBase {}

const ProjectRecordBase = Record({
  // TODO status
  projectId: 0,
  userId: 0,
  name: '',
  description: '',
  folders: Map<number, FolderRecord>(),
  createdAt: '',
  updatedAt: '',
})
export class ProjectRecord extends ProjectRecordBase {}

export class SelectorTabRecord extends Record({
  selectorId: 0,
  placeOrder: 0,
  openOrder: 0,
  avid: 0,
  initAvid: 0,
}) {
  isDirty() {
    return this.avid !== this.initAvid
  }
}

export class HtmlTabRecord extends Record({
  htmlId: 0,
  placeOrder: 0,
  openOrder: 0,
  avid: 0,
  initAvid: 0,
}) {
  isDirty() {
    return this.avid !== this.initAvid
  }
}

// 注意更新 htmlTabs/selectorTabs 的时候记得同步更新 monaco editor model
export class State extends Record({
  project: new ProjectRecord(),
  selectors: Map<number, SelectorRecord>(),
  htmls: Map<number, HtmlRecord>(),
  selectorTabs: Map<number, SelectorTabRecord>(),
  htmlTabs: Map<number, HtmlTabRecord>(),
  activeFolderId: -1,
  activeSelectorId: -1,
  activeHtmlId: -1,
  nextOpenOrder: 1,

  // 当用户创建新的文件夹、html 或选择器时，我们会直接使用下面的 postfix 来作为新对象的名称（的一部分）
  nextFolderPostfix: 1,
  nextHtmlPostfix: 1,
  nextSelectorPostfix: 1,
}) {}
