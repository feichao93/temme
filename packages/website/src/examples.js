const simpleHtml1 = '<a href="https://github.com/shinima/temme">Star Me on GitHub</a>'

const simpleHtml2 = `
<ul>
  <li data-fruit-id="1">
    <span data-color="red">apple</span>
  </li>
  <li data-fruit-id="2">
    <span data-color="white">pear</span>
  </li>
  <li data-fruit-id="3">
    <span data-color="purple">grape</span>
  </li>
</ul>`

const examples = [
  {
    name: 'basic-value-capture',
    html: simpleHtml1,
    selector: `a[href=$href]{$txt};`,
  },
  {
    name: 'basic-default-value-capture',
    html: simpleHtml1,
    selector: `a[href=$];`,
  },
  {
    name: 'basic-array-capture',
    html: simpleHtml2,
    selector: `li@fruits {\n  span[data-color=$color]{$name};\n}`,
  },
  {
    name: 'basic-parent-reference',
    html: simpleHtml2,
    selector: `li@ {\n  &[data-fruit-id=$fid];\n  span[data-color=$color]{$name};\n}`,
  },
  {
    name: 'basic-content',
    html: simpleHtml1,
    selector: `
a{ $text }; // capture
a{ $assignmentInContent = true }; // assignment
a{ find('Star Me on ', $website) }; // function call`,
  },
  {
    name: 'so-question-detail',
    htmlUrl: 'resources/stackoverflow-question.html',
    selector: `
// https://stackoverflow.com/questions/291978/short-description-of-the-scoping-rules
// Capture detail of the question
filter format() {
  return this.replace(/\\s+/g, ' ')
}

#question-header a[href=$link]{$title};

.question .vote-count-post{$upvoteCount|Number};
.question .post-text{ html($postText|trim|format) };
.question .post-tag@tagList{ &{$} };
.question .post-signature:last-child .user-details a{$askedBy|format};

.answer@answers {
  &[data-answerid=$answerid];
  $accepted = false;
  &.accepted-answer{$accepted = true};
  .vote-count-post{$upvoteCount|Number};

  .post-text{ html($postText|trim|format) };
  .post-signature:last-child .user-details a{$answeredBy|format};
  .user-action-time{$action|trim|format}

  .comment@comments{
    .comment-user{$commentedBy|format};
    .comment-copy{$text};
  }
}`,
  },
  {
    name: 'github-commits',
    htmlUrl: 'resources/github-commits.html',
    selector: `
// https://github.com/shinima/temme/commits/v0.3.0
// Extract commits information from GitHub commits page
.commits-listing .commit@ {
  relative-time[datetime=$time];
  .commit-author{$author};
  .commit-title >a[title=$message];
  .commit-links-group>a[href=$commitLink]{$shortHash|trim};
  a[aria-label^="Browse the repository" href=$treeLink];
}`,
  },
  {
    name: 'github-issues',
    htmlUrl: 'resources/github-issues.html',
    selector: `
// https://github.com/facebook/react/issues?q=
// Extract issue information from GitHub issues page

filter url() {
  const baseUrl = 'https://github.com/facebook/react/issues?q='
  return new URL(this, baseUrl).href
}

.js-issue-row@{
  &[id=$issueId|slice(6)|Number];

  .float-left.pt-2.pl-3>span[aria-label=$type];
  .float-left.col-9.p-2>a[href=$link|url]{$title|trim};
  relative-time[datetime=$time];

  $assignee = null;
  .float-left a.avatar[aria-label=$assignee];

  $commentCount = 0;
  .float-right.col-5 a span{$commentCount|Number};
}`,
  },
  {
    name: 'douban-movie-summary-Chinese',
    htmlUrl: 'resources/douban-movie-summary.html',
    selector: `// 豆瓣电影介绍页面数据抓取
// https://movie.douban.com/subject/26930504/

// 电影的名称
[property="v:itemreviewed"]{$title};
// 电影上映年份
.year{$year|substring(1, 5)|Number};
// 电影导演
[rel="v:directedBy"]@directedBy { &{$} };
// 电影编剧
:contains('编剧') + span{$storyFrom|split('/')||trim};
// 电影主演(前三位)
[rel="v:starring"]@starring|slice(0, 3){&{$}}

// 平均评分
[property="v:average"]{$avgRating|Number};
// 具体的评分情况
.ratings-on-weight .item@ratingInfo{
  span[title=$title];
  .rating_per{$percentage};
};

// 电影剧情简介
[property="v:summary"]{$summary|trim};

// 喜欢这部电影的人也喜欢
.recommendations-bd dl@recommendations{
  img[alt=$name src=$imgUrl];
  a[href=$url];
};`,
  },
  {
    name: 'tmall-reviews-Chinese',
    htmlUrl: 'resources/tmall-reviews.html',
    selector: `
// 天猫商品评价数据抓取
// 评论数据来自于 https://detail.tmall.com/item.htm?id=549049522944&skuId=3499764035487
filter url() {
  const base = 'https://detail.tmall.com/item.htm'
  return new URL(this, base).href
}

@reviewDetail = {
  .tm-rate-title{$title};
  .tm-rate-fulltxt{$text|trim};
  .tm-m-photos ul>li@imgs{
    &[data-src=$|url];
  };
};

.rate-grid tr@{
  .rate-user-info{$user};
  .rate-user-grade{$userGrade};
  .col-meta .rate-sku p@meta{ &[title=$]; };
  .tm-col-master >.tm-rate-content@premiere|pack { @reviewDetail; };
  .tm-rate-premiere@premiere|pack { @reviewDetail; };
  .tm-rate-append@append|pack { @reviewDetail; };
}`,
  },
]

if (process.env.NODE_ENV === 'development') {
  examples.push({
    name: 'test',
    html: simpleHtml2,
    selector: `// 测试用的样例
modifier foo(result, node) {
  result.set('foo', 'bar')
}

procedure bar(result, node, capture) {
  result.add(capture, node.text())
}

li@list!foo {
  span{ bar($); $foo };
};`,
  })
}

export default examples
