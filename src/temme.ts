import cheerio from 'cheerio'
import invariant from 'invariant'
import { defaultFilterMap, FilterFn } from './filters'
import { contentFunctions } from './contentFunctions'
import { checkRootSelector, msg } from './check'
import { CaptureResult } from './CaptureResult'
import { SPECIAL_FILTER_NAMES } from './constants'
import { isAttributeQualifier, isCheerioStatic, makeNormalCssSelector } from './utils'
import {
  AttributeQualifier,
  Content,
  Dict,
  ExpandedTemmeSelector,
  NormalSelector,
  ParentRefSelector,
  SnippetDefine,
  TemmeSelector,
} from './interfaces'
import { defaultModifierMap, ModifierFn } from './modifier'

export interface TemmeParser {
  parse(temmeSelectorString: string): TemmeSelector[]
}

/** Prepare the temme-parser.
 * In the webpack building context, we use pegjs-loader to load parser from the grammar file.
 * In other context (e.x. jest context), we use fs and pegjs to generate the parser. */
declare const WEBPACK_BUILD: boolean
let temmeParser: TemmeParser
if (typeof WEBPACK_BUILD !== 'undefined' && WEBPACK_BUILD) {
  temmeParser = require('./grammar.pegjs')
} else {
  const fs = require('fs')
  const pegjs = require('pegjs')
  const source = fs.readFileSync('./src/grammar.pegjs', 'utf8')
  temmeParser = pegjs.generate(source)
}

export { cheerio, temmeParser }

export default function temme(
  html: string | CheerioStatic | CheerioElement,
  selector: string | TemmeSelector[],
  extraFilters: Dict<FilterFn> = {},
  extraModifiers: Dict<ModifierFn> = {},
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

  rootSelectorArray.forEach(checkRootSelector)

  const filterFnMap: Dict<FilterFn> = Object.assign({}, defaultFilterMap, extraFilters)
  const modifierFnMap: Dict<ModifierFn> = Object.assign({}, defaultModifierMap, extraModifiers)
  const snippetsMap = new Map<string, SnippetDefine>()

  return helper($.root(), rootSelectorArray).getResult()

  function helper(cntCheerio: Cheerio, selectorArray: TemmeSelector[]): CaptureResult {
    const result = new CaptureResult(filterFnMap, modifierFnMap)

    // First pass: process SnippetDefine and FilterDefine
    for (const selector of selectorArray) {
      if (selector.type === 'snippet-define') {
        invariant(!snippetsMap.has(selector.name), msg.snippetAlreadyDefined(selector.name))
        snippetsMap.set(selector.name, selector)
      } else if (selector.type === 'filter-define') {
        const { name, argsPart, code } = selector
        invariant(!(name in filterFnMap), msg.filterAlreadyDefined(name))
        const funcString = `(function (${argsPart}) { ${code} })`
        filterFnMap[name] = eval(funcString)
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
    if (selector.type === 'normal-selector') {
      const { sections, content } = selector
      // Value-captures not in the last section will be ignored
      const lastSection = sections[sections.length - 1]
      captureAttributes(result, node, lastSection.qualifiers.filter(isAttributeQualifier))
      captureContent(result, node, content)
    } else {
      // selector.type === 'parent-ref-selector'
      const { section, content } = selector
      captureAttributes(result, node, section.qualifiers.filter(isAttributeQualifier))
      captureContent(result, node, content)
    }
  }

  function captureAttributes(
    result: CaptureResult,
    node: Cheerio,
    attributeQualifiers: AttributeQualifier[],
  ) {
    for (const qualifier of attributeQualifiers) {
      if (qualifier.value != null && typeof qualifier.value === 'object') {
        const { attribute, value: capture } = qualifier
        const attributeValue = node.attr(attribute)
        if (attributeValue !== undefined) {
          // capture only when attribute exists
          result.add(capture, attributeValue)
        }
      }
    }
  }

  function captureContent(result: CaptureResult, node: Cheerio, content: Content) {
    if (content == null) {
      return
    }
    if (content.type === 'capture') {
      const { name, filterList, modifier } = content.capture
      // `text`, `html` and `node` are three special filter names.
      // They have the same syntax with the normal filters, but have different running semantics.
      const firstFilterName = filterList[0] && filterList[0].name
      let value: any
      if (firstFilterName === 'html') {
        value = node.html()
      } else if (firstFilterName === 'outerHTML') {
        value = $.html(node)
      } else if (firstFilterName === 'node') {
        value = cheerio(node)
      } else {
        // `text` is the default filter
        value = node.text()
      }
      // Remove the first special filter.
      const normalFilterList = SPECIAL_FILTER_NAMES.includes(firstFilterName)
        ? filterList.slice(1)
        : filterList
      result.add({ name, filterList: normalFilterList, modifier }, value)
    } else if (content.type === 'assignment') {
      const { capture, value } = content
      result.add(capture, value)
    } else {
      // content.type === 'call'
      const { funcName, args } = content
      const fn = contentFunctions.get(funcName)
      fn(result, node, ...args)
    }
  }
}
