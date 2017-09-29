import { default as temme, cheerio } from '..'

test('empty selector', () => {
  const html = `<p>A B C D</p>`
  expect(temme(html, '')).toBeNull()
  expect(temme(html, '   ')).toBeNull()
  expect(temme(html, '\t\t  \n\n')).toBeNull()
})

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
  expect(temme(cheerio.load(html), selector)).toEqual([
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

test('temme(html, selector) supports html as CheerioElement', () => {
  const html = `
  <ul>
    <li class="name">shinima</li>
    <li class="country">China</li>
    <li class="city">Hangzhou, Zhejiang</li>
    <li class="university">ZJU</li>
  </ul>`

  const selector = `.name{$}`
  const $ = cheerio.load(html)
  const cheerioElement = $('li').get(0)
  expect(temme(cheerioElement, selector)).toBe('shinima')
})

test('attr predicate and value capture in attribute', () => {
  const html = `
  <ul>
    <li class="name" data-full-name="Shi Feichao">shinima</li>
    <li class="country">China</li>
  </ul>`

  const selector = `
    [class=name data-full-name=$fullName],
    [class=country]{$country},
  `
  expect(temme(html, selector)).toEqual({
    fullName: 'Shi Feichao',
    country: 'China',
  })
})
