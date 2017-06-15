import * as path from 'path'
import * as fs from 'fs'
import * as pegjs from 'pegjs'
import * as cheerio from 'cheerio'

const errors = {
  funcNameNotSupported(f: string) {
    return `${f} is not a valid content func-name.`
  },
}

const defaultCaptureKey = '@@default-capture@@'
const ignoreCaptureKey = '@@ignore-capture@@'

const ignoreCapture: Capture<string> = { capture: ignoreCaptureKey, filterList: [] }

const grammar = fs.readFileSync(path.resolve(__dirname, '../src/temme.pegjs'), 'utf8')

export const temmeParser = pegjs.generate(grammar)

interface Dict<V> {
  [key: string]: V
}

interface Filter {
  (v: any): any
}

type TemmeSelector = SelfSelector | NonSelfSelector

interface NonSelfSelector {
  self: false
  name: string
  css: CssPart[]
  children: TemmeSelector[]
  filterList: string[]
}

interface SelfSelector {
  self: true
  id: string
  classList: string[]
  attrList: CssAttr[]
  content: ContentPart[]
}

interface CssAttr {
  name: string
  value: string | Capture<string>
}

export type CaptureResult = any

interface CssPart {
  direct: boolean
  tag: string
  id: string
  classList: string[]
  attrList: CssAttr[]
  content: ContentPart[]
}

type ContentPart = {
  funcName: FuncName
  args: ContentPartArg[]
}
type ContentPartArg = string | Capture<string>
type FuncName = 'text' | 'html' | 'node' | 'contains'

type Capture<T> = {
  capture: T
  filterList: string[]
}

function isCheerioStatic(arg: CheerioStatic | CheerioElement): arg is CheerioStatic {
  return typeof (<CheerioStatic>arg).root === 'function'
}

export default function temme(html: string | CheerioStatic | CheerioElement, selector: string | TemmeSelector) {
  let $: CheerioStatic
  if (typeof html === 'string') {
    $ = cheerio.load(html, { decodeEntities: false })
  } else if (isCheerioStatic(html)) {
    $ = html
  } else {
    $ = cheerio.load(html)
  }

  let rootSelector: TemmeSelector
  if (typeof selector === 'string') {
    rootSelector = temmeParser.parse(selector) as TemmeSelector
  } else {
    rootSelector = selector
  }

  return helper($.root(), [rootSelector])

  function helper(cntCheerio: Cheerio, selectorArray: TemmeSelector[]) {
    const result: CaptureResult = {}
    selectorArray.map(selector => {
      if (selector.self === false) {
        const cssSelector = makeNormalCssSelector(selector.css)
        const subCheerio = cntCheerio.find(cssSelector)
        if (subCheerio.length > 0) {
          const capturer = makeValueCapturer(selector.css)
          Object.assign(result, capturer(subCheerio))

          if (selector.name && selector.children) {
            const beforeValue = subCheerio.toArray()
              .map(sub => helper($(sub), selector.children))
              .filter(r => Object.keys(r).length > 0)
            result[selector.name] = applyFilters(beforeValue, selector.filterList)
          }
        } else if (selector.name) {
          result[selector.name] = applyFilters([], selector.filterList)
        }
      } else { // self === true
        const cssSelector = makeNormalCssSelector([{
          direct: false,
          tag: '',
          id: selector.id,
          classList: selector.classList,
          attrList: selector.attrList,
          content: selector.content,
        }])
        if (cssSelector === '' || cntCheerio.is(cssSelector)) {
          const capturer = makeSelfCapturer(selector)
          Object.assign(result, capturer(cntCheerio))
        }
      }
    })
    delete result[ignoreCaptureKey]
    if (result.hasOwnProperty(defaultCaptureKey)) {
      return result[defaultCaptureKey]
    } else {
      return result
    }
  }
}

function hasConsecutiveValueCapture(args: ContentPartArg[]) {
  for (let i = 1; i < args.length; i++) {
    const prev = typeof args[i - 1] === 'object'
    const cnt = typeof args[i] === 'object'
    if (prev && cnt) {
      return true
    }
  }
  return false
}

function captureAttrs(node: Cheerio, attrList: CssAttr[]) {
  const result: CaptureResult = {}
  for (const attr of attrList) {
    if (typeof attr.value === 'object') {
      const value = node.attr(attr.name)
      if (value !== undefined) {
        result[attr.value.capture] = applyFilters(value, attr.value.filterList)
      }
    }
    // todo 这里是否需要同时验证匹配? 例如 foo=bar
  }
  return result
}

function captureContent(node: Cheerio, content: ContentPart[]) {
  const result: CaptureResult = {}
  for (const part of content) {
    // 目前只支持这几个func
    console.assert(['text', 'html', 'node', 'contains'].includes(part.funcName),
      errors.funcNameNotSupported(part.funcName))
    // 至少有一个是value-capture
    // console.assert(part.args.some(isCapture),
    //   errors.needValueCapture(part.funcName))
    // 不能出现连续两个值捕获
    console.assert(!hasConsecutiveValueCapture(part.args))

    if (part.funcName === 'text') {
      const textCaptureResult = captureString(node.text(), part.args)
      if (textCaptureResult == null) {
        return null
      }
      Object.assign(result, textCaptureResult)
    } else if (part.funcName === 'html') {
      const htmlCaptureResult = captureString(node.html(), part.args)
      if (htmlCaptureResult == null) {
        return null
      }
      Object.assign(result, htmlCaptureResult)
    } else if (part.funcName === 'node') {
      console.assert(part.args.length === 1)
      const arg = part.args[0]
      if (typeof arg === 'object') {
        result[arg.capture] = applyFilters(cheerio(node), arg.filterList)
      } else {
        throw new Error('Cotnent func `text` must be in `text($foo)` form')
      }
    } else if (part.funcName === 'contains') {
      console.assert(part.args.length === 1)
      const arg = part.args[0]
      if (typeof arg === 'string') {
        // contains('<some-text>') -> text(_, '<some-text>', _)
        const textCaptureResult = captureString(node.text(), [ignoreCapture, arg, ignoreCapture])
        if (textCaptureResult == null) {
          return null
        }
        Object.assign(result, textCaptureResult)
      } else {
        throw new Error('Cotnent func `contains` must be in `text(<some-text>)` form')
      }
    } else {
      throw new Error(`${part.funcName} is not a valid content-func.`)
    }
  }
  return result
}

function makeSelfCapturer(selfSelector: SelfSelector) {
  return (node: Cheerio) => {
    const result: CaptureResult = {}
    if (selfSelector.attrList) {
      Object.assign(result, captureAttrs(node, selfSelector.attrList))
    }
    if (selfSelector.content) {
      const contentCaptureResult = captureContent(node, selfSelector.content)
      if (contentCaptureResult == null) {
        return null
      }
      Object.assign(result, contentCaptureResult)
    }
    return result
  }
}

// 对string进行多段匹配/捕获. 匹配之前会先调用String#trim来修剪参数s
// matchString('I like apple', ['I', { capture: 'foo' }])的结果为
//  { foo: ' like apple' }
// 如果匹配失败, 则返回null
// todo 需要用回溯的方法来正确处理多种匹配选择的情况
export function captureString(s: string, args: ContentPartArg[]) {
  const trimed = s.trim()
  const result: Dict<string> = {}
  // 标记正在进行的capture, null表示没有在捕获中
  let capturing: Capture<string> = null
  let charIndex = 0
  for (const arg of args) {
    if (typeof arg === 'string') {
      if (capturing) {
        const c = trimed.indexOf(arg, charIndex)
        if (c === -1) {
          return null
        } else {
          result[capturing.capture] = trimed.substring(charIndex, c)
          result[capturing.capture] = applyFilters(trimed.substring(charIndex, c), capturing.filterList)
          capturing = null
          charIndex = c + arg.length
        }
      } else {
        if (trimed.substring(charIndex).startsWith(arg)) {
          charIndex += arg.length
        } else {
          return null // fail
        }
      }
    } else { // arg is value capture
      capturing = arg
    }
  }
  if (capturing) {
    result[capturing.capture] = applyFilters(trimed.substring(charIndex).trim(), capturing.filterList)
    charIndex = s.length
  }
  if (charIndex !== s.length) {
    // 字符串结尾处还有字符尚未匹配
    return null
  }
  return result
}

// todo makeValueCapturer命名是不是有问题???
function makeValueCapturer(cssPartArray: CssPart[]) {
  return (node: Cheerio) => {
    const result: CaptureResult = {}
    // todo 目前只能在最后一个part中进行value-capture
    const lastCssPart = cssPartArray[cssPartArray.length - 1]
    if (lastCssPart.attrList) {
      Object.assign(result, captureAttrs(node, lastCssPart.attrList))
    }
    if (lastCssPart.content) {
      const contentCaptureResult = captureContent(node, lastCssPart.content)
      if (contentCaptureResult == null) {
        return null
      }
      Object.assign(result, contentCaptureResult)
    }
    return result
  }
}

function makeNormalCssSelector(cssPartArray: CssPart[]) {
  const seperator = ' '
  const result: string[] = []
  cssPartArray.forEach((cssPart, index) => {
    if (index !== 0) {
      result.push(seperator)
    }
    if (cssPart.direct) {
      result.push('>')
    }
    if (cssPart.tag) {
      result.push(cssPart.tag)
    }
    if (cssPart.id) {
      result.push('#' + cssPart.id)
    }
    if (cssPart.classList) {
      cssPart.classList.forEach(class_ => result.push('.' + class_))
    }
    if (cssPart.attrList && cssPart.attrList.some(attr => (typeof attr.value === 'string'))) {
      result.push('[')
      cssPart.attrList.forEach(attr => {
        if (attr.value === '') {
          result.push(attr.name)
        } else if (typeof attr.value === 'string') {
          result.push(`${attr.name}="${attr.value}"`)
        } // else value-capture
        result.push(seperator)
      })
      result.push(']')
    }
  })
  return result.join('')
}

const filterMap: { [key: string]: Filter } = {}

function applyFilters(initValue: any, filterList: string[]) {
  return filterList.reduce((value, filterName) => {
    if (typeof filterMap[filterName] === 'function') {
      return filterMap[filterName](value)
    } else {
      throw new Error(`${filterName} is not a valid filter.`)
    }
  }, initValue)
}

filterMap['pack'] = (v: any) => Object.assign({}, ...v)
filterMap['splitComma'] = (s: string) => s.split(',')
filterMap['splitBlanks'] = (s: string) => s.split(/ +/)
filterMap['Number'] = Number
filterMap['String'] = String
filterMap['Boolean'] = Boolean

export function defineFilter(name: string, filter: Filter) {
  filterMap[name] = filter
}
