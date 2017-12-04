import * as invariant from 'invariant'
import { Capture } from './interfaces'
import { CaptureResult } from './CaptureResult'
import { msg } from './check'
import { isCapture } from './utils'

export interface ContentFn {
  (result: CaptureResult, node: Cheerio, ...args: any[]): void
}

/** Try to capture text within a node's text.
 * This content function can have three forms:
 * 1. find('before-string', $capture)   Try to capture the text after 'before-string'
 * 2. find($capture, 'after-string')    Try to capture the text before 'after-string'
 * 3. find('pre', $capture, 'post')     Try to capture the text between 'pre' and 'post'
 * */
function find(result: CaptureResult, node: Cheerio, args: (string | Capture)[]): void {
  const invalidArgs = 'Invalid arguments received by match(...)'
  const s = node.text()
  if (args.length === 2) {
    const [before, after] = args
    invariant(
      typeof before === 'string' && isCapture(after) || isCapture(before) && typeof after === 'string',
      invalidArgs,
    )
    if (typeof before === 'string') {
      const capture = after as Capture
      const i = s.indexOf(before)
      if (i === -1) {
        result.setFailed()
      } else {
        result.add(capture.name, s.substring(i + before.length), capture.filterList)
      }
    } else {
      const capture = before as Capture
      const i = s.indexOf(after as string)
      if (i === -1) {
        result.setFailed()
      } else {
        result.add(capture.name, s.substring(0, i), capture.filterList)
      }
    }
  } else {
    invariant(args.length === 3, invalidArgs)
    const [before, capture, after] = args as [string, Capture, string]
    invariant(typeof before === 'string' && isCapture(capture) && typeof after === 'string', invalidArgs)
    const i = s.indexOf(before)
    if (i === -1) {
      result.setFailed()
    } else {
      const j = s.indexOf(after, i + before.length)
      if (j === -1) {
        result.setFailed()
      } else {
        result.add(capture.name, s.substring(i + before.length, j), capture.filterList)
      }
    }
  }
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

// Default content functions
contentFunctions.set('find', find)
