import temme from '../../src'

test('assignments at top level', () => {
  expect(temme('', "$str = '123';")).toEqual({
    str: '123',
  })
  expect(temme('', '$str = "double-quote";')).toEqual({
    str: 'double-quote',
  })
  expect(temme('', '$num = 1234;')).toEqual({
    num: 1234,
  })
  expect(temme('', '$nil = null;')).toEqual({
    nil: null,
  })
  expect(temme('', '$T = true; $F = false;')).toEqual({
    T: true,
    F: false,
  })
})

test('assignments in array capture', () => {
  const html = `
  <ul>
    <li>apple</li>
    <li>banana</li>
    <li>cherry</li>
  </ul>
  `
  const selector = `
    li@ {
      $foo = 'bar';
    }
  `
  expect(temme(html, selector)).toEqual([
    { foo: 'bar' },
    { foo: 'bar' },
    { foo: 'bar' },
  ])
})

test('assignments at top level and in content part', () => {
  const html = `
    <div>
      <ul>
        <li></li>
        <li></li>
      </ul>
    </div>
  `
  const selector = `
    $div = false;
    div { $div = true };

    $table = false;
    table { $table = true };
  `
  expect(temme(html, selector)).toEqual({
    div: true,
    table: false,
  })
})
