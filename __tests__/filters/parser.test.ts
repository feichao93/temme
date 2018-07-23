import { ContentCapture, NormalSelector, temmeParser, TemmeSelector } from '../../src'

function extractFilterList(selectors: TemmeSelector[]) {
  return ((selectors[0] as NormalSelector).content as ContentCapture).capture.filterList
}

test('parse filters', () => {
  expect(extractFilterList(temmeParser.parse('html{$h|f}'))).toEqual([
    { isArrayFilter: false, name: 'f', args: [] },
  ])

  expect(
    extractFilterList(temmeParser.parse(`html{$h|f(1,null,'3')|g()|h(false,true,'234')}`)),
  ).toEqual([
    { isArrayFilter: false, name: 'f', args: [1, null, '3'] },
    { isArrayFilter: false, name: 'g', args: [] },
    { isArrayFilter: false, name: 'h', args: [false, true, '234'] },
  ])
})
