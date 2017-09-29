export const examples = [
  {
    name: 'example-1',
    desc: '抓取问题和链接',
    selector: '#question-header .question-hyperlink[href=$href]{$title}',
  },
  {
    name: 'linked-questions',
    desc: '',
    selector: `
.linked .spacer@linkedQuestions|compact (
  .question-hyperlink[href=$url]{$question|words|join(' ')},
  .answer-votes{$votes|Number},
)`
  },
  {
    name: 'douban-short-reviews',
    desc: '',
    selector: `// 豆瓣短评网页数据抓取
// https://movie.douban.com/subject/1292052/comments?start=42&limit=20&sort=new_score&status=P
title{text($movieName, ' 短评')},
.aside>p>a[href=$movieUrl],
.movie-summary .attrs p@movieDetail|pack (
  &{text('导演:', $director)},
  &{text('主演:', $actors|split('/'))},
  &{text('类型:', $movieType|split(','))},
  &{text('片长:', $duration)},
  &{text('上映:', $releaseTime|split(','))},
),
a.trail_link[href=$trailLink],
#paginator a@links (
  &[href=$href data-page=$page]{$content},
),
.comment-item@comments (
  &[data-cid=$commentId],
  .comment-time{$time},
  .rating[title=$rating],
  .comment-info>a[href=$userLink]{$userName},
  .votes{$votes|Number},
  .comment > p{$commentText},
),`,
  },
  {
    name: 'all-answers-and-comments',
    desc: '抓取所有答案和评论以及相关用户的信息',
    selector: `
.answer@answers (
  .fw .user-info@users (
    .user-action-time{$userAction|words|join(' ')},
    .relativetime[title=$time],
    .user-details@userDetail|pack (
      a[href=$userlink]{$username|words|join(' ')},
      .reputation-score{$reputation},
      span@badges|compact (
        .badge1[class=$badgeType],
        .badge2[class=$badgeType],
        .badge3[class=$badgeType],
        .badgecount{$count|Number},
      ),
    ),
  ),
  .post-text{$answerText|words|join(' ')},
  .comments .comment@comments (
    &[id=$commentId],
    .comment-score{$commentScore|Number},
    .comment-text .comment-copy{$text},
    .comment-user{$commentUser|words|join(' ')},
    .comment-date span[title=$date],
  ),
)`,
  },
]

export default async function loadExamples(exampleName, htmlEditor, selectorEditor) {
  selectorEditor.setValue('')
  htmlEditor.setValue('')
  const example = examples.find(example => example.name === exampleName)
  if (!example) {
    alert('Invalid example name')
  }
  const response = await fetch('./example.html')
  if (response.ok) {
    const html = await response.text()
    htmlEditor.setValue(html)
    selectorEditor.setValue(example.selector.trim())
  } else {
    console.warn('load example.html failed...')
  }
}
