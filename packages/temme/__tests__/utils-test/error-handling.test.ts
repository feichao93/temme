import temme, { msg } from '../../src'

const html = `<div class="foo">test html</div>`

test('invalid filter name', () => {
  expect(() => temme(html, `div{$text|foo}`)).toThrowError(msg.invalidFilter('foo'))
})

test('define filter in children selector', () => {
  expect(() => temme(html, `div@ { filter myFilter() { return this } }`)).toThrowError(
    msg.filterDefineNotAtTopLevel('myFilter'),
  )
})

test('define the same filter twice', () => {
  expect(() =>
    temme(
      html,
      `filter myFilter() { return this }
      filter myFilter() { return this }`,
    ),
  ).toThrowError(msg.filterAlreadyDefined('myFilter'))
})

test('parent-ref-selector at top', () => {
  expect(() => temme(html, `&[attr=$value];`)).toThrowError(msg.parentRefSelectorAtTopLevel())
})

test('other error handling', () => {
  expect(() => {
    console.log(temme(html, 'div{ foo($bar) }'))
  }).toThrowError(msg.invalidContentFunction('foo'))

  expect(() => temme(html, `.leading-css-part[foo=$bar] .content{$foo}`)).toThrowError(
    msg.hasLeadingAttributeCapture(),
  )

  expect(() => temme(html, `div[class^=$value];`)).toThrowError(msg.valueCaptureWithOtherOperator())

  expect(() => temme('<li class="abc"></li>', `li[class=$||trim];`)).toThrowError(
    msg.arrayFilterAppliedToNonArrayValue('trim'),
  )
})

test('define snippet in children selector', () => {
  const selector = `
div@ {
  @xxx = {
    $foo = 'bar';
  };
}`
  expect(() => temme(html, selector)).toThrowError(msg.snippetDefineNotAtTopLevel('xxx'))
})

test('use an undefined snippet', () => {
  expect(() => temme('<div>test-html</div>', `div@ { @mySnippet; }`)).toThrowError(
    msg.snippetNotDefined('mySnippet'),
  )
})

test('snippet is already defined', () => {
  const selector = `
@foo = { div{$text}; };
@foo = { li@list { &{$text} } };
`
  expect(() => temme(html, selector)).toThrowError(msg.snippetAlreadyDefined('foo'))
})

test('circular snippet expansion detection', () => {
  const html = '<div>test html</div>'
  const selector = `
    @foo = {
      @bar;
      $inFoo = true;
    };
    @bar = {
      @buzz;
      $inBar = true;
    };
    @buzz = {
      @foo;
      $inBuzz = true;
    };
    @foo;
  `
  expect(() => temme(html, selector)).toThrowError(
    msg.circularSnippetExpansion(['foo', 'bar', 'buzz', 'foo']),
  )
})

test('circular snippet expansion detection', () => {
  const html = '<div>test html</div>'
  const selector = `
    @foo = {
      @bar;
      $inFoo = true;
    };
    @bar = {
      @buzz;
      $inBar = true;
    };
    @buzz = {
      $inBuzz = true;
      div.awesome@|pack {
        // Place @foo in children selectors
        // @foo is expanded only when elements that satisfy 'div.awesome' exist
        @foo;
      };
    };
    @foo;
  `
  expect(() => temme(html, selector)).not.toThrow()
})
