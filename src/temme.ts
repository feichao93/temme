import * as cheerio from 'cheerio'
import makeGrammarErrorMessage from './makeGrammarErrorMessage'
import { defaultFilterMap, defineFilter, FilterFn, FilterFnMap } from './filters'
import {
  multisectionMatch,
  makeNormalCssSelector,
  makeNormalCssSelectorFromSelfSelector,
  mergeResult,
  isCheerioStatic,
  isEmptyObject,
} from './utils'
import check, { errors } from './check'

/* 准备temmeParser.
  在webpack build的时候, 用pegjs-loader来载入parser
  在jest的时候, 使用fs来载入语法文件, 然后用pegjs程序生成parser
*/
declare const WEBPACK_BUILD: boolean
let temmeParser: any
if (typeof WEBPACK_BUILD !== 'undefined' && WEBPACK_BUILD) {
  temmeParser = require('./grammar.pegjs')
} else {
  const fs = require('fs')
  const pegjs = require('pegjs')
  const source = fs.readFileSync('./src/grammar.pegjs', 'utf8')
  temmeParser = pegjs.generate(source)
}

export {
  cheerio,
  defineFilter,
  temmeParser,
  defaultFilterMap,
  FilterFn,
  FilterFnMap,
  makeGrammarErrorMessage,
  errors,
}

const defaultCaptureKey = '@@default-capture@@'

export interface Dict<V> {
  [key: string]: V
}

export type Literal = string | number | boolean | null | undefined

export type TemmeSelector = SelfSelector | NormalSelector | AssignmentSelector

export interface NormalSelector {
  type: 'normal'
  name: string
  css: CssSlice[]
  children: TemmeSelector[]
  filterList: Filter[]
}

export interface SelfSelector {
  type: 'self'
  id: string
  classList: string[]
  attrList: CssAttr[]
  content: ContentPart[]
}

/**
 * 赋值选择器. 该选择器执行的时候, 会在结果中添加指定的值到指定的字段
 * 例如`$a = 123`, 其执行结果为 { a: 123 }
 */
export interface AssignmentSelector {
  type: 'assignment'
  capture: Capture
  value: Literal
}

export interface CssAttr {
  name: string
  value: string | Capture
}

export type CaptureResult = any

export interface CssSlice {
  direct: boolean
  tag: string
  id: string
  classList: string[]
  attrList: CssAttr[]
  content: ContentPart[]
}

export type ContentPart = ContentPartCapture | ContentPartAssignment | ContentPartCall

export interface ContentPartCapture {
  type: 'capture'
  capture: Capture
}

export interface ContentPartAssignment {
  type: 'assignment'
  capture: Capture
  value: Literal
}

export interface ContentPartCall {
  type: 'call'
  funcName: string
  args: (Literal | Capture)[]
}

export interface Capture {
  name: string
  filterList: Filter[]
}

export interface Filter {
  name: string
  args: string[]
}

export default function temme(html: string | CheerioStatic | CheerioElement,
                              selector: string | TemmeSelector[],
                              extraFilters: { [key: string]: FilterFn } = {}) {
  let $: CheerioStatic
  if (typeof html === 'string') {
    $ = cheerio.load(html, { decodeEntities: false })
  } else if (isCheerioStatic(html)) {
    $ = html
  } else {
    $ = cheerio.load(html)
  }

  let rootSelector: TemmeSelector[]
  if (typeof selector === 'string') {
    try {
      rootSelector = temmeParser.parse(selector) as TemmeSelector[]
    } catch (error) {
      const message = makeGrammarErrorMessage(selector, error)
      throw new Error(message)
    }
  } else {
    rootSelector = selector
  }
  if (rootSelector == null) {
    return null
  }

  const filterFnMap: FilterFnMap = Object.assign({}, defaultFilterMap, extraFilters)
  rootSelector.forEach(check)
  return helper($.root(), rootSelector)

  function helper(cntCheerio: Cheerio, selectorArray: TemmeSelector[]) {
    const result: CaptureResult = {}
    selectorArray.map(selector => {
      if (selector.type === 'normal') {
        const cssSelector = makeNormalCssSelector(selector.css)
        const subCheerio = cntCheerio.find(cssSelector)
        if (subCheerio.length > 0) {
          const capturer = makeValueCapturer(selector.css)
          mergeResult(result, capturer(subCheerio))

          if (selector.name) {
            const beforeValue = subCheerio.toArray()
              .map(sub => helper($(sub), selector.children))
            result[selector.name] = applyFilters(beforeValue, selector.filterList)
          }
        } else if (selector.name) {
          result[selector.name] = applyFilters([], selector.filterList)
        }
      } else if (selector.type === 'self') {
        const cssSelector = makeNormalCssSelectorFromSelfSelector(selector)
        if (cssSelector === '' || cntCheerio.is(cssSelector)) {
          const capturer = makeSelfCapturer(selector)
          mergeResult(result, capturer(cntCheerio))
        }
      } else { // selector.type === 'assignment'
        result[selector.capture.name] = applyFilters(selector.value, selector.capture.filterList)
      }
    })

    let returnVal = result
    if (result.hasOwnProperty(defaultCaptureKey)) {
      returnVal = result[defaultCaptureKey]
    }
    if (returnVal == null || isEmptyObject(returnVal)) {
      return null
    } else {
      return returnVal
    }
  }

  function applyFilters(initValue: any, filterList: Filter[]) {
    return filterList.reduce((value, filter) => {
      if (filter.name in filterFnMap) {
        const filterFn = filterFnMap[filter.name]
        return filterFn.apply(value, filter.args)
      } else if (typeof value[filter.name] === 'function') {
        const filterFn: FilterFn = value[filter.name]
        return filterFn.apply(value, filter.args)
      } else {
        throw new Error(`${filter.name} is not a valid filter.`)
      }
    }, initValue)
  }

  function captureAttrs(node: Cheerio, attrList: CssAttr[]) {
    const result: CaptureResult = {}
    for (const attr of attrList) {
      if (typeof attr.value === 'object') {
        const value = node.attr(attr.name)
        if (value !== undefined) {
          result[attr.value.name] = applyFilters(value, attr.value.filterList)
        }
      }
      // todo 这里是否需要同时验证匹配? 例如 foo=bar
    }
    return result
  }

  function captureContent(node: Cheerio, content: ContentPart[]) {
    const result: CaptureResult = {}
    for (const part of content) {
      if (part.type === 'capture') {
        const { capture: { name, filterList } } = part
        // text, html, node这三个是内置的filter, 和普通的filter语法相同, 但是运行时行为不同
        const firstFilterName = filterList[0] && filterList[0].name
        let initValue: any
        if (firstFilterName === 'html') {
          initValue = node.html()
        } else if (firstFilterName === 'node') {
          initValue = cheerio(node)
        } else { // 默认情况下使用节点内的文本来作为initValue
          initValue = node.text()
        }
        const normalFilterList = ['html', 'node', 'text'].includes(firstFilterName)
          ? filterList.slice(1)
          : filterList
        result[name] = applyFilters(initValue, normalFilterList)
      } else if (part.type === 'assignment') {
        const { capture: { name, filterList }, value } = part
        result[name] = applyFilters(value, filterList)
      } else { // part.type === 'call'
        const { funcName, args } = part
        if (funcName === 'match') {
          const matchResult = multisectionMatch(node.text(), part.args as any)
          if (matchResult == null) {
            return null
          }
          for (const arg of args) {
            if (typeof arg === 'object') {
              matchResult[arg.name] = applyFilters(matchResult[arg.name], arg.filterList)
            }
          }
          mergeResult(result, matchResult)
          // } else if (part.funcName === 'contains') { // TODO
          //   const included = node.text().includes(args[0] as string)
        } else {
          throw new Error(`${funcName} is not a valid content function.`)
        }
      }
    }
    return result
  }

  function makeSelfCapturer(selfSelector: SelfSelector) {
    return (node: Cheerio) => {
      const result: CaptureResult = {}
      mergeResult(result, captureAttrs(node, selfSelector.attrList))
      const contentCaptureResult = captureContent(node, selfSelector.content)
      if (contentCaptureResult == null) {
        return null
      }
      mergeResult(result, contentCaptureResult)
      return result
    }
  }

  function makeValueCapturer(slices: CssSlice[]) {
    return (node: Cheerio) => {
      const result: CaptureResult = {}
      // notice 目前只能在最后一个part中进行value-capture
      const lastSlice = slices[slices.length - 1]
      mergeResult(result, captureAttrs(node, lastSlice.attrList))

      const contentCaptureResult = captureContent(node, lastSlice.content)
      if (contentCaptureResult == null) {
        return null
      }
      mergeResult(result, contentCaptureResult)

      return result
    }
  }
}
