import {
  temmeParser,
  TemmeSelector,
  universalSelector,
  NormalSelector,
  ContentPartCapture,
  AttributeOperator,
  Combinator,
} from '../src/index'

test('parse empty selector', () => {
  expect(temmeParser.parse('')).toEqual([])
  expect(temmeParser.parse('   ')).toEqual([])
  expect(temmeParser.parse('\t\t  \n\n')).toEqual([])
})

describe('parse value assignment', () => {
  test('at top-level', () => {
    const expected: TemmeSelector[] = [{
      type: 'assignment',
      capture: { name: 'a', filterList: [] },
      value: '123',
    }]
    expect(temmeParser.parse(`$a="123";`)).toEqual(expected)
    expect(temmeParser.parse(`$a = '123';`)).toEqual(expected)
    expect(temmeParser.parse(`$a   \t\n= '123';`)).toEqual(expected)
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
      content: [],
      sections: [{
        combinator: ' ',
        element: 'div',
        qualifiers: [],
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
      }],
      content: [{
        type: 'assignment',
        capture: { name: 'foo', filterList: [] },
        value: true,
      }],
      children: [],
    }]
    expect(temmeParser.parse(selector)).toEqual(expected)
  })
})

test('parse simple selector: `div`', () => {
  const parseResult: TemmeSelector[] = temmeParser.parse('div;')
  const expectedResult: TemmeSelector[] = [{
    type: 'normal-selector',
    arrayCapture: null,
    sections: [{
      combinator: ' ',
      element: 'div',
      qualifiers: [],
    }],
    content: [],
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
      }, {
        combinator: ' ',
        element: universalSelector,
        qualifiers: [{
          type: 'class-qualifier',
          className: 'question-hyperlink',
        }, {
          type: 'attribute-qualifier',
          attribute: 'href',
          operator: '=',
          value: { name: 'url', filterList: [] },
        }],
      }],
      content: [{
        type: 'capture',
        capture: { name: 'title', filterList: [] },
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
      sections: [{ combinator: ' ', element: 'div', qualifiers: [] }],
      content: [],
      children: [{
        type: 'normal-selector',
        arrayCapture: null,
        sections: [{
          combinator: ' ',
          element: universalSelector,
          qualifiers: [{ type: 'class-qualifier', className: 'foo' }],
        }],
        content: [{
          type: 'capture',
          capture: { name: 'h', filterList: [{ isArrayFilter: false, name: 'html', args: [] }] },
        }],
        children: [],
      }],
    }]

    expect(parseResult).toEqual(expectedResult)
  })

  test('multiple attribute capture in one pair of brackets', () => {
    const selector = 'div[foo=$x bar=$y];'
    const parseResult = temmeParser.parse(selector)
    const expectedResult: TemmeSelector[] = [{
      type: 'normal-selector',
      sections: [{
        combinator: ' ',
        element: 'div',
        qualifiers: [{
          type: 'attribute-qualifier',
          attribute: 'foo',
          operator: '=',
          value: { name: 'x', filterList: [] },
        }, {
          type: 'attribute-qualifier',
          attribute: 'bar',
          operator: '=',
          value: { name: 'y', filterList: [] },
        }],
      }],
      content: [],
      arrayCapture: null,
      children: [],
    }]
    expect(parseResult).toEqual(expectedResult)
  })

  test('other different attribute operators', () => {
    const operators: AttributeOperator[] = ['=', '~=', '|=', '*=', '^=', '$=']
    for (const operator of operators) {
      const selector = `div[foo${operator}$x];`
      const parseResult = temmeParser.parse(selector)
      const expectedResult: TemmeSelector[] = [{
        type: 'normal-selector',
        sections: [{
          combinator: ' ',
          element: 'div',
          qualifiers: [{
            type: 'attribute-qualifier',
            attribute: 'foo',
            operator,
            value: { name: 'x', filterList: [] },
          }],
        }],
        content: [],
        arrayCapture: null,
        children: [],
      }]
      expect(parseResult).toEqual(expectedResult)
    }
  })
})

test('using string literal in attribute qualifiers', () => {
  const parseResult = temmeParser.parse(`[foo="a b c"];`)
  const expectedResult: TemmeSelector[] = [{
    type: 'normal-selector',
    sections: [{
      combinator: ' ',
      element: universalSelector,
      qualifiers: [{
        type: 'attribute-qualifier',
        attribute: 'foo',
        operator: '=',
        value: 'a b c',
      }],
    }],
    content: [],
    arrayCapture: null,
    children: [],
  }]
  expect(parseResult).toEqual(expectedResult)

  expect(temmeParser.parse(`[foo='a b c'];`)).toEqual(expectedResult)
})

describe('test different section combinator', () => {
  function getExpectedResult(combinator: Combinator): TemmeSelector[] {
    return [{
      type: 'normal-selector',
      sections: [{
        combinator: ' ',
        element: 'div',
        qualifiers: [],
      }, {
        combinator,
        element: 'div',
        qualifiers: [],
      }],
      content: [],
      arrayCapture: null,
      children: [],
    }]
  }

  for (const combinator of [' ', '>', '+', '~'] as Combinator[]) {
    test(`test ${JSON.stringify(combinator)}`, () => {
      const parseResult = temmeParser.parse(`div ${combinator} div;`)
      expect(parseResult).toEqual(getExpectedResult(combinator))
    })
  }
})

test('ignore JavaScript comments', () => {
  expect(temmeParser.parse('/* abcdef */')).toEqual([])
  expect(temmeParser.parse('// abcdef')).toEqual([])

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
    return ((selectors[0] as NormalSelector).content[0] as ContentPartCapture)
      .capture.filterList
  }

  expect(extractFilterList(temmeParser.parse('html{$h|f}')))
    .toEqual([{ isArrayFilter: false, name: 'f', args: [] }])

  expect(extractFilterList(temmeParser.parse(`html{$h|f(1,null,'3')|g()|h(false,true,'234')}`)))
    .toEqual([
      { isArrayFilter: false, name: 'f', args: [1, null, '3'] },
      { isArrayFilter: false, name: 'g', args: [] },
      { isArrayFilter: false, name: 'h', args: [false, true, '234'] },
    ])
})

describe('snippet define and expand', () => {
  test('snippet define', () => {
    const selector = `
      @snippet = {
        $foo = 'bar';
      };
    `
    const expectedResult: TemmeSelector[] = [{
      type: 'snippet-define',
      name: 'snippet',
      selectors: [{
        type: 'assignment',
        capture: { name: 'foo', filterList: [] },
        value: 'bar',
      }],
    }]
    expect(temmeParser.parse(selector)).toEqual(expectedResult)
  })

  test('snippet expand', () => {
    const selector = `@snippet;`
    const expectedResult: TemmeSelector[] = [{
      type: 'snippet-expand',
      name: 'snippet',
    }]
    expect(temmeParser.parse(selector)).toEqual(expectedResult)
  })
})
