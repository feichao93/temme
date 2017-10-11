import * as path from 'path'
import * as fs from 'fs'
import temme, { msg } from '../src/index'
import { contentFunctions } from '../src/contentFunctions'

const html = fs.readFileSync(path.resolve(__dirname, './testHtml/question-page-of-stackoverflow.html'), 'utf8')

test('invalid filter name', () => {
  expect(() => temme(html, `
    #question-header .question-hyperlink[href=$url]{$title|foo}
  `)).toThrowError(msg.invalidFilter('foo'))
})

test('self-selector at top', () => {
  expect(() => temme(html, `&[attr=$value]`))
    .toThrowError(msg.selfSelectorAtTopLevel())
})

test('wrong syntax example 1', () => {
  expect(() => temme(html, `
    #question-header .question-hyperlink @
  `)).toThrowError()
})

test('wrong syntax example 2', () => {
  expect(() => temme(html, `.answer@ (
    .votecell .vote-count-post{$upvote},
    .post-test{$postText},
    .user-info .user-details>a{$userName},
    .comment@comments [error here] (
      .comment-score{$score},
      .comment-copy{$content|substring10},
      .comment-user[href=$userUrl]{$userName},
      .comment-data span[title=$data],
    ),
  )
  `)).toThrowError()
})

test('error in content part', () => {
  expect(() => temme(html, `div@|pack{
    p{foo($name, '-', $_)},
  }`)).toThrowError(msg.invalidContentFunction('foo'))

  expect(() => {
    contentFunctions.remove('match')
    temme(html, 'div{ match($foo) }')
  }).toThrowError(msg.invalidContentFunction('match'))

  expect(() => temme(html, `.leading-css-part{$value} .content{$foo}`))
    .toThrowError(msg.hasLeadingCapture())

  expect(() => temme(html, `.leading-css-part[foo=$bar] .content{$foo}`))
    .toThrowError(msg.hasLeadingCapture())
})

test('error in snippets', () => {
  const html = `<div>test html</div>`
  const selector = `
div@ {
  @xxx = {
    $foo = 'bar';
  };
}`
  expect(() => temme(html, selector))
    .toThrowError(msg.snippetDefineNotAtTopLevel('xxx'))
})