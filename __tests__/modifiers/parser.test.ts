import { ContentPartCapture, NormalSelector, temmeParser, TemmeSelector } from '../../src'

test('parse modifiers', () => {
  function extractModifier(selectors: TemmeSelector[]) {
    return ((selectors[0] as NormalSelector).content[0] as ContentPartCapture).capture.modifier
  }

  expect(extractModifier(temmeParser.parse('html{$foo}'))).toEqual(null)
  expect(extractModifier(temmeParser.parse('html{$foo!mod}'))).toEqual({ name: 'mod', args: [] })
  expect(extractModifier(temmeParser.parse('html{$foo|bar!mod}'))).toEqual({
    name: 'mod',
    args: [],
  })
  expect(extractModifier(temmeParser.parse('html{$foo!mod(1, "str")}'))).toEqual({
    name: 'mod',
    args: [1, 'str'],
  })
})
