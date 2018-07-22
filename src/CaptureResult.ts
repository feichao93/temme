import invariant from 'invariant'
import { Capture, Dict, Filter } from './interfaces'
import { FilterFn } from './filters'
import { DEFAULT_CAPTURE_KEY } from './constants'
import { isEmptyObject } from './utils'
import { msg } from './check'
import { ModifierFn } from './modifier'

export class CaptureResult {
  private readonly result: any = {}
  private failed = false

  constructor(readonly filterFnMap: Dict<FilterFn>, readonly modifierFnMap: Dict<ModifierFn>) {}

  setFailed() {
    this.failed = true
  }

  isFailed() {
    return this.failed
  }

  get(key: string) {
    if (this.failed) {
      return null
    }
    return this.result[key]
  }

  set(key: string, value: any) {
    if (this.failed) {
      return
    }
    this.result[key] = value
  }

  add(capture: Capture, value: any) {
    this.exec(capture, value, 'add')
  }

  forceAdd(capture: Capture, value: any) {
    this.exec(capture, value, 'forceAdd')
  }

  private exec(capture: Capture, value: any, defaultModifier: string) {
    if (this.failed) {
      return
    }
    const modifier = capture.modifier || defaultModifier
    const modifierFn = this.modifierFnMap[modifier]
    invariant(typeof modifierFn === 'function', msg.invalidModifier(modifier))
    modifierFn(this, capture.name, this.applyFilterList(value, capture.filterList))
  }

  merge(other: CaptureResult) {
    if (!other.isFailed()) {
      this.doMerge(other)
    }
  }

  mergeWithFailPropagation(other: CaptureResult) {
    if (other.isFailed()) {
      this.setFailed()
    } else {
      this.doMerge(other)
    }
  }

  getResult() {
    if (this.failed) {
      return null
    }
    let returnVal = this.result
    if (returnVal.hasOwnProperty(DEFAULT_CAPTURE_KEY)) {
      returnVal = this.result[DEFAULT_CAPTURE_KEY]
    }
    if (isEmptyObject(returnVal)) {
      returnVal = null
    }
    return returnVal
  }

  private doMerge(other: CaptureResult) {
    const source = other.result
    for (const key of Object.keys(source)) {
      this.result[key] = source[key]
    }
  }

  private applyFilter(value: any, filter: Filter) {
    if (filter.name in this.filterFnMap) {
      const filterFn = this.filterFnMap[filter.name]
      return filterFn.apply(value, filter.args)
    } else if (typeof value[filter.name] === 'function') {
      const filterFn: FilterFn = value[filter.name]
      return filterFn.apply(value, filter.args)
    } else {
      throw new Error(msg.invalidFilter(filter.name))
    }
  }

  private applyFilterList(initValue: any, filterList: Filter[]) {
    return filterList.reduce((value, filter) => {
      if (filter.isArrayFilter) {
        invariant(Array.isArray(value), msg.arrayFilterAppliedToNonArrayValue(filter.name))
        return value.map((item: any) => this.applyFilter(item, filter))
      } else {
        return this.applyFilter(value, filter)
      }
    }, initValue)
  }
}
