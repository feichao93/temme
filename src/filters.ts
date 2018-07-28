import { Dict } from './interfaces'

export interface FilterFn {
  (this: any, ...args: any[]): any
}

export const defaultFilterDict: Dict<FilterFn> = {
  pack(this: any[]) {
    return Object.assign({}, ...this)
  },
  compact(this: any[]) {
    return this.filter(Boolean)
  },
  flatten(this: any[][]) {
    return this.reduce((r, a) => r.concat(a))
  },
  first(this: any[]) {
    return this[0]
  },
  last(this: any[]) {
    return this[this.length - 1]
  },
  get(this: any, key: any) {
    return this[key]
  },

  Number() {
    return Number(this)
  },
  String() {
    return String(this)
  },
  Boolean() {
    return Boolean(this)
  },
  Date() {
    return new Date(this)
  },
}

export function defineFilter(name: string, filter: FilterFn) {
  defaultFilterDict[name] = filter
}
