import * as invariant from 'invariant'
import { Capture, Section, Qualifier, AttributeQualifier } from './interfaces'
import CaptureResult from './CaptureResult'

// 对string进行多段匹配/捕获
// multisectionMatch('I like apple', ['I', $foo])的结果为
//  { foo: ' like apple' }
// 如果匹配失败, 则返回null
// todo 需要用回溯的方法来正确处理多种匹配选择的情况
export function multisectionMatch(result: CaptureResult, node: Cheerio, args: (string | Capture)[], trim = true): void {
  let s = node.text()
  if (trim) {
    s = s.trim()
  }
  // 标记正在进行的capture, null表示没有在捕获中
  let capturing: Capture = null
  let charIndex = 0
  for (const arg of args) {
    if (typeof arg === 'string') {
      if (capturing) {
        const c = s.indexOf(arg, charIndex)
        if (c === -1) {
          result.setFailed()
        } else {
          result.add(capturing.name, s.substring(charIndex, c), capturing.filterList)
          capturing = null
          charIndex = c + arg.length
        }
      } else {
        if (s.substring(charIndex).startsWith(arg)) {
          charIndex += arg.length
        } else {
          result.setFailed()
        }
      }
    } else { // arg is value capture
      capturing = arg
    }
  }
  if (capturing) {
    result.add(capturing.name, s.substring(charIndex).trim(), capturing.filterList)
    charIndex = s.length
  }
  if (charIndex !== s.length) {
    // 字符串结尾处还有字符尚未匹配
    result.setFailed()
  }
}


/** 根据sections构造标准的CSS selector */
export function makeNormalCssSelector(sections: Section[]) {
  const result: string[] = []
  for (const sec of sections) {
    result.push(sec.combinator)
    result.push(sec.element) // TODO * universal element??
    for (const qualifier of sec.qualifiers) {
      if (qualifier.type === 'id-qualifier') {
        result.push('#' + qualifier.id)
      } else if (qualifier.type === 'class-qulifier') {
        result.push('.' + qualifier.className)
      } else if (qualifier.type === 'attribute-qualifier') {
        const { attribute, operator, value } = qualifier
        if (operator == null && value == null) { // existence
          result.push(`[${attribute}]`)
        } else if (typeof value === 'object') { // capture
          invariant(operator === '=', 'Value capture in attribute qualifier only works with `=` operator.')
        } else { // normal qualifier
          // TODO 这里是否需要考虑引号的问题?
          result.push(attribute, operator, value)
        }
      } else { // pseudo-qualifier
        console.warn('pseudo-qualifier is not supported.')
      }
    }
  }
  return result.join('')
}

export function isEmptyObject(x: any) {
  return typeof x === 'object'
    && Object.getPrototypeOf(x) === Object.prototype
    && Object.keys(x).length === 0
}

export function isCheerioStatic(arg: CheerioStatic | CheerioElement): arg is CheerioStatic {
  return typeof (<CheerioStatic>arg).root === 'function'
}

export function isAttributeQualifier(qualifier: Qualifier): qualifier is AttributeQualifier {
  return qualifier.type === 'attribute-qualifier'
}
