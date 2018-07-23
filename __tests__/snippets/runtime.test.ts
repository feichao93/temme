import temme from '../../src'

const html = `
  <div>
    <div class="hello">
      <p class="name">Alice</p>
      <p class="color">red</p>
    </div>
    <div class="world">
      <p class="name">Bob</p>
      <p class="color">blue</p>
    </div>
    <div class="world">
      <p class="name">Mary</p>
      <p class="color">pink</p>
    </div>
  </div>
`

test('basic snippets', () => {
  const selector = `
      @foo = {
        .name{$name};
        .color{$color};
      };

      .world@world {
        @foo;
      };`

  expect(temme(html, selector)).toEqual({
    world: [{ name: 'Bob', color: 'blue' }, { name: 'Mary', color: 'pink' }],
  })
})

test('recursive snippets', () => {
  const selector = `
      @foo = {
        .name{$name};
        .color{$color};
      };

      @bar = {
        $bar = 'bar';
        @foo;
      };

      .hello@hello {
        @bar;
      };

      .world@world {
        @bar;
      };`

  expect(temme(html, selector)).toEqual({
    hello: [{ bar: 'bar', name: 'Alice', color: 'red' }],
    world: [
      { bar: 'bar', name: 'Bob', color: 'blue' },
      { bar: 'bar', name: 'Mary', color: 'pink' },
    ],
  })
})
