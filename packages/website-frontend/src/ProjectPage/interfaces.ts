import { Map, Record } from 'immutable'
import * as monaco from 'monaco-editor'
import { AtomRecord } from '../utils/atoms'

const SelectorRecordBase = Record({
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

const PageRecordBase = Record({
  pageId: 0,
  name: '',
  description: '',
  createdAt: '',
  updatedAt: '',
})

export class PageRecord extends PageRecordBase {}

const ProjectRecordBase = Record({
  projectId: 0,
  userId: 0,
  name: '',
  description: '',
  pages: Map<number, PageRecord>(),
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

export class EditorPageState extends Record({
  projectAtom: AtomRecord.loading(null as ProjectRecord),
  selectorAtoms: Map<number, AtomRecord<SelectorRecord>>(),
  htmlAtoms: Map<number, AtomRecord<HtmlRecord>>(),
  selectorTabs: Map<number, SelectorTabRecord>(),
  htmlTabs: Map<number, HtmlTabRecord>(),
  activePageId: -1,
  activeSelectorId: -1,
  activeHtmlId: -1,
  nextOpenOrder: 1,
}) {}

// const state = new EditorPageState()
