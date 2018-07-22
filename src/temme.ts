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
  ContentPart,
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
  const createCaptureResult = () => new CaptureResult(filterFnMap, modifierFnMap)
  const snippetsMap = new Map<string, SnippetDefine>()

  return helper($.root(), rootSelectorArray).getResult()

  function helper(cntCheerio: Cheerio, selectorArray: TemmeSelector[]): CaptureResult {
    const result = createCaptureResult()

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
          result.merge(capture(subCheerio.first(), selector))
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
          result.merge(capture(cntCheerio, selector))
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
  function capture(node: Cheerio, selector: NormalSelector | ParentRefSelector): CaptureResult {
    const result = createCaptureResult()

    if (selector.type === 'normal-selector') {
      const { sections, content } = selector
      // Value-captures in the last section will be processed.
      // Preceding value-captures will be ignored.
      const { qualifiers } = sections[sections.length - 1]
      result.mergeWithFailPropagation(
        captureAttributes(node, qualifiers.filter(isAttributeQualifier)),
      )
      result.mergeWithFailPropagation(captureContent(node, content))
    } else {
      // selector.type === 'parent-ref-selector'
      const {
        section: { qualifiers },
        content,
      } = selector
      result.mergeWithFailPropagation(
        captureAttributes(node, qualifiers.filter(isAttributeQualifier)),
      )
      result.mergeWithFailPropagation(captureContent(node, content))
    }
    return result
  }

  function captureAttributes(node: Cheerio, attributeQualifiers: AttributeQualifier[]) {
    const result = createCaptureResult()
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
    return result
  }

  function captureContent(node: Cheerio, content: ContentPart[]): CaptureResult {
    const result = createCaptureResult()
    for (const part of content) {
      if (part.type === 'capture') {
        const {
          capture: { name, filterList, modifier },
        } = part
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
      } else if (part.type === 'assignment') {
        const { capture, value } = part
        result.add(capture, value)
      } else {
        // part.type === 'call'
        const { funcName, args } = part
        contentFunctions.get(funcName)(result, node, args)
      }
    }
    return result
  }
}
