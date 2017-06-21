import { GrammarError } from 'pegjs'

const hintChar = '^'
const hintIndent = '   '
const contentIndent = '>  '

export default function makeGrammarErrorMessage(selector: string, error: GrammarError) {
  const { start, end } = error.location
  const splited = selector.split('\n')
  const msgs: string[] = [error.message]
  if (start.line >= 3) {
    msgs.push(contentIndent + splited[start.line - 3])
  }
  if (start.line >= 2) {
    msgs.push(contentIndent + splited[start.line - 2])
  }

  // first error line
  msgs.push(contentIndent + splited[start.line - 1])
  const spacePart = ' '.repeat(start.column - 1)
  let hintPart: string
  if (start.line === end.line) {
    hintPart = hintChar.repeat(Math.max(1, end.column - start.column))
  } else {
    hintPart = hintChar.repeat(Math.max(1, splited[start.line - 1].length - start.column - 1))
  }
  msgs.push(hintIndent + spacePart + hintPart)

  // intermediate error lines
  for (let line = start.line + 1; line <= end.line - 1; line++) {
    const row = splited[line - 1]
    if (row.length > 0) {
      msgs.push(contentIndent + row)
      msgs.push(hintIndent + hintChar.repeat(row.length))
    }
  }

  // last-error-line
  if (start.line < end.line) {
    const row = splited[end.line - 1]
    if (row.length > 0) {
      msgs.push(contentIndent + splited[end.line - 1])
      msgs.push(hintIndent + hintChar.repeat(end.column - 1))
    }
  }

  return msgs.join('\n')
}
