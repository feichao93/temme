import { CaptureResult } from './CaptureResult'
import { Dict } from './interfaces'
import { isEmptyObject } from './utils'

export interface ModifierFn {
  (result: CaptureResult, key: string, value: any, ...args: any[]): void
}

export const defaultModifierMap: Dict<ModifierFn> = {
  add(result, key, value) {
    if (value != null && !isEmptyObject(value)) {
      result.set(key, value)
    }
  },
  forceAdd(result, key, value) {
    result.set(key, value)
  },
  candidate(result, key, value) {
    const oldValue = result.get(key)
    if (!Boolean(oldValue)) {
      result.set(key, value)
    }
  },
  array(result, key, value) {
    const array = result.get(key) || []
    array.push(value)
    result.set(key, array)
  },
}

export function defineModifier(name: string, modifier: ModifierFn) {
  defaultModifierMap[name] = modifier
}
