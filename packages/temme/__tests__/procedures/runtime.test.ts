import temme, { Capture, CaptureResult, defineProcedure } from '../../src'

const html = '<div>  test text</div>'

test('procedure find', () => {
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

test('procedure assign', () => {
  expect(temme(html, `div{ assign($foo, true) }`)).toEqual({ foo: true })
  expect(temme(html, `table{ assign($bar, true) }`)).toEqual(null)
})

test('defineProcedure xxx', () => {
  defineProcedure('test', (result: CaptureResult, node, lower: Capture, upper: Capture) => {
    result.add(lower, node.text().toLowerCase())
    result.add(upper, node.text().toUpperCase())
  })

  expect(temme(html, `div{ test($lower|trim, $upper|trim) }`)).toEqual({
    lower: 'test text',
    upper: 'TEST TEXT',
  })
})
