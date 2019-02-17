import { Map, Record } from 'immutable'
import { PageRecord, ProjectRecord } from '../types'

export class State extends Record({
  project: new ProjectRecord(),
  pages: Map<number, PageRecord>(),
  activePageId: -1,

  // 当用户创建新 page 时，使用下面的 postfix 来作为新对象的名称（的一部分）
  nextPagePostfix: 1,
}) {}
