import * as path from 'path'
import * as fs from 'fs'
import * as pegjs from 'pegjs'
import * as cheerio from 'cheerio'

const defaultCaptureKey = '@@default-capture@@'

const grammar = fs.readFileSync(path.resolve(__dirname, 'temme.pegjs'), 'utf8')

export const temmeParser = pegjs.generate(grammar)

type TemmeSelector = SelfSelector | NonSelfSelector

interface NonSelfSelector {
  self: false
  name: string
  css: CssPart[]
  children: TemmeSelector[]
}

interface SelfSelector {
  self: true
  attrList: { name: string, value: string | Capture<string> }[]
  content: string | Capture<string>
}

export type CaptureResult = any

interface CssPart {
  direct: boolean
  tag: string
  id: string
  classList: string[]
  attrList: {
    name: string
    value: string | Capture<string>
  }[]
  content: string | Capture<string>
}

type Capture<T> = {
  capture: T
}

export default function temme(html: string | CheerioStatic, selectorString: string) {
  let $: CheerioStatic
  if (typeof html === 'string') {
    $ = cheerio.load(html)
  } else {
    $ = html
  }
  const rootSelector = temmeParser.parse(selectorString) as TemmeSelector

  function helper(cntCheerio: Cheerio, selectorArray: TemmeSelector[]) {
    const result: CaptureResult = {}
    selectorArray.map(selector => {
      if (selector.self === false) {
        const cssSelector = makeNormalCssSelector(selector.css)
        const subCheerio = cntCheerio.find(cssSelector)
        const capturer = makeValueCapturer(selector.css)
        Object.assign(result, capturer(subCheerio))

        if (selector.name && selector.children) {
          result[selector.name] = subCheerio.toArray()
            .map(sub => helper($(sub), selector.children))
            .filter(r => Object.keys(r).length > 0)
        }
      } else {
        const cssSelector = makeNormalCssSelector([{
          direct: false,
          tag: '',
          id: '',
          classList: null,
          attrList: selector.attrList,
          content: selector.content,
        }])
        if (cssSelector === '' || cntCheerio.is(cssSelector)) {
          const capturer = makeSelfCapturer(selector)
          Object.assign(result, capturer(cntCheerio))
        }
      }
    })
    if (result[defaultCaptureKey]) {
      return result[defaultCaptureKey]
    } else {
      return result
    }
  }

  return helper($.root(), [rootSelector])
}

function makeSelfCapturer(selfSelector: SelfSelector) {
  return (node: Cheerio) => {
    const result: CaptureResult = {}
    if (selfSelector.attrList) {
      selfSelector.attrList.forEach(attr => {
        if (typeof attr.value === 'object') {
          result[attr.value.capture] = node.attr(attr.name)
        }
      })
    }
    if (selfSelector.content && typeof selfSelector.content === 'object') {
      result[selfSelector.content.capture] = node.text()
    }
    return result
  }
}

function makeValueCapturer(cssArray: CssPart[]) {
  return (node: Cheerio) => {
    const result: CaptureResult = {}
    // todo 目前只能在最后一个part中进行value-capture
    const lastPart = cssArray[cssArray.length - 1]
    if (lastPart.attrList) {
      lastPart.attrList.forEach(attr => {
        if (typeof attr.value === 'object') {
          result[attr.value.capture] = node.attr(attr.name)
        }
      })
    }
    if (lastPart.content && typeof lastPart.content === 'object') {
      result[lastPart.content.capture] = node.text()
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
