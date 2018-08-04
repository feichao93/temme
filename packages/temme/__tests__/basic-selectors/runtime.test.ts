import temme, { cheerio } from '../../src'

test('empty selector', () => {
  const html = `<p>A B C D</p>`
  expect(temme(html, '')).toBeNull()
  expect(temme(html, '   ')).toBeNull()
  expect(temme(html, '\t\t  \n\n')).toBeNull()
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
    .name{$name};
    .country{$country};
    .city{$city};
    li[class=university]{$university};
  `
  expect(temme(html, selector)).toEqual({
    name: 'shinima',
    country: 'China',
    city: 'Hangzhou, Zhejiang',
    university: 'ZJU',
  })
})

test('temme(html, selector) supports CheerioElement as html', () => {
  const html = `<li class="name">shinima</li>`

  const selector = `.name{$}`
  const $ = cheerio.load(html)
  const cheerioElement = $('li').get(0)
  expect(temme(cheerioElement, selector)).toBe('shinima')
})

test('try to capture a non-existent attribute', () => {
  const html = '<div>TEXT</div>'
  expect(temme(html, 'div[non-exist=$age];')).toBeNull()
})

test('test pseudo-qualifier', () => {
  const html = `
  <html><body>
    <div>DIV1</div>
    <div>DIV2</div>
    <section>SECTION</section>
    <div>DIV3</div>
  </body></html>
  `
  expect(temme(html, 'body *:not(div){$}')).toBe('SECTION')
  expect(temme(html, 'body *:contains(IV3){$}')).toBe('DIV3')
  expect(temme(html, 'body *:icontains(Iv3){$}')).toBe('DIV3')
  expect(temme(html, ':root{ node($) }')[0].name).toBe('html')
  expect(temme(html, 'body *:first-child{$}')).toBe('DIV1')
  expect(temme(html, 'body *:nth-child(2){$}')).toBe('DIV2')
  expect(temme(html, 'body *:nth-of-type(3){$}')).toBe('DIV3')
  expect(temme(html, 'body *:nth-last-of-type(3){$}')).toBe('DIV1')
  expect(temme(html, 'body *:nth-last-child(2){$}')).toBe('SECTION')
  expect(temme(html, 'body *:last-child{$}')).toBe('DIV3')
  expect(temme(html, 'body *:last-of-type{$}')).toBe('SECTION')
  expect(temme(html, 'body *:only-of-type{$}')).toBe('SECTION')
  expect(temme(html, 'body *:matches(section){$}')).toBe('SECTION')
  // TODO :has
})

describe('using " ", "+", ">" and "~" as section combinator', () => {
  const html = `
    <p>text-0</p>
    <div>
      <article>
        <p>text-1</p>
      </article>
      <p>text-2</p>
      <div></div>
      <p>text-3</p>
    </div>
    <p>text-4</p>
    <p>text-5</p>
  `

  test('test " "', () => {
    expect(temme(html, 'div p@{ &{$} }')).toEqual(['text-1', 'text-2', 'text-3'])
  })

  test('test "+"', () => {
    expect(temme(html, 'div +p@{ &{$} }')).toEqual(['text-3', 'text-4'])
  })

  test('test ">"', () => {
    expect(temme(html, 'div >p@{ &{$} }')).toEqual(['text-2', 'text-3'])
  })

  test('test "~"', () => {
    expect(temme(html, 'div ~p@{ &{$} }')).toEqual(['text-3', 'text-4', 'text-5'])
  })
})
