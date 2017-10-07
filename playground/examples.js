export default [
  {
    name: 'welcome',
    html: `
<html>
  Here is the editor for HTML.
  It is readonly in example mode for now.
  After exiting example mode, you can edit HTML here.
</html>`,
    selector: `
/*
Thank you for using Temme.
Temme supports JavaScript-style comments.
So in this tutorial, I will explain temme grammar through the comments.

If you are ready, click the next button on the top.

*/`,
  },
  {
    name: 'basic-1',
    html: `
<!-- https://stackoverflow.com/questions/291978/short-description-of-the-scoping-rules -->
<a href="/questions/291978/short-description-of-the-scoping-rules" class="question-hyperlink">
  Short Description of the Scoping Rules?
</a>`,
    selector: `
// Capture title and link of a stackoverflow question
#question-header .question-hyperlink[href=$href]{$title}`,
  },
  {
    name: 'basic-2',
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
    name: 'github-1',
    htmlUrl: 'resources/github-commits.html',
    selector: `
// https://github.com/shinima/temme/commits/v0.3.0
// Extract commits information from GitHub commits page
.commits-listing .commit@ {
  relative-time[datetime=$time],
  .commit-author{$author},
  .commit-title >a[title=$message],
  .commit-links-group>a[href=$commitLink]{$shortHash|trim},
  a[aria-label^="Browse the repository" href=$treeLink],
}`,
  },
  {
    name: 'github-2',
    htmlUrl: 'resources/github-issues.html',
    selector: `
// https://github.com/facebook/react/issues?q=
// Extract issue information from GitHub issues page
.js-issue-row@{
  &[id=$issueId|slice(6)|Number];

  .float-left.pt-2.pl-3>span[aria-label=$type];
  .float-left.col-9.p-2>a[href=$link]{$title|trim};
  relative-time[datetime=$time];

  $assignee = null;
  .float-left a.avatar[aria-label=$assignee];

  $commentCount = 0;
  .float-right.col-5 a span{$commentCount|Number};
}`
  },
  {
    name: 'douban-1',
    htmlUrl: 'resources/douban-reviews.html',
    selector: `// 豆瓣短评网页数据抓取
// https://movie.douban.com/subject/1292052/comments?start=42&limit=20
title{match($movieName, ' 短评')};

.aside>p>a[href=$movieUrl];

.movie-summary .attrs p@movieDetail|pack {
  &{match('导演:', $director)};
  &{match('主演:', $actors|split(/ *\\/ */)|slice(0,3))};
  &{match('类型:', $movieType)};
  &{match('片长:', $duration)};
  &{match('上映:', $releaseTime)};
};
.comment-item@comments {
  &[data-cid=$commentId];
  .comment-time{$time|trim};
  .rating[title=$rating];
  .comment-info>a[href=$userLink]{$userName};
  .votes{$votes|Number};
  .comment > p{$commentText|trim|substring(0,20)|concat('...')};
};`,
  },
]
