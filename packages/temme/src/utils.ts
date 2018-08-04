import invariant from 'invariant'
import { Section, Qualifier, AttributeQualifier, Capture } from './interfaces'
import { msg } from './check'

/** Generator standard css selector according to temme sections. */
export function makeNormalCssSelector(sections: Section[]) {
  const result: string[] = []
  for (const section of sections) {
    result.push(section.combinator)
    result.push(section.element)
    for (const qualifier of section.qualifiers) {
      if (qualifier.type === 'id-qualifier') {
        result.push(`#${qualifier.id}`)
      } else if (qualifier.type === 'class-qualifier') {
        result.push(`.${qualifier.className}`)
      } else if (qualifier.type === 'attribute-qualifier') {
        const { attribute, operator, value } = qualifier
        if (operator == null && value == null) {
          // existence
          result.push(`[${attribute}]`)
        } else if (isCapture(value)) {
          // Here we does not handle captures, but simply check if the operator is `=`
          invariant(operator === '=', msg.valueCaptureWithOtherOperator())
        } else {
          // Normal css attribute qualifier
          result.push(`[${attribute}${operator}"${value}"]`)
        }
      } else {
        // pseudo-qualifier
        const { name, content } = qualifier
        if (content) {
          result.push(`:${name}(${content})`)
        } else {
          result.push(`:${name}`)
        }
      }
    }
  }
  return result.join('').trim()
}

export function isEmptyObject(x: any) {
  return (
    x !== null &&
    typeof x === 'object' &&
    Object.getPrototypeOf(x) === Object.prototype &&
    Object.keys(x).length === 0
  )
}

export function isCheerioStatic(arg: CheerioStatic | CheerioElement): arg is CheerioStatic {
  return typeof (<CheerioStatic>arg).root === 'function'
}

export function isAttributeQualifier(qualifier: Qualifier): qualifier is AttributeQualifier {
  return qualifier.type === 'attribute-qualifier'
}

export function isCapture(x: any): x is Capture {
  return (
    x != null && typeof x === 'object' && typeof x.name === 'string' && Array.isArray(x.filterList)
  )
}

export function last<T>(arr: T[]): T {
  return arr[arr.length - 1]
}
