import {
  temmeParser,
  TemmeSelector,
  universalSelector,
  NormalSelector,
  ContentPartCapture,
} from '../src/index'

test('parse empty selector', () => {
  expect(temmeParser.parse('')).toBeNull()
  expect(temmeParser.parse('   ')).toBeNull()
  expect(temmeParser.parse('\t\t  \n\n')).toBeNull()
})

describe('parse value assignment', () => {
  test('at top-level', () => {
    const expected: TemmeSelector[] = [{
      type: 'assignment',
      capture: { name: 'a', filterList: [] },
      value: '123',
    }]
    expect(temmeParser.parse(`$a="123"`)).toEqual(expected)
    expect(temmeParser.parse(`$a = '123'`)).toEqual(expected)
    expect(temmeParser.parse(`$a   \t\n= '123'`)).toEqual(expected)
  })

  test('in children selectors', () => {
    const selector = `
      div@list {
        $a = null;
      };
    `
    const expected: TemmeSelector[] = [{
      type: 'normal-selector',
      arrayCapture: { name: 'list', filterList: [] },
      sections: [{
        combinator: ' ',
        element: 'div',
        qualifiers: [],
        content: [],
      }],
      children: [{
        type: 'assignment',
        capture: { name: 'a', filterList: [] },
        value: null,
      }],
    }]
    expect(temmeParser.parse(selector)).toEqual(expected)
  })

  test('in content', () => {
    const selector = 'div{$foo = true}'
    const expected: TemmeSelector[] = [{
      type: 'normal-selector',
      arrayCapture: null,
      sections: [{
        combinator: ' ',
        element: 'div',
        qualifiers: [],
        content: [{
          type: 'assignment',
          capture: { name: 'foo', filterList: [] },
          value: true,
        }],
      }],
      children: [],
    }]
    expect(temmeParser.parse(selector)).toEqual(expected)
  })
})

test('parse simple selector: `div`', () => {
  const parseResult: TemmeSelector[] = temmeParser.parse('div')
  const expectedResult: TemmeSelector[] = [{
    type: 'normal-selector',
    arrayCapture: null,
    sections: [{
      combinator: ' ',
      element: 'div',
      qualifiers: [],
      content: [],
    }],
    children: [],
  }]
  expect(parseResult).toEqual(expectedResult)
})

describe('parse capture', () => {
  test('attribute capture and content capture at top level', () => {
    const selector = `#question-header .question-hyperlink[href=$url]{$title}`
    const parseResult: TemmeSelector[] = temmeParser.parse(selector)

    const expectedResult: TemmeSelector[] = [{
      type: 'normal-selector',
      arrayCapture: null,
      sections: [{
        combinator: ' ',
        element: universalSelector,
        qualifiers: [{
          type: 'id-qualifier',
          id: 'question-header',
        }],
        content: [],
      }, {
        combinator: ' ',
        element: universalSelector,
        qualifiers: [{
          type: 'class-qulifier',
          className: 'question-hyperlink',
        }, {
          type: 'attribute-qualifier',
          attribute: 'href',
          operator: '=',
          value: { name: 'url', filterList: [] },
        }],
        content: [{
          type: 'capture',
          capture: { name: 'title', filterList: [] },
        }],
      }],
      children: [],
    }]

    expect(parseResult).toEqual(expectedResult)
  })

  test('array capture and content capture in children selectors', () => {
    const selector = `
      div@list {
        .foo{$h|html};
      };
    `
    const parseResult = temmeParser.parse(selector)

    const expectedResult: TemmeSelector[] = [{
      type: 'normal-selector',
      arrayCapture: { name: 'list', filterList: [] },
      sections: [{ combinator: ' ', element: 'div', qualifiers: [], content: [] }],
      children: [{
        type: 'normal-selector',
        arrayCapture: null,
        sections: [{
          combinator: ' ',
          element: universalSelector,
          qualifiers: [{ type: 'class-qulifier', className: 'foo' }],
          content: [{
            type: 'capture',
            capture: { name: 'h', filterList: [{ name: 'html', args: [] }] },
          }],
        }],
        children: [],
      }],
    }]

    expect(parseResult).toEqual(expectedResult)
  })
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
  function extractFilterList(selectors: TemmeSelector[]) {
    return ((selectors[0] as NormalSelector).sections[0].content[0] as ContentPartCapture)
      .capture.filterList
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
    type: 'normal-selector',
    sections: [{
      combinator: ' ',
      element: 'div',
      qualifiers: [],
      content: [],
    }],
    arrayCapture: null,
    children: [],
  }, {
    type: 'normal-selector',
    sections: [{
      combinator: ' ',
      element: 'li',
      qualifiers: [],
      content: [],
    }],
    arrayCapture: null,
    children: [],
  }] as TemmeSelector[])

  const selector = 'a,b,c,d,e'
  const parseOneByOneAndConcat = selector.split(',').map(s => temmeParser.parse(s))
    .reduce((a: TemmeSelector[], b: TemmeSelector[]) => a.concat(b))
  const parseMultipleAtOneTime = temmeParser.parse(selector)
  expect(parseMultipleAtOneTime).toEqual(parseOneByOneAndConcat)
})

test('use semicolon as selector seprator', () => {
  expect(temmeParser.parse('div; li;'))
    .toEqual(temmeParser.parse('div, li,'))

  expect(temmeParser.parse('a;b;c;d;e'))
    .toEqual(temmeParser.parse('a,b,c,d,e'))

  expect(temmeParser.parse('parent@p { div; li; .foo; }; another'))
    .toEqual(temmeParser.parse('parent@p { div, li, .foo, }, another'))
})
