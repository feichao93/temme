import { Capture, Dict } from './interfaces'
import CaptureResult from './CaptureResult'

// 对string进行多段匹配/捕获 下面的文档已经过时了
// multisectionMatch('I like apple', ['I', $foo])的结果为
//  { foo: ' like apple' }
// 如果匹配失败, 则返回null
// 注意有的时候会有多种匹配结果, 该匹配算法是贪心的, 只会选取第一种匹配结果
export function match(result: CaptureResult, node: Cheerio, args: (string | Capture)[], trim = true): void {
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

export interface ContentFn {
  (result: CaptureResult, node: Cheerio, ...args: any[]): void
}

export const defaultContentFunctions: Dict<ContentFn> = {
  match,
}

// TODO add support for customized content functions
