import { OrderedMap, Record } from 'immutable'
import { PageRecord, ProjectRecord } from '../types'

export type ReadyState = 'idle' | 'loading' | 'ready' | 'aborted'

export class State extends Record({
  readyState: 'idle' as ReadyState,
  project: new ProjectRecord(),
  pages: OrderedMap<string, PageRecord>(),
  activePageId: '',

  // 当用户创建新 page 时，使用下面的 postfix 来作为新对象的名称（的一部分）
  nextPagePostfix: 1,
}) {}
