import { CaptureResult } from './CaptureResult'
import { Dict } from './interfaces'
import { isEmptyObject } from './utils'
import { DEFAULT_CAPTURE_KEY } from './constants'

export interface ModifierFn {
  (result: CaptureResult, key: string, value: any, ...args: any[]): void
}

export const defaultModifierDict: Dict<ModifierFn> = {
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
  spread(result, key, value, prefix = key) {
    if (value == null) {
      return
    }
    if (prefix === DEFAULT_CAPTURE_KEY) {
      prefix = ''
    }
    for (const k of Object.keys(value)) {
      result.set(prefix + k, value[k])
    }
  },
}

export function defineModifier(name: string, modifier: ModifierFn) {
  defaultModifierDict[name] = modifier
}
