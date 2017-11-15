import { Qualifier, Section, TemmeSelector } from './interfaces'

export const msg = {
  invalidFilter(name: string) {
    return `${name} is not a valid filter.`
  },
  invalidContentFunction(name: string) {
    return `${name} is not a valid content function.`
  },
  hasLeadingAttributeCapture() {
    return 'Attribute capturing is only allowed in the last css section. Capture in leading css-selectors will be omitted.'
  },
  selfSelectorAtTopLevel() {
    return `Self-selector should not be at top level.`
  },
  snippetAlreadyDefined(name: string) {
    return `Snippet ${name} is already define.`
  },
  snippetDefineNotAtTopLevel(name: string) {
    return `The definition of snippet ${name} should be at top level.`
  },
  snippetNotDefined(name: string) {
    return `Snippet ${name} is not defined.`
  },
  valueCaptureWithOtherOperator() {
    return 'Value capture in attribute qualifier only works with `=` operator.'
  },
  circularSnippetExpansion(loop: string[]) {
    return `Circular snippet expansion detected: ${loop.join(' -> ')}`
  },
  arrayFilterAppliedToNonArrayValue(filterName: string) {
    return `Array-filter ${filterName} can only be applied to an array.`
  },
}

function isCaptureQualifier(qualifier: Qualifier) {
  return qualifier.type === 'attribute-qualifier'
    && qualifier.value
    && typeof qualifier.value === 'object'
}

function containsAnyCapture(sections: Section[]) {
  return sections.some(section => section.qualifiers.some(isCaptureQualifier))
}

export function check(selector: TemmeSelector) {
  commonCheck(selector)
  if (selector.type === 'self-selector') {
    throw new Error(msg.selfSelectorAtTopLevel())
  } else if (selector.type === 'normal-selector') {
    for (const child of selector.children) {
      checkChild(child)
    }
  } else if (selector.type === 'snippet-define') {
    for (const child of selector.selectors) {
      checkChild(child)
    }
  }
}

function commonCheck(selector: TemmeSelector) {
  if (selector.type === 'normal-selector') {
    const sectionCount = selector.sections.length
    const leadingSections = selector.sections.slice(0, sectionCount - 1)
    const hasLeadingCapture = containsAnyCapture(leadingSections)
    if (hasLeadingCapture) {
      throw new Error(msg.hasLeadingAttributeCapture())
    }
  }
}

export function checkChild(selector: TemmeSelector) {
  commonCheck(selector)
  if (selector.type === 'snippet-define') {
    throw new Error(msg.snippetDefineNotAtTopLevel(selector.name))
  } else if (selector.type === 'normal-selector') {
    for (const child of selector.children) {
      checkChild(child)
    }
  }
}
