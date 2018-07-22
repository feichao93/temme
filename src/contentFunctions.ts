import invariant from 'invariant'
import { Capture, Dict } from './interfaces'
import { CaptureResult } from './CaptureResult'
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
function find(result: CaptureResult, node: Cheerio, ...args: (string | Capture)[]): void {
  const invalidArgs = 'Invalid arguments received by match(...)'
  const s = node.text()
  if (args.length === 2) {
    const [before, after] = args
    invariant(
      (typeof before === 'string' && isCapture(after)) ||
        (isCapture(before) && typeof after === 'string'),
      invalidArgs,
    )
    if (typeof before === 'string') {
      const capture = after as Capture
      const i = s.indexOf(before)
      if (i === -1) {
        return
      }
      result.add(capture, s.substring(i + before.length))
    } else {
      const capture = before as Capture
      const i = s.indexOf(after as string)
      if (i === -1) {
        return
      }
      result.add(capture, s.substring(0, i))
    }
  } else {
    invariant(args.length === 3, invalidArgs)
    const [before, capture, after] = args as [string, Capture, string]
    invariant(
      typeof before === 'string' && isCapture(capture) && typeof after === 'string',
      invalidArgs,
    )
    const i = s.indexOf(before)
    if (i === -1) {
      return
    }
    const j = s.indexOf(after, i + before.length)
    if (j === -1) {
      return
    }
    result.add(capture, s.substring(i + before.length, j))
  }
}

export const contentFunctionDict: Dict<ContentFn> = {
  find,
}

export function defineContentFunction(name: string, contentFunction: ContentFn) {
  contentFunctionDict[name] = contentFunction
}
