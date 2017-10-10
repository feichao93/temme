import { default as temme, defineFilter } from '../src/index'

test('filter `pack`', () => {
  const html = `
      <ul>
        <li class="name">shinima</li>
        <li class="country">China</li>
        <li class="city">Hangzhou, Zhejiang</li>
        <li class="university">ZJU</li>
        <li class="hobbies"></li>
      </ul>`
  const selector = `
    ul li@|pack{
      &.name{$name},
      &.country{$country},
      &.city{$city},
      &.university{$university},
    }`
  expect(temme(html, selector)).toEqual({
    name: 'shinima',
    country: 'China',
    city: 'Hangzhou, Zhejiang',
    university: 'ZJU',
  })
})

test('filter `compact`', () => {
  const html = `
    <ul>
      <li data-color="red">apple</li>
      <li data-color="yellow">banana</li>
      <li data-color="">cherry</li>
      <li data-color="white">pear</li>
      <li data-color="">watermelon</li>
    </ul>`
  const selector = `ul li@|compact{ &[data-color=$] }`
  expect(temme(html, selector)).toEqual([
    'red', 'yellow', 'white'
  ])
})

test('filter `flatten`', () => {
  const html = `
    <table>
      <tr>
        <td>0-0</td>
        <td>0-1</td>
      </tr>
      <tr>
        <td>1-0</td>
        <td>1-1</td>
      </tr>
    </table>
    `
  const selector = `tr@|flatten{ td@{ &{$} } }`
  expect(temme(html, selector)).toEqual([
    '0-0', '0-1', '1-0', '1-1',
  ])
})

test('filter `first`, `last`, `nth`', () => {
  expect(temme('<p>0 1 2 3 4</p>', `p{$|split(' ')|first}`)).toBe('0')
  expect(temme('<p>0 1 2 3 4</p>', `p{$|split(' ')|last}`)).toBe('4')
  expect(temme('<p>0 1 2 3 4</p>', `p{$|split(' ')|nth(1)}`)).toBe('1')
  expect(temme('<p>0 1 2 3 4</p>', `p{$|split(' ')|nth(2)}`)).toBe('2')
  expect(temme('<p>0 1 2 3 4</p>', `p{$|split(' ')|nth(3)}`)).toBe('3')
  expect(temme('<p>0 1 2 3 4</p>', `p{$|split(' ')|nth(10)}`)).toBe(null)
})

test('filter `Number`, `String`, `Boolean`, `Date`', () => {
  expect(temme(`<p>1234</p>`, 'p{$|Number}')).toBe(1234)
  expect(temme(`<p>x1234</p>`, 'p{$|Number}')).toBeNaN()

  expect(temme(`<p>1234</p>`, 'p{$|Number|String}')).toBe('1234')

  expect(temme(`<p>1234</p>`, 'p{$|Boolean}')).toBe(true)
  expect(temme(`<p></p>`, 'p{$|Boolean}')).toBe(false)

  expect(temme(`<p title="2017-09-28T16:00Z"></p>`, 'p[title=$|Date]').valueOf()).toBe(1506614400000)
  expect(temme(`<p title="abc"></p>`, 'p[title=$|Date|String]')).toBe('Invalid Date')
})

test('customized filter `wrap`', () => {
  defineFilter('wrap', function wrap(this: string, tag: string) {
    return `<${tag}>${this}</${tag}>`
  })

  const html = `
    <ul>
      <li>apple</li>
      <li>banana</li>
      <li>cherry</li>
      <li>pear</li>
      <li>watermelon</li>
    </ul>`
  const selector = `li@{&{$|wrap('fruit')}}`
  expect(temme(html, selector)).toEqual([
    '<fruit>apple</fruit>',
    '<fruit>banana</fruit>',
    '<fruit>cherry</fruit>',
    '<fruit>pear</fruit>',
    '<fruit>watermelon</fruit>'
  ])
})
