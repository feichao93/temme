import { temmeParser, TemmeSelector } from '../../src'

test('snippet define', () => {
  const selector = `
      @snippet = {
        $foo = 'bar';
      };
    `
  const expectedResult: TemmeSelector[] = [
    {
      type: 'snippet-define',
      name: 'snippet',
      selectors: [
        {
          type: 'assignment',
          capture: { name: 'foo', filterList: [], modifier: null },
          value: 'bar',
        },
      ],
    },
  ]
  expect(temmeParser.parse(selector)).toEqual(expectedResult)
})

test('snippet expand', () => {
  const selector = `@snippet;`
  const expectedResult: TemmeSelector[] = [
    {
      type: 'snippet-expand',
      name: 'snippet',
    },
  ]
  expect(temmeParser.parse(selector)).toEqual(expectedResult)
})
