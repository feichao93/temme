export interface FilterFn {
  (this: any, ...args: any[]): any
}

export interface FilterFnMap {
  [key: string]: FilterFn
}

export const defaultFilterMap: FilterFnMap = {
  pack(this: any[]) {
    return Object.assign({}, ...this)
  },
  compact(this: any[]) {
    return this.filter(Boolean)
  },
  flatten(this: any[][]) {
    return this.reduce((r, a) => r.concat(a))
  },
  words(this: string) {
    return this.split(/\s+/g)
  },
  lines(this: string) {
    return this.split(/\r?\n/g)
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
  defaultFilterMap[name] = filter
}
