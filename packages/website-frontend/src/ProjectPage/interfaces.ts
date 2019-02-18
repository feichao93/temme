import { Map, Record } from 'immutable'
import { PageRecord, ProjectRecord } from '../types'

export type ReadyState = 'idle' | 'loading' | 'ready'

export class State extends Record({
  readyState: 'idle',
  project: new ProjectRecord(),
  pages: Map<string, PageRecord>(),
  activePageId: '',

  // 当用户创建新 page 时，使用下面的 postfix 来作为新对象的名称（的一部分）
  nextPagePostfix: 1,
}) {}
