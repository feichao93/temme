import { temmeParser, TemmeSelector } from '../src/temme'

test('parse empty selector', () => {
  expect(temmeParser.parse('')).toBeNull()
  expect(temmeParser.parse('   ')).toBeNull()
  expect(temmeParser.parse('\t\t  \n\n')).toBeNull()
})

test('parse value assignment', () => {
  const expected: TemmeSelector[] = [{
    type: 'assignment',
    capture: { capture: 'a', filterList: [] },
    value: '123',
  }]
  expect(temmeParser.parse(`$a="123"`)).toEqual(expected)
  expect(temmeParser.parse(`$a = '123'`)).toEqual(expected)
  expect(temmeParser.parse(`$a   \t\n= '123'`)).toEqual(expected)
})

test('parse `div`', () => {
  const parseResult: TemmeSelector[] = temmeParser.parse('div')
  const expectedResult: TemmeSelector[] = [{
    type: 'normal',
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
    type: 'normal',
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

test('ignore JavaScript comments', () => {
  expect(temmeParser.parse('/* abcdef */')).toBeNull()
  expect(temmeParser.parse('// abcdef')).toBeNull()

  const s1 = `
    // single line comment
    /* multi
      line commnet */
      /* pre*/div{$} // after
  `
  const s2 = 'div{$}'
  expect(temmeParser.parse(s1))
    .toEqual(temmeParser.parse(s2))

  const s3 = `
    /*111*/div[/*222*/foo=$bar/*333*/]{ //444
    html($foo)}
  `
  const s4 = 'div[foo=$bar]{html($foo)}'
  expect(temmeParser.parse(s3))
    .toEqual(temmeParser.parse(s4))
})

// todo test filterList...
