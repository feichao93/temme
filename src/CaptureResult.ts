import invariant from 'invariant'
import { Capture, Dict, Filter, Modifier } from './interfaces'
import { FilterFn } from './filters'
import { DEFAULT_CAPTURE_KEY } from './constants'
import { isEmptyObject } from './utils'
import { msg } from './check'
import { ModifierFn } from './modifier'

const addModifier: Modifier = { name: 'add', args: [] }
const forceAddModifier: Modifier = { name: 'forceAdd', args: [] }

export class CaptureResult {
  private readonly result: any = {}

  constructor(readonly filterFnMap: Dict<FilterFn>, readonly modifierFnMap: Dict<ModifierFn>) {}

  get(key: string) {
    return this.result[key]
  }

  set(key: string, value: any) {
    this.result[key] = value
  }

  add(capture: Capture, value: any) {
    this.exec(capture, value, addModifier)
  }

  forceAdd(capture: Capture, value: any) {
    this.exec(capture, value, forceAddModifier)
  }

  private exec(capture: Capture, value: any, defaultModifier: Modifier) {
    const modifier = capture.modifier || defaultModifier
    const modifierFn = this.modifierFnMap[modifier.name]
    invariant(typeof modifierFn === 'function', msg.invalidModifier(modifier))
    modifierFn(
      this,
      capture.name,
      this.applyFilterList(value, capture.filterList),
      ...modifier.args,
    )
  }

  getResult() {
    let returnVal = this.result
    if (returnVal.hasOwnProperty(DEFAULT_CAPTURE_KEY)) {
      returnVal = this.result[DEFAULT_CAPTURE_KEY]
    }
    if (isEmptyObject(returnVal)) {
      returnVal = null
    }
    return returnVal
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
