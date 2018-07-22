import temme from '../../src'
import { ModifierFn } from '../../src/modifier'

test('modifier `candidate`', () => {
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

test('custom modifier `to`', () => {
  const html = `
      <ul>
        <li class="option-1"></li>
        <li class="option-2">option-2-value</li>
        <li class="option-3">option-3-value</li>
      </ul>`
  const selector = `
    .option-1{$value!to('value-1')};
    .option-2{$value!to('value-2')};
    .option-3{$value!to('value-3')};
    `

  const to: ModifierFn = (result, key, value, newKey) => result.set(newKey, value)

  expect(temme(html, selector, {}, { to })).toEqual({
    'value-1': '',
    'value-2': 'option-2-value',
    'value-3': 'option-3-value',
  })
})
