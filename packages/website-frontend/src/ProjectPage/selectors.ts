import { State } from './interfaces'

export function page(state: State, pageId: string) {
  return state.pages.get(pageId)
}
