import cheerio from 'cheerio'
import invariant from 'invariant'
import { defaultFilterDict, FilterFn } from './filters'
import { defaultProcedureDict, ProcedureFn } from './procedures'
import { defaultModifierDict, ModifierFn } from './modifiers'
import { checkRootSelector, msg } from './check'
import { CaptureResult } from './CaptureResult'
import {
  isAttributeQualifier,
  isCapture,
  isCheerioStatic,
  last,
  makeNormalCssSelector,
} from './utils'
import {
  Dict,
  ExpandedTemmeSelector,
  NormalSelector,
  ParentRefSelector,
  SnippetDefine,
  TemmeSelector,
} from './interfaces'

export interface TemmeParser {
  parse(temmeSelectorString: string): TemmeSelector[]
}

// Note that we are importing .pegjs file directly which requires using rollup as the bundler.
// @ts-ignore
import parser from './grammar.pegjs'

const temmeParser: TemmeParser = parser

export { cheerio, temmeParser }

export default function temme(
  html: string | CheerioStatic | CheerioElement,
  selector: string | TemmeSelector[],
  extraFilters: Dict<FilterFn> = {},
  extraModifiers: Dict<ModifierFn> = {},
  extraProcedures: Dict<ProcedureFn> = {},
) {
  let $: CheerioStatic
  if (typeof html === 'string') {
    $ = cheerio.load(html, { decodeEntities: false })
  } else if (isCheerioStatic(html)) {
    $ = html
  } else {
    $ = cheerio.load(html)
  }

  let rootSelectorArray: TemmeSelector[]
  if (typeof selector === 'string') {
    rootSelectorArray = temmeParser.parse(selector)
  } else {
    rootSelectorArray = selector
  }
  if (rootSelectorArray.length === 0) {
    return null
  }

  if (process.env.NODE_ENV === 'development') {
    rootSelectorArray.forEach(checkRootSelector)
  }

  const filterDict: Dict<FilterFn> = Object.assign({}, defaultFilterDict, extraFilters)
  const modifierDict: Dict<ModifierFn> = Object.assign({}, defaultModifierDict, extraModifiers)
  const procedureDict: Dict<ProcedureFn> = Object.assign({}, defaultProcedureDict, extraProcedures)
  const snippetsMap = new Map<string, SnippetDefine>()

  return helper($.root(), rootSelectorArray).getResult()

  function helper(cntCheerio: Cheerio, selectorArray: TemmeSelector[]): CaptureResult {
    const result = new CaptureResult(filterDict, modifierDict)

    // First pass: process SnippetDefine / FilterDefine / ModifierDefine / ProcedureDefine
    for (const selector of selectorArray) {
      if (selector.type === 'snippet-define') {
        invariant(!snippetsMap.has(selector.name), msg.snippetAlreadyDefined(selector.name))
        snippetsMap.set(selector.name, selector)
      } else if (selector.type === 'filter-define') {
        const { name, argsPart, code } = selector
        invariant(!(name in filterDict), msg.filterAlreadyDefined(name))
        const funcString = `(function (${argsPart}) { ${code} })`
        filterDict[name] = eval(funcString)
      } else if (selector.type === 'modifier-define') {
        const { name, argsPart, code } = selector
        invariant(!(name in modifierDict), msg.modifierAlreadyDefined(name))
        const funcString = `(function (${argsPart}) { ${code} })`
        modifierDict[name] = eval(funcString)
      } else if (selector.type === 'procedure-define') {
        const { name, argsPart, code } = selector
        invariant(!(name in modifierDict), msg.procedureAlreadyDefined(name))
        const funcString = `(function (${argsPart}) { ${code} })`
        procedureDict[name] = eval(funcString)
      }
    }

    // Second pass: process match and capture
    for (const selector of expandSnippets(selectorArray)) {
      if (selector.type === 'normal-selector') {
        const cssSelector = makeNormalCssSelector(selector.sections)
        const subCheerio = cntCheerio.find(cssSelector)
        if (subCheerio.length > 0) {
          // Only the first element will be captured.
          capture(result, subCheerio.first(), selector)
        }
        if (selector.arrayCapture) {
          result.add(
            selector.arrayCapture,
            subCheerio.toArray().map(sub => helper($(sub), selector.children).getResult()),
          )
        }
      } else if (selector.type === 'parent-ref-selector') {
        const cssSelector = makeNormalCssSelector([selector.section])
        if (cntCheerio.is(cssSelector)) {
          capture(result, cntCheerio, selector)
        }
      } else if (selector.type === 'assignment') {
        result.forceAdd(selector.capture, selector.value)
      } // else selector.type is 'snippet-define' or 'filter-define'. Do nothing.
    }
    return result
  }

  /** Expand snippets recursively.
   * The returned selector array will not contain any `SnippetExpand`.
   * `expanded` is used to detect circular expansion. */
  function expandSnippets(
    selectorArray: TemmeSelector[],
    expanded: string[] = [],
  ): ExpandedTemmeSelector[] {
    const result: ExpandedTemmeSelector[] = []
    for (const selector of selectorArray) {
      if (selector.type === 'snippet-expand') {
        invariant(snippetsMap.has(selector.name), msg.snippetNotDefined(selector.name))
        const snippet = snippetsMap.get(selector.name)
        const nextExpanded = expanded.concat(snippet.name)
        invariant(!expanded.includes(snippet.name), msg.circularSnippetExpansion(nextExpanded))
        const slice = expandSnippets(snippet.selectors, nextExpanded)
        result.push(...slice)
      } else {
        result.push(selector)
      }
    }
    return result
  }

  /** Capture the node according to the selector. Returns an `CaptureResult`. */
  function capture(
    result: CaptureResult,
    node: Cheerio,
    selector: NormalSelector | ParentRefSelector,
  ) {
    const section = selector.type === 'normal-selector' ? last(selector.sections) : selector.section

    for (const qualifier of section.qualifiers.filter(isAttributeQualifier)) {
      if (isCapture(qualifier.value)) {
        const { attribute, value: capture } = qualifier
        const attributeValue = node.attr(attribute)
        if (attributeValue !== undefined) {
          // capture only when attribute exists
          result.add(capture, attributeValue)
        }
      }
    }

    if (selector.procedure != null) {
      const { name, args } = selector.procedure
      const fn = procedureDict[name]
      invariant(typeof fn === 'function', msg.invalidProcedure(name))
      fn(result, node, ...args)
    }
  }
}
