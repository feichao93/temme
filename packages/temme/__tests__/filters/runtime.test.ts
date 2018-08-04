import temme, { cheerio, defineFilter } from '../../src'

test('prototype filter: String#split', () => {
  const html = `<p>A B C D</p>`
  const selector = `p{$|split(' ')}`
  expect(temme(html, selector)).toEqual(['A', 'B', 'C', 'D'])
})

test('prototype filter: Array#slice', () => {
  const html = `
  <ul>
    <li>apple</li>
    <li>banana</li>
    <li>cherry</li>
    <li>pear</li>
  </ul>
  `
  const selector = 'li@|slice(1,3){ &{$} }'
  expect(temme(cheerio.load(html), selector)).toEqual(['banana', 'cherry'])
})

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
      &.name{$name};
      &.country{$country};
      &.city{$city};
      &.university{$university};
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
  const selector = `ul li@|compact{ &[data-color=$]; }`
  expect(temme(html, selector)).toEqual(['red', 'yellow', 'white'])
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
  expect(temme(html, selector)).toEqual(['0-0', '0-1', '1-0', '1-1'])
})

test('filter `first`, `last`, `get`', () => {
  expect(temme('<p>0 1 2 3 4</p>', `p{$|split(' ')|first}`)).toBe('0')
  expect(temme('<p>0 1 2 3 4</p>', `p{$|split(' ')|last}`)).toBe('4')
  expect(temme('<p>0 1 2 3 4</p>', `p{$|split(' ')|get(1)}`)).toBe('1')
  expect(temme('<p>0 1 2 3 4</p>', `p{$|split(' ')|get(2)}`)).toBe('2')
  expect(temme('<p>0 1 2 3 4</p>', `p{$|split(' ')|get(10)}`)).toBe(null)

  const html = '<p title="TITLE" style="STYLE">TEXT</p>'
  const makeSelector = (key: string) => `p@|pack|get('${key}'){&[title=$title style=$style]{$text}}`
  expect(temme(html, makeSelector('text'))).toBe('TEXT')
  expect(temme(html, makeSelector('title'))).toBe('TITLE')
  expect(temme(html, makeSelector('style'))).toBe('STYLE')
})

test('filter `Number`, `String`, `Boolean`, `Date`', () => {
  expect(temme(`<p>1234</p>`, 'p{$|Number}')).toBe(1234)
  expect(temme(`<p>x1234</p>`, 'p{$|Number}')).toBeNaN()

  expect(temme(`<p>1234</p>`, 'p{$|Number|String}')).toBe('1234')

  expect(temme(`<p>1234</p>`, 'p{$|Boolean}')).toBe(true)
  expect(temme(`<p></p>`, 'p{$|Boolean}')).toBe(false)

  expect(temme(`<p title="2017-09-28T16:00Z"></p>`, 'p[title=$|Date];').valueOf()).toBe(
    1506614400000,
  )
  expect(temme(`<p title="abc"></p>`, 'p[title=$|Date|String];')).toBe('Invalid Date')
})

test('special filters', () => {
  const html = `<ul> <li>apple</li> <li>banana</li> <li>cherry</li> </ul>`
  const expected = {
    innerHTML: ` <li>apple</li> <li>banana</li> <li>cherry</li> `,
    text: ' apple banana cherry ',
  }

  expect(temme(html, `ul{ $ }`)).toEqual(expected.text)
  expect(temme(html, `ul{ text($) }`)).toEqual(expected.text)
  expect(temme(html, `ul{ html($) }`)).toEqual(expected.innerHTML)

  const node: Cheerio = temme(html, `ul{ node($) }`)
  expect(node.html()).toEqual(expected.innerHTML)
  expect(node.text()).toEqual(expected.text)
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
    '<fruit>watermelon</fruit>',
  ])
})

test('inline filter `wrap2`', () => {
  const html = `
    <ul>
      <li>apple</li>
      <li>banana</li>
      <li>cherry</li>
      <li>pear</li>
      <li>watermelon</li>
    </ul>`
  const selector = `
    filter wrap2(tag) {
      return '<' + tag + '>' + this + '</' + tag + '>'
    }
    li@{&{$|wrap2('fruit')}};
  `
  expect(temme(html, selector)).toEqual([
    '<fruit>apple</fruit>',
    '<fruit>banana</fruit>',
    '<fruit>cherry</fruit>',
    '<fruit>pear</fruit>',
    '<fruit>watermelon</fruit>',
  ])
})

test('inline filter `append`', () => {
  const html = `
  <ul>
    <li>apple</li>
    <li>banana</li>
  </ul>`
  const selector = `
  filter append(...items) {
    return this.concat(items)
  }
  li@|append('pear', 'watermelon'){ &{$} };
  `
  expect(temme(html, selector)).toEqual(['apple', 'banana', 'pear', 'watermelon'])
})

test('filter with default parameters', () => {
  const html = '<div>1</div>'
  const selector = `
  filter add(n = 0) {
    return this + n
  };
  div{ $x|add };
  div{ $z|Number|add(-1) };
  div{ $y|Number|add(2) };
  `
  expect(temme(html, selector)).toEqual({
    x: '10',
    y: 3,
    z: 0,
  })
})

test('filter with spread operator', () => {
  const html = '<div>1</div>'
  const selector = `
  filter addAll(...nums) {
    return this + nums.reduce((a, b) => a + b, 0)
  };
  div{ $x|Number|addAll };
  div{ $y|Number|addAll(1,2,3) };
  `
  expect(temme(html, selector)).toEqual({
    x: 1,
    y: 7,
  })
})

test('use require in custom filter', () => {
  const html = '<div>1</div>'
  const selector = `
  filter foo() {
    return require('url').URL
  };
  div{$|foo};
  `
  expect(temme(html, selector)).toBe(require('url').URL)
})
