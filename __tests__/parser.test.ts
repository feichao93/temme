import { temmeParser, TemmeSelector } from '../src/temme'

test('parse `div`', () => {
  const parseResult: TemmeSelector[] = temmeParser.parse('div')
  const expectedResult: TemmeSelector[] = [{
    self: false,
    name: null,
    css: [{
      direct: false,
      tag: 'div',
      id: null,
      classList: null,
      attrList: null,
      content: null,
    }],
    children: null,
    filterList: null,
  }]
  expect(parseResult).toEqual(expectedResult)
})

test('parse value capture', () => {
  const selector = `#question-header .question-hyperlink[href=$url]{$title}`

  const parseResult: TemmeSelector[] = temmeParser.parse(selector)
  const expectedParseResult: TemmeSelector[] = [{
    self: false,
    name: null,
    css: [
      {
        direct: false, tag: null, id: 'question-header',
        classList: null, attrList: null, content: null,
      },
      {
        direct: false, tag: null, id: null,
        classList: ['question-hyperlink'],
        attrList: [{ name: 'href', value: { capture: 'url', filterList: [] } }],
        content: [{ funcName: 'text', args: [{ capture: 'title', filterList: [] }] }],
      }
    ],
    children: null,
    filterList: null,
  }]
  expect(parseResult).toEqual(expectedParseResult)
})

// todo test filterList...
