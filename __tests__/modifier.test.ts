import temme from '../src'

test('custom modifier `candidate`', () => {
  const html = `
      <ul>
        <li class="option-1"></li>
        <li class="option-2">option-2-value</li>
        <li class="option-3">option-3-value</li>
      </ul>`
  const selector = `
    .option-1{$value!candidate};
    .option-2{$value!candidate};
    .option-3{$value!candidate};
    `
  expect(temme(html, selector)).toEqual({
    value: 'option-2-value',
  })
})
