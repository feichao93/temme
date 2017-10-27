import { Capture } from './interfaces'
import { CaptureResult } from './CaptureResult'
import { msg } from './check'

export interface ContentFn {
  (result: CaptureResult, node: Cheerio, ...args: any[]): void
}

/** @deprecated */
function match(result: CaptureResult, node: Cheerio, args: (string | Capture)[]): void {
  const s = node.text().trim()
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

const defaultContentFunctions = {
  match,
}

const map = new Map<string, ContentFn>()

export const contentFunctions = {
  get(name: string) {
    if (map.has(name)) {
      return map.get(name)
    } else {
      throw new Error(msg.invalidContentFunction(name))
    }
  },

  set(name: string, fn: ContentFn) {
    map.set(name, fn)
  },

  remove(name: string) {
    map.delete(name)
  },
}

for (const [name, fn] of Object.entries(defaultContentFunctions)) {
  contentFunctions.set(name, fn)
}
