import { PageRecord } from '../types'
import { State } from './interfaces'

export function updatePage(state: State, pageId: string, page: PageRecord) {
  return state.update('pages', pages => pages.set(pageId, page))
}

export function deletePage(state: State, pageId: string) {
  return state.update('pages', pages => pages.delete(pageId))
}
