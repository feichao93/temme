import * as cheerio from 'cheerio'
import makeGrammarErrorMessage from './makeGrammarErrorMessage'
import { defaultFilterMap, FilterFn, FilterFnMap } from './filters'
import check, { errors } from './check'
import CaptureResult from './CaptureResult'
import { specialFilterNames } from './constants'
import {
  multisectionMatch,
  makeNormalCssSelector,
  isCheerioStatic,
  isAttributeQualifier,
} from './utils'
import {
  TemmeSelector,
  ContentPart,
  AttributeQualifier,
} from './interfaces'

export interface TemmeParser {
  parse(temmeSelectorString: string): TemmeSelector[]
}

/* 准备temmeParser.
  在webpack build的时候, 用pegjs-loader来载入parser
  在jest的时候, 使用fs来载入语法文件, 然后用pegjs程序生成parser
*/
declare const WEBPACK_BUILD: boolean
let temmeParser: TemmeParser
if (typeof WEBPACK_BUILD !== 'undefined' && WEBPACK_BUILD) {
  temmeParser = require('./grammar.pegjs')
} else {
  const fs = require('fs')
  const pegjs = require('pegjs')
  const source = fs.readFileSync('./src/grammar.pegjs', 'utf8')
  temmeParser = pegjs.generate(source)
}

export { cheerio, temmeParser }

export default function temme(
  html: string | CheerioStatic | CheerioElement,
  selector: string | TemmeSelector[],
  extraFilters: { [key: string]: FilterFn } = {},
) {
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
      rootSelector = temmeParser.parse(selector)
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
  // TODO rootSelector.forEach(check)
  return helper($.root(), rootSelector)

  function helper(cntCheerio: Cheerio, selectorArray: TemmeSelector[]): CaptureResult {
    const result = new CaptureResult(filterFnMap)

    for (const selector of selectorArray) {
      if (selector.type === 'normal-selector') {
        const cssSelector = makeNormalCssSelector(selector.sections)
        const subCheerio = cntCheerio.find(cssSelector)
        if (subCheerio.length > 0) {
          result.merge(capture(subCheerio, selector))

          if (selector.arrayCapture) {
            const { name, filterList } = selector.arrayCapture
            const beforeValue = subCheerio.toArray()
              .map(sub => helper($(sub), selector.children))
            result.add(name, beforeValue, filterList)
          }
        } else if (selector.arrayCapture) {
          const { name, filterList } = selector.arrayCapture
          result.add(name, [], filterList)
        }
      } else if (selector.type === 'self-selector') {
        const cssSelector = makeNormalCssSelector([selector.section])
        if (cssSelector === '' || cntCheerio.is(cssSelector)) {
          result.merge(capture(cntCheerio, selector))
        }
      } else { // selector.type === 'assignment'
        const { name, filterList } = selector.capture
        result.add(name, selector.value, filterList, true)
      }
    }
    return result
  }

  function capture(node: Cheerio, selector: TemmeSelector): CaptureResult {
    const result = new CaptureResult(filterFnMap)

    if (selector.type === 'normal-selector') {
      const { sections } = selector
      // Value-captures in the last section will be processed.
      // Preceding value-captures will be ignored.
      const { qualifiers, content } = sections[sections.length - 1]
      result.merge(captureAttributes(node, qualifiers.filter(isAttributeQualifier)))
      result.merge(captureContent(node, content))
    } else if (selector.type === 'self-selector') {
      const { section: { qualifiers, content } } = selector
      result.merge(captureAttributes(node, qualifiers.filter(isAttributeQualifier)))
      result.merge(captureContent(node, content))
    }
    return result
  }

  function captureAttributes(node: Cheerio, attributeQualifiers: AttributeQualifier[]) {
    const result = new CaptureResult(filterFnMap)
    for (const qualifier of attributeQualifiers) {
      if (typeof qualifier.value === 'object') { // value-capture
        const { attribute, value: { name, filterList } } = qualifier
        const attributeValue = node.attr(qualifier.attribute)
        if (attributeValue !== undefined) { // capture only when attribute exists
          result.add(name, attributeValue, filterList)
        }
      }
    }
    return result
  }

  function captureContent(node: Cheerio, content: ContentPart[]): CaptureResult {
    const result = new CaptureResult(filterFnMap)
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
        const normalFilterList = specialFilterNames.includes(firstFilterName)
          ? filterList.slice(1)
          : filterList
        result.add(name, initValue, normalFilterList)
      } else if (part.type === 'assignment') {
        const { capture: { name, filterList }, value } = part
        result.add(name, value, filterList, true)
      } else { // part.type === 'call'
        const { funcName, args } = part
        if (funcName === 'match') {
          multisectionMatch(result, node, part.args as any)
        } else {
          throw new Error(`${funcName} is not a valid content function.`)
        }
      }
    }
    return result
  }
}
