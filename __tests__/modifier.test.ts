import temme, { CaptureResult } from '../src'

function modifierOr(result: CaptureResult, key: string, value: any) {
  const oldValue = result.get(key)
  if (!Boolean(oldValue)) {
    result.set(key, value)
  }
}

test('custom modifier `or`', () => {
  const html = `
      <ul>
        <li class="option-1"></li>
        <li class="option-2">option-2-value</li>
        <li class="option-3">option-3-value</li>
      </ul>`
  const selector = `
    .option-1{$value!or};
    .option-2{$value!or};
    .option-3{$value!or};
    `
  expect(temme(html, selector, {}, { or: modifierOr })).toEqual({
    value: 'option-2-value',
  })
})
