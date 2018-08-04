import {
  Assignment,
  AttributeOperator,
  Combinator,
  DEFAULT_PROCEDURE_NAME,
  temmeParser,
  TemmeSelector,
  UNIVERSAL_SELECTOR,
} from '../../src'

test('parse empty selector', () => {
  expect(temmeParser.parse('')).toEqual([])
  expect(temmeParser.parse('   ')).toEqual([])
  expect(temmeParser.parse('\t\t  \n\n')).toEqual([])
  expect(temmeParser.parse('// only comments')).toEqual([])
  expect(temmeParser.parse('/* only comments */')).toEqual([])
})

describe('parse JavaScript literals', () => {
  function getExpected(value: any) {
    const assignment: Assignment = {
      type: 'assignment',
      capture: { name: 'value', filterList: [], modifier: null },
      value,
    }
    return [assignment]
  }

  test('strings', () => {
    expect(temmeParser.parse(`$value = 'single quote';`)).toEqual(getExpected('single quote'))
    expect(temmeParser.parse(`$value = "double quote";`)).toEqual(getExpected('double quote'))
  })

  test('numbers', () => {
    expect(temmeParser.parse(`$value = 1234;`)).toEqual(getExpected(1234))
    expect(temmeParser.parse(`$value = +123;`)).toEqual(getExpected(+123))
    expect(temmeParser.parse(`$value = 0;`)).toEqual(getExpected(0))
    expect(temmeParser.parse(`$value = -123;`)).toEqual(getExpected(-123))
    expect(temmeParser.parse(`$value = - 123;`)).toEqual(getExpected(-123))
    expect(temmeParser.parse(`$value = 0x1234;`)).toEqual(getExpected(0x1234))
    expect(temmeParser.parse(`$value = 0b1010;`)).toEqual(getExpected(0b1010))
    expect(temmeParser.parse(`$value = -0xabcd;`)).toEqual(getExpected(-0xabcd))
    expect(temmeParser.parse(`$value = +0b1010;`)).toEqual(getExpected(+0b1010))
    expect(temmeParser.parse(`$value = - 0b1111;`)).toEqual(getExpected(-0b1111))
  })

  test('boolean and null', () => {
    expect(temmeParser.parse(`$value = true;`)).toEqual(getExpected(true))
    expect(temmeParser.parse(`$value = false;`)).toEqual(getExpected(false))
    expect(temmeParser.parse(`$value = null;`)).toEqual(getExpected(null))
  })

  test('regular expressions', () => {
    expect(temmeParser.parse(`$value = /simple/;`)).toEqual(getExpected(/simple/))
    expect(temmeParser.parse(`$value = /com[plex]*\\.{3,5}/;`)).toEqual(
      getExpected(/com[plex]*\.{3,5}/),
    )
    expect(temmeParser.parse(`$value = /co[ple-x2-9-]?.2+x/gi;`)).toEqual(
      getExpected(/co[ple-x2-9-]?.2+x/gi),
    )
  })
})

test('parse simple selector: `div`', () => {
  const parseResult: TemmeSelector[] = temmeParser.parse('div;')
  const expectedResult: TemmeSelector[] = [
    {
      type: 'normal-selector',
      arrayCapture: null,
      sections: [
        {
          combinator: ' ',
          element: 'div',
          qualifiers: [],
        },
      ],
      procedure: null,
      children: [],
    },
  ]
  expect(parseResult).toEqual(expectedResult)
})

describe('parse capture', () => {
  test('attribute capture and procedure at top level', () => {
    const selector = `#question-header .question-hyperlink[href=$url]{$title}`
    const parseResult: TemmeSelector[] = temmeParser.parse(selector)

    const expectedResult: TemmeSelector[] = [
      {
        type: 'normal-selector',
        arrayCapture: null,
        sections: [
          {
            combinator: ' ',
            element: UNIVERSAL_SELECTOR,
            qualifiers: [
              {
                type: 'id-qualifier',
                id: 'question-header',
              },
            ],
          },
          {
            combinator: ' ',
            element: UNIVERSAL_SELECTOR,
            qualifiers: [
              {
                type: 'class-qualifier',
                className: 'question-hyperlink',
              },
              {
                type: 'attribute-qualifier',
                attribute: 'href',
                operator: '=',
                value: { name: 'url', filterList: [], modifier: null },
              },
            ],
          },
        ],
        procedure: {
          name: DEFAULT_PROCEDURE_NAME,
          args: [{ name: 'title', filterList: [], modifier: null }],
        },
        children: [],
      },
    ]

    expect(parseResult).toEqual(expectedResult)
  })

  test('array capture and procedure in children basic-selectors', () => {
    const selector = `
      div@list {
        .foo{$h|html};
      };
    `
    const parseResult = temmeParser.parse(selector)

    const expectedResult: TemmeSelector[] = [
      {
        type: 'normal-selector',
        arrayCapture: { name: 'list', filterList: [], modifier: null },
        sections: [{ combinator: ' ', element: 'div', qualifiers: [] }],
        procedure: null,
        children: [
          {
            type: 'normal-selector',
            arrayCapture: null,
            sections: [
              {
                combinator: ' ',
                element: UNIVERSAL_SELECTOR,
                qualifiers: [{ type: 'class-qualifier', className: 'foo' }],
              },
            ],
            procedure: {
              name: DEFAULT_PROCEDURE_NAME,
              args: [
                {
                  name: 'h',
                  filterList: [{ isArrayFilter: false, name: 'html', args: [] }],
                  modifier: null,
                },
              ],
            },
            children: [],
          },
        ],
      },
    ]

    expect(parseResult).toEqual(expectedResult)
  })

  test('multiple attribute capture in one pair of brackets', () => {
    const selector = 'div[foo=$x bar=$y];'
    const parseResult = temmeParser.parse(selector)
    const expectedResult: TemmeSelector[] = [
      {
        type: 'normal-selector',
        sections: [
          {
            combinator: ' ',
            element: 'div',
            qualifiers: [
              {
                type: 'attribute-qualifier',
                attribute: 'foo',
                operator: '=',
                value: { name: 'x', filterList: [], modifier: null },
              },
              {
                type: 'attribute-qualifier',
                attribute: 'bar',
                operator: '=',
                value: { name: 'y', filterList: [], modifier: null },
              },
            ],
          },
        ],
        procedure: null,
        arrayCapture: null,
        children: [],
      },
    ]
    expect(parseResult).toEqual(expectedResult)
  })

  test('other different attribute operators', () => {
    const operators: AttributeOperator[] = ['=', '~=', '|=', '*=', '^=', '$=']
    for (const operator of operators) {
      const selector = `div[foo${operator}$x];`
      const parseResult = temmeParser.parse(selector)
      const expectedResult: TemmeSelector[] = [
        {
          type: 'normal-selector',
          sections: [
            {
              combinator: ' ',
              element: 'div',
              qualifiers: [
                {
                  type: 'attribute-qualifier',
                  attribute: 'foo',
                  operator,
                  value: { name: 'x', filterList: [], modifier: null },
                },
              ],
            },
          ],
          procedure: null,
          arrayCapture: null,
          children: [],
        },
      ]
      expect(parseResult).toEqual(expectedResult)
    }
  })
})

test('using string literal in attribute qualifiers', () => {
  const parseResult = temmeParser.parse(`[foo="a b c"];`)
  const expectedResult: TemmeSelector[] = [
    {
      type: 'normal-selector',
      sections: [
        {
          combinator: ' ',
          element: UNIVERSAL_SELECTOR,
          qualifiers: [
            {
              type: 'attribute-qualifier',
              attribute: 'foo',
              operator: '=',
              value: 'a b c',
            },
          ],
        },
      ],
      procedure: null,
      arrayCapture: null,
      children: [],
    },
  ]
  expect(parseResult).toEqual(expectedResult)

  expect(temmeParser.parse(`[foo='a b c'];`)).toEqual(expectedResult)
})

describe('test different section combinator', () => {
  function getExpectedResult(combinator: Combinator): TemmeSelector[] {
    return [
      {
        type: 'normal-selector',
        sections: [
          {
            combinator: ' ',
            element: 'div',
            qualifiers: [],
          },
          {
            combinator,
            element: 'div',
            qualifiers: [],
          },
        ],
        procedure: null,
        arrayCapture: null,
        children: [],
      },
    ]
  }

  for (const combinator of [' ', '>', '+', '~'] as Combinator[]) {
    test(`test ${JSON.stringify(combinator)}`, () => {
      const parseResult = temmeParser.parse(`div ${combinator} div;`)
      expect(parseResult).toEqual(getExpectedResult(combinator))
    })
  }
})

test('test JavaScript comments', () => {
  expect(temmeParser.parse('/* abcdef */')).toEqual([])
  expect(temmeParser.parse('// abcdef')).toEqual([])

  const s1 = `
    // single line comment
    /* multi
      line commnet */
      /* pre*/div{$} // after
  `
  const s2 = 'div{$}'
  expect(temmeParser.parse(s1)).toEqual(temmeParser.parse(s2))

  const s3 = `
    /*111*/div[/*222*/foo=$bar/*333*/]{ //444
    html($foo)}
  `
  const s4 = 'div[foo=$bar]{html($foo)}'
  expect(temmeParser.parse(s3)).toEqual(temmeParser.parse(s4))
})
