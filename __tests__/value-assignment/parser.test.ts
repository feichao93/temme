import { temmeParser, TemmeSelector } from '../../src'

test('value-assignment at top-level', () => {
  const expected: TemmeSelector[] = [
    {
      type: 'assignment',
      capture: { name: 'a', filterList: [], modifier: null },
      value: '123',
    },
  ]
  expect(temmeParser.parse(`$a="123";`)).toEqual(expected)
  expect(temmeParser.parse(`$a = '123';`)).toEqual(expected)
  expect(temmeParser.parse(`$a   \t\n= '123';`)).toEqual(expected)
})

test('value-assignment in children basic-selectors', () => {
  const selector = `
      div@list {
        $a = null;
      };
    `
  const expected: TemmeSelector[] = [
    {
      type: 'normal-selector',
      arrayCapture: { name: 'list', filterList: [], modifier: null },
      content: null,
      sections: [
        {
          combinator: ' ',
          element: 'div',
          qualifiers: [],
        },
      ],
      children: [
        {
          type: 'assignment',
          capture: { name: 'a', filterList: [], modifier: null },
          value: null,
        },
      ],
    },
  ]
  expect(temmeParser.parse(selector)).toEqual(expected)
})

test('value-assignment in content', () => {
  const selector = 'div{$foo = true}'
  const expected: TemmeSelector[] = [
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
      content: {
        type: 'assignment',
        capture: { name: 'foo', filterList: [], modifier: null },
        value: true,
      },
      children: [],
    },
  ]
  expect(temmeParser.parse(selector)).toEqual(expected)
})
