import { Filter } from './interfaces'
import { FilterFnMap, FilterFn } from './filters'
import { defaultCaptureKey } from './constants'
import { isEmptyObject } from './utils'
import { errorMessages } from './check'

export default class CaptureResult {
  private filterFnMap: FilterFnMap
  private result: any = {}
  private failed = false

  constructor(filterFnMap: FilterFnMap) {
    this.filterFnMap = filterFnMap
  }

  setFailed() {
    this.failed = true
  }

  isFailed() {
    return this.failed
  }

  add(key: string, value: any, filterList?: Filter[], force = false) {
    if (this.failed) {
      return
    }
    if (filterList) {
      value = this.applyFilters(value, filterList)
    }
    if (!(value == null || isEmptyObject(value)) || force) {
      this.result[key] = value
    }
  }

  merge(other: CaptureResult, failPropagation: boolean) {
    if (other.isFailed()) { // fail propagation
      if (failPropagation) {
        this.setFailed()
      } // else do nothing
    } else {
      const source = other.result
      for (const key in source) {
        this.result[key] = source[key]
      }
    }
  }

  get() {
    if (this.failed) {
      return null
    }
    let returnVal = this.result
    if (returnVal.hasOwnProperty(defaultCaptureKey)) {
      returnVal = this.result[defaultCaptureKey]
    }
    if (isEmptyObject(returnVal)) {
      returnVal = null
    }
    return returnVal
  }

  private applyFilters(initValue: any, filterList: Filter[]) {
    return filterList.reduce((value, filter) => {
      if (filter.name in this.filterFnMap) {
        const filterFn = this.filterFnMap[filter.name]
        return filterFn.apply(value, filter.args)
      } else if (typeof value[filter.name] === 'function') {
        const filterFn: FilterFn = value[filter.name]
        return filterFn.apply(value, filter.args)
      } else {
        throw new Error(errorMessages.invalidFilter(filter.name))
      }
    }, initValue)
  }
}
