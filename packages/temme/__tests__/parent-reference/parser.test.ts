import { DEFAULT_CAPTURE_KEY, DEFAULT_PROCEDURE_NAME, temmeParser, TemmeSelector } from '../../src'

test('test parent-reference', () => {
  const expected: TemmeSelector[] = [
    {
      type: 'normal-selector',
      arrayCapture: { filterList: [], name: DEFAULT_CAPTURE_KEY, modifier: null },
      sections: [{ combinator: ' ', element: 'div', qualifiers: [] }],
      children: [
        {
          type: 'parent-ref-selector',
          section: { combinator: ' ', element: '*', qualifiers: [] },
          procedure: {
            name: DEFAULT_PROCEDURE_NAME,
            args: [{ filterList: [], name: 'value', modifier: null }],
          },
        },
      ],
      procedure: null,
    },
  ]

  expect(temmeParser.parse(`div@ { &{$value} };`)).toEqual(expected)
})
