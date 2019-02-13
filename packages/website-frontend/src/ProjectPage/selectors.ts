import { State } from './interfaces'

export function page(state: State, pageId: number) {
  return state.pages.get(pageId)
}
