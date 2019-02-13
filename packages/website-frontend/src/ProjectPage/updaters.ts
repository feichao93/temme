import { PageRecord, State } from './interfaces'

export function updatePage(state: State, pageId: number, page: PageRecord) {
  return state.update('pages', pages => pages.set(pageId, page))
}
