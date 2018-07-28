import temme from '../../src'

test('procedure find', () => {
  const html = '<div>  test text</div>'

  expect(temme(html, `div{find('not-exist', $)}`)).toEqual(null)
  expect(temme(html, `div{find($, 'not-exist')}`)).toEqual(null)
  expect(temme(html, `div{find('not-exist', $, 'text')}`)).toEqual(null)
  expect(temme(html, `div{find('test', $, 'not-exist')}`)).toEqual(null)
  expect(temme(html, `div{find('test', $|trim)}`)).toEqual('text')
  expect(temme(html, `div{find($|trim, 'text')}`)).toEqual('test')
  expect(temme(html, `div{find('te', $, 'xt')}`)).toEqual('st te')

  expect(() => temme(html, `div{find()}`)).toThrow()
  expect(() => temme(html, `div{find($a)}`)).toThrow()
  expect(() => temme(html, `div{find($a,$b)}`)).toThrow()
  expect(() => temme(html, `div{find('abc', 'def')}`)).toThrow()
  expect(() => temme(html, `div{find('abc', 'def')}`)).toThrow()
})
