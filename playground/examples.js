export const examples = [
  {
    name: 'example-so-1',
    htmlUrl: 'resources/stackoverflow-question.html',
    selector: `
// https://stackoverflow.com/questions/291978/short-description-of-the-scoping-rules
// capture title and link of a stackoverflow question
#question-header .question-hyperlink[href=$href]{$title}`,
  },
  {
    name: 'example-so-2',
    htmlUrl: 'resources/stackoverflow-question.html',
    selector: `
// https://stackoverflow.com/questions/291978/short-description-of-the-scoping-rules
// capture linked questions of a stackoverflow question
.linked .spacer@|compact {
  .question-hyperlink[href=$url]{$question|words|join(' ')},
  .answer-votes{$votes|Number},
}`
  },
  {
    name: 'example-so-3',
    htmlUrl: 'resources/stackoverflow-question.html',
    selector: `
// https://stackoverflow.com/questions/291978/short-description-of-the-scoping-rules
// capture all answers and all comments
.answer@ {
  .fw .user-info@users {
    .user-details@userDetail|pack {
      a[href=$userlink]{$username|words|join(' ')};
      .reputation-score{$reputation};
    };
    .relativetime[title=$time];
    .user-action-time{$userAction|words|join(' ')};
  };
  .post-text{$answerText|words|join(' ')};
  .comments .comment@comments {
    &[id=$commentId];
    .comment-score{$commentScore|Number};
    .comment-text .comment-copy{$text};
    .comment-user{$commentUser|words|join(' ')};
    .comment-date span[title=$date];
  };
}`,
  },
  {
    name: 'example-douban-1',
    htmlUrl: 'resources/douban-reviews.html',
    selector: `
// 豆瓣短评网页数据抓取
// https://movie.douban.com/subject/1292052/comments?start=42&limit=20
title{match($movieName, ' 短评')};
.aside>p>a[href=$movieUrl];
.movie-summary .attrs p@movieDetail|pack {
  &{match('导演:', $director)};
  &{match('主演:', $actors|split('/'))};
  &{match('类型:', $movieType|split(','))};
  &{match('片长:', $duration)};
  &{match('上映:', $releaseTime|split(','))};
};
a.trail_link[href=$trailLink];
#paginator a@links {
  &[href=$href data-page=$page]{$content};
};
.comment-item@comments {
  &[data-cid=$commentId];
  .comment-time{$time|trim};
  .rating[title=$rating];
  .comment-info>a[href=$userLink]{$userName};
  .votes{$votes|Number};
  .comment > p{$commentText|trim};
};`,
  },
]

export default async function loadExamples(exampleName, htmlEditor, selectorEditor) {
  selectorEditor.setValue('')
  htmlEditor.setValue('')
  const example = examples.find(example => example.name === exampleName)
  if (!example) {
    alert('Invalid example name')
    return
  }
  try {
    const response = await fetch(example.htmlUrl)
    if (response.ok) {
      const html = await response.text()
      htmlEditor.setValue(html)
      selectorEditor.setValue(example.selector.trim())
    } else {
      throw new Error('server does not respond with 200')
    }
  } catch (e) {
    alert('加载HTML资源出错.')
    alert('Loading html resources error.')
  }
}
