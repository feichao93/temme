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
  hasPseudoQualifier() {
    return 'pseudo-qualifier is not supported.'
  },
  selfSelectorAtTopLevel() {
    return 'selfSelectorAtTopLevel' // TODO
  },
  snippetAlreadyDefined(name: string) {
    return `Snippet ${name} is already define.`
  },
  snippetDefineNotAtTopLevel() {
    return 'snippetDefineNotAtTopLevel' // TODO
  },
  snippetNotDefined(name: string) {
    return `Snippet ${name} is not defined.`
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

export default function check(selector: TemmeSelector) {
  commonCheck(selector)
  if (selector.type === 'self-selector') {
    throw new Error(errorMessages.selfSelectorAtTopLevel())
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
      throw new Error(errorMessages.hasLeadingCapture())
    }
  }
}

export function checkChild(selector: TemmeSelector) {
  commonCheck(selector)
  if (selector.type === 'snippet-define') {
    throw new Error(errorMessages.snippetDefineNotAtTopLevel())
  } else if (selector.type === 'normal-selector') {
    for (const child of selector.children) {
      checkChild(child)
    }
  }
}
