import { temmeParser, TemmeSelector } from '../../src'

test('parse procedure', () => {
  const actual = temmeParser.parse(`div{ fn($c, 100) }`)

  const expected: TemmeSelector[] = [
    {
      type: 'normal-selector',
      sections: [{ combinator: ' ', element: 'div', qualifiers: [] }],
      procedure: {
        name: 'fn',
        args: [{ name: 'c', filterList: [], modifier: null }, 100],
      },
      arrayCapture: null,
      children: [],
    },
  ]

  expect(actual).toEqual(expected)
})
