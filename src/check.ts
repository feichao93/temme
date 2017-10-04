import { Section, TemmeSelector, Qualifier } from './interfaces'

// TODO enhance error reporting

export const errorMessages = {
  invalidFilter(name: string) {
    return `${name} is not a valid filter.`
  },
  invalidContentFunction(name: string) {
    return `${name} is not a valid content function.`
  },
  hasLeadingCapture() {
    return 'Attr capturing and content matching/capturing are only allowed in the last css section. Capture in leading css-selectors will be omitted. Did you forget the semicolon?'
  },
}

function isCaptureQualifier(qualifier: Qualifier) {
  return qualifier.type === 'attribute-qualifier'
    && qualifier.value
    && typeof qualifier.value === 'object'
}

function containsAnyCapture(sections: Section[]) {
  return sections.some(section => {
    return section.qualifiers.some(isCaptureQualifier)
      || section.content.length > 0
  })
}

// notice 递归的检查 selector是否合法
export default function check(selector: TemmeSelector) {
  if (selector.type === 'self-selector') {
  } else if (selector.type === 'assignment') {
  } else {
    const sectionCount = selector.sections.length
    const leadingSections = selector.sections.slice(0, sectionCount - 1)
    const hasLeadingCapture = containsAnyCapture(leadingSections)
    if (hasLeadingCapture) {
      throw new Error(errorMessages.hasLeadingCapture())
    }
    for (const child of selector.children) {
      check(child)
    }
  }
}
