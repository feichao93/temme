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
    <li>pear</li>
    <li>watermelon</li>
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
    { foo: 'bar' },
    { foo: 'bar' },
  ])
})

// test('assignments at top level and in content part', () => {
//   const html = `
//     <div>
//       <ul>
//         <li></li>
//         <li></li>
//       </ul>
//     </div>
//   `
//   const selector = `
//     $div = false;
//     $ul = false;
//     $li = false;
//     $table = false;
//     $a = false;
//     div { $div = true };
//     ul { $ul = true };
//     li { $li = true };
//     table { $table = true };
//     a { $a = true };
//   `
//   expect(temme(html, selector)).toEqual({
//     div: true,
//     ul: true,
//     li: true,
//     table: false,
//     a: false,
//   })
// })
