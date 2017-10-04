import temme, { errors } from '../src/index'
import * as path from 'path'
import * as fs from 'fs'

const html = fs.readFileSync(path.resolve(__dirname, './testHtml/question-page-of-stackoverflow.html'), 'utf8')

test('invalid filter name', () => {
  expect(() => temme(html, `
    #question-header .question-hyperlink[href=$url]{$title|foo}
  `)).toThrowError('foo is not a valid filter.')
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
  // language=TEXT
  const html = `
  <div class="content">
    <div class="article_head mingren">
      <h1>张茵-东莞玖龙纸业有限公司董事长介绍</h1>
      <div class="author">阅读：13015次</div>
    </div>
  </div>`

  expect(() => temme(html, `.content@|pack{
    .article_head h1{fooooo($name, '-', $_)},
  }`)).toThrowError('fooooo is not a valid content function.')

  expect(() => temme(html, `.leading-css-part{$value} .content{$foo}`))
    .toThrowError(errors.hasLeadingCapture())

  expect(() => temme(html, `.leading-css-part[foo=$bar] .content{$foo}`))
    .toThrowError(errors.hasLeadingCapture())
})
