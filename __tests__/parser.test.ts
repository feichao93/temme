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
      classList: [],
      attrList: [],
      content: [],
    }],
    children: [],
    filterList: [],
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
        classList: [], attrList: [], content: [],
      },
      {
        direct: false, tag: null, id: null,
        classList: ['question-hyperlink'],
        attrList: [{ name: 'href', value: { capture: 'url', filterList: [] } }],
        content: [{ funcName: 'text', args: [{ capture: 'title', filterList: [] }] }],
      }
    ],
    children: [],
    filterList: [],
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

test('parse fitlers', () => {
  function extractFilterList(selectors: any) {
    return selectors[0].css[0].content[0].args[0].filterList
  }

  expect(extractFilterList(temmeParser.parse('html{$h|f}')))
    .toEqual([{ name: 'f', args: [] }])

  expect(extractFilterList(temmeParser.parse(`html{$h|f(1,null,'3')|g()|h(false,true,'234')}`)))
    .toEqual([
      { name: 'f', args: [1, null, '3'] },
      { name: 'g', args: [] },
      { name: 'h', args: [false, true, '234'] },
    ])
})

test('use comma as selector seprator', () => {
  expect(temmeParser.parse('div, li,')).toEqual([{
    type: 'normal',
    name: null,
    css: [{ direct: false, tag: 'div', id: null, classList: [], attrList: [], content: [] }],
    children: [],
    filterList: [],
  }, {
    type: 'normal',
    name: null,
    css: [{ direct: false, tag: 'li', id: null, classList: [], attrList: [], content: [] }],
    children: [],
    filterList: [],
  }])

  const selector = 'a,b,c,d,e'
  const parseOneByOneAndConcat = selector.split(',').map(s => temmeParser.parse(s))
    .reduce((a: TemmeSelector[], b: TemmeSelector) => a.concat(b))
  const parseMultipleAtOneTime = temmeParser.parse(selector)
  expect(parseMultipleAtOneTime).toEqual(parseOneByOneAndConcat)
})

test('use semicolon as selector seprator', () => {
  expect(temmeParser.parse('div; li;'))
    .toEqual(temmeParser.parse('div, li,'))

  expect(temmeParser.parse('a;b;c;d;e'))
    .toEqual(temmeParser.parse('a,b,c,d,e'))

  expect(temmeParser.parse('parent@p ( div; li; .foo; ); another'))
    .toEqual(temmeParser.parse('parent@p ( div, li, .foo, ), another'))
})
