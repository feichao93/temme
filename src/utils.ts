import { Capture, Dict, CssSlice, SelfSelector } from './temme'

// TODO
export class CaptureResult {
}

// 对string进行多段匹配/捕获
// multisectionMatch('I like apple', ['I', $foo])的结果为
//  { foo: ' like apple' }
// 如果匹配失败, 则返回null
// todo 需要用回溯的方法来正确处理多种匹配选择的情况
export function multisectionMatch(s: string, args: (string | Capture)[], trim = true) {
  if (trim) {
    s = s.trim()
  }
  const result: Dict<string> = {}
  // 标记正在进行的capture, null表示没有在捕获中
  let capturing: Capture = null
  let charIndex = 0
  for (const arg of args) {
    if (typeof arg === 'string') {
      if (capturing) {
        const c = s.indexOf(arg, charIndex)
        if (c === -1) {
          return null
        } else {
          result[capturing.name] = s.substring(charIndex, c)
          capturing = null
          charIndex = c + arg.length
        }
      } else {
        if (s.substring(charIndex).startsWith(arg)) {
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
    result[capturing.name] = s.substring(charIndex).trim()
    charIndex = s.length
  }
  if (charIndex !== s.length) {
    // 字符串结尾处还有字符尚未匹配
    return null
  }
  return result
}


/** 根据CssPart数组构造标准的css selector */
export function makeNormalCssSelector(slices: CssSlice[]) {
  const seperator = ' '
  const result: string[] = []
  slices.forEach((slice, index) => {
    if (index !== 0) {
      result.push(seperator)
    }
    if (slice.direct) {
      result.push('>')
    }
    if (slice.tag) {
      result.push(slice.tag)
    }
    if (slice.id) {
      result.push('#' + slice.id)
    }
    if (slice.classList) {
      slice.classList.forEach(cls => result.push('.' + cls))
    }
    if (slice.attrList && slice.attrList.some(attr => (typeof attr.value === 'string'))) {
      result.push('[')
      slice.attrList.forEach(attr => {
        if (attr.value === '') {
          result.push(attr.name)
        } else if (typeof attr.value === 'string') {
          result.push(`${attr.name}="${attr.value}"`)
        } else { // value-capture
          result.push(seperator)
        }
      })
      result.push(']')
    }
  })
  return result.join('')
}

export function makeNormalCssSelectorFromSelfSelector(selector: SelfSelector) {
  return makeNormalCssSelector([{
    direct: false,
    tag: '',
    id: selector.id,
    classList: selector.classList,
    attrList: selector.attrList,
    content: selector.content,
  }])
}

export function mergeResult<T, S>(target: T, source: S): T & S {
  for (const key in source) {
    if (source[key] != null) {
      (<any>target)[key] = source[key]
    }
  }
  return target as any
}

export function isEmptyObject(x: any) {
  return typeof x === 'object'
    && Object.getPrototypeOf(x) === Object.prototype
    && Object.keys(x).length === 0
}

export function isCheerioStatic(arg: CheerioStatic | CheerioElement): arg is CheerioStatic {
  return typeof (<CheerioStatic>arg).root === 'function'
}
