import { Section, TemmeSelector } from './interfaces'

export const errors = {
  // funcNameNotSupported(f: string) {
  //   return `${f} is not a valid content func-name.`
  // },
  hasLeadingCapture() {
    return 'Attr capturing and content matching/capturing are only allowed in the last part of css-selector. Capture in leading css-selectors will be omitted. Did you forget the comma?'
  },
}

function containsAnyCaptureInAttrListOrContent(slices: Section[]) {
  return slices.some(part => {
    const hasAttrCapture = part.attrList && part.attrList.some(attr => typeof attr.value !== 'string')
    if (hasAttrCapture) {
      return true
    }
    const hasContentCapture = part.content && part.content.length > 0
    if (hasContentCapture) {
      return true
    }
    return false
  })
}

// notice 递归的检查 selector是否合法
export default function check(selector: TemmeSelector) {
  if (selector.type === 'self-selector') {
  } else if (selector.type === 'assignment') {
  } else {
    const cssPartsLength = selector.css.length
    const leadingParts = selector.css.slice(0, cssPartsLength - 1)
    const hasLeadingCapture = containsAnyCaptureInAttrListOrContent(leadingParts)
    if (hasLeadingCapture) {
      throw new Error(errors.hasLeadingCapture())
    }
    for (const child of selector.children) {
      check(child)
    }
  }
}
