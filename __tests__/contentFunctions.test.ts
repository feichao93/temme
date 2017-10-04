import temme from '../src/temme'

test('contentFunction match', () => {
  const html = '<div>  test text </div>'

  expect(temme(html, `div{match($)}`)).toEqual('test text')
  expect(temme(html, `div{match('not-exist', $)}`)).toEqual(null)
  expect(temme(html, `div{match($, 'not-exist')}`)).toEqual(null)
  expect(temme(html, `div{match('test', $, 'x', 't')}`)).toEqual(' te')
  // the last letter `t` has no match
  expect(temme(html, `div{match('test', $, 'ex')}`)).toEqual(null)
  expect(temme(html, `div{match('test', 'text')}`)).toEqual(null)
  expect(temme(html, `div{match('te', $a, 'te', $b)}`)).toEqual({
    a: 'st ',
    b: 'xt',
  })
})
