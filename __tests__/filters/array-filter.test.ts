import temme from '../../src'

test('use trim as array-filter', () => {
  const html = `
    <div>
      <p> text-1   </p>
      <p>    text-2</p>
      <p>text-3    </p>
    </div>
  `
  const selector = 'p@||trim{&{$}}'
  expect(temme(html, selector)).toEqual(['text-1', 'text-2', 'text-3'])
})

test('use Number as array-filter', () => {
  const html = '<p>1 22 333 4444</p>'
  const selector = `p{$|split(' ')||Number}`
  expect(temme(html, selector)).toEqual([1, 22, 333, 4444])
})
