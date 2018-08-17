import temme, { defineModifier, ModifierFn } from '../../src'

const html1 = `
<ul>
  <li class="option-1"></li>
  <li class="option-2">option-2-value</li>
  <li class="option-3">option-3-value</li>
</ul>`

test('modifier `candidate`', () => {
  const selector = `
    .option-1{$value!candidate};
    .option-2{$value!candidate};
    .option-3{$value!candidate};
    `
  expect(temme(html1, selector)).toEqual({
    value: 'option-2-value',
  })
})

test('modifier `array`', () => {
  const selector = `
    .option-1{$value!array};
    .option-2{$value!array};
    .option-3{$value!array};
    `
  expect(temme(html1, selector)).toEqual({
    value: ['', 'option-2-value', 'option-3-value'],
  })
})

test('modifier `spread`', () => {
  const html = `
    <img class="avatar" src="img-link" alt="avatar">
    <div class="person-info">
      <p class="name">some-name</p>  
      <p class="age">30</p>
    </div>`

  const selector1 = `
  .avatar[src=$imgLink];
  .person-info@|pack!spread {
    .name{ $name };
    .age{ $age|Number };
  }`
  expect(temme(html, selector1)).toEqual({
    imgLink: 'img-link',
    name: 'some-name',
    age: 30,
  })

  const selector2 = `
  .avatar[src=$imgLink];
  .person-info@person|pack!spread {
    .name{ $Name };
    .age{ $Age|Number };
  }`
  expect(temme(html, selector2)).toEqual({
    imgLink: 'img-link',
    personName: 'some-name',
    personAge: 30,
  })

  const selector3 = `.name { $name|toNull!spread }`
  const filters = {
    toNull() {
      return null
    },
  }
  expect(temme(html, selector3, filters)).toEqual(null)
})

test('defineModifier `reverse`', () => {
  const reverseString = (str: string) =>
    str
      .split('')
      .reverse()
      .join('')
  defineModifier('reverse', (result, key, value) => {
    result.set(reverseString(key), value)
  })

  const selector = ` .option-2{$value!reverse}; `
  expect(temme(html1, selector)).toEqual({ eulav: 'option-2-value' })
})

test('custom modifier `to`', () => {
  const selector = `
    .option-1{$value!to('value-1')};
    .option-2{$value!to('value-2')};
    .option-3{$value!to('value-3')};
    `
  const to: ModifierFn = (result, key, value, newKey) => result.set(newKey, value)

  expect(temme(html1, selector, {}, { to })).toEqual({
    'value-1': '',
    'value-2': 'option-2-value',
    'value-3': 'option-3-value',
  })
})
