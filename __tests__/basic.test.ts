import temme from '..'

test('use String#split as filter in value-capture', () => {
  const html = `<p>A B C D</p>`
  const selector = `p{$|split(' ')}`
  expect(temme(html, selector)).toEqual(['A', 'B', 'C', 'D'])
})

test('use Array#slice as filter in array-capture', () => {
  const html = `
  <ul>
    <li>apple</li>
    <li>banana</li>
    <li>cherry</li>
    <li>pear</li>
    <li>watermelon</li>
  </ul>
  `
  const selector = 'li@|slice(1,4) &{$}'
  expect(temme(html, selector)).toEqual([
    'banana',
    'cherry',
    'pear',
  ])
})

test('multiple selectors at root level', () => {
  const html = `
  <ul>
    <li class="name">shinima</li>
    <li class="country">China</li>
    <li class="city">Hangzhou, Zhejiang</li>
    <li class="university">ZJU</li>
  </ul>`

  const selector = `
    .name{$name},
    .country{$country},
    .city{$city},
    .university{$university},
  `
  expect(temme(html, selector)).toEqual({
    name: 'shinima',
    country: 'China',
    city: 'Hangzhou, Zhejiang',
    university: 'ZJU',
  })
})
