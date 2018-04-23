import * as path from 'path'
import * as fs from 'fs'
import temme, { msg, contentFunctions } from '../src'

const html = fs.readFileSync(
  path.resolve(__dirname, './testHtml/question-page-of-stackoverflow.html'),
  'utf8',
)

test('invalid filter name', () => {
  expect(() =>
    temme(html, `#question-header .question-hyperlink[href=$url]{$title|foo}`),
  ).toThrowError(msg.invalidFilter('foo'))
})

test('define filter in children selector', () => {
  expect(() =>
    temme('<div>test-html</div>', `div@ { filter myFilter() { return this } }`),
  ).toThrowError(msg.filterDefineNotAtTopLevel('myFilter'))
})

test('define the same filter twice', () => {
  expect(() =>
    temme(
      '<div>test-html</div>',
      `filter myFilter() { return this }
      filter myFilter() { return this }`,
    ),
  ).toThrowError(msg.filterAlreadyDefined('myFilter'))
})

test('parent-ref-selector at top', () => {
  expect(() => temme(html, `&[attr=$value];`)).toThrowError(msg.parentRefSelectorAtTopLevel())
})

test('wrong syntax example 1', () => {
  expect(() => temme(html, `#question-header .question-hyperlink @`)).toThrowError()
})

test('wrong syntax example 2', () => {
  expect(() =>
    temme(
      html,
      `.answer@ (
        .votecell .vote-count-post{$upvote},
        .post-test{$postText},
        .user-info .user-details>a{$userName},
        .comment@comments [error here] (
          .comment-score{$score},
          .comment-copy{$content|substring10},
          .comment-user[href=$userUrl]{$userName},
          .comment-data span[title=$data],
        ),
      )`,
    ),
  ).toThrowError()
})

test('some tests', () => {
  expect(() =>
    temme(
      html,
      `div@|pack{
        p{foo($name, '-', $_)};
      }`,
    ),
  ).toThrowError(msg.invalidContentFunction('foo'))

  expect(() => {
    contentFunctions.remove('match')
    console.log(temme(html, 'div{ match($foo) }'))
  }).toThrowError(msg.invalidContentFunction('match'))

  expect(() => temme(html, `.leading-css-part[foo=$bar] .content{$foo}`)).toThrowError(
    msg.hasLeadingAttributeCapture(),
  )

  expect(() => temme(html, `div[class^=$value];`)).toThrowError(msg.valueCaptureWithOtherOperator())

  expect(() => temme('<li class="abc"></li>', `li[class=$||trim];`)).toThrowError(
    msg.arrayFilterAppliedToNonArrayValue('trim'),
  )
})

test('define snippet in children selector', () => {
  const html = `<div>test html</div>`
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
  const html = `<div>test html</div>`
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
