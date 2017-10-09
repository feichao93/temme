const simpleHtml1 = '<a href="/js.txt.yaml.json" class="link">TEXT CONTENT</a>'

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

const simpleHtml3 = `
<a href="https://github.com/shinima/temme">Star Me on GitHub</a>
<table class="awesome-table">
  <tr data-row-id="100321">
    <td>A</td>
    <td>B</td>
  </tr>
  <tr data-row-id="100322">
    <td>C</td>
    <td>D</td>
  </tr>
  <tr data-row-id="100323">
    <td>E</td>
    <td>F</td>
  </tr>
</table>`

const simpleHtml4 = `
<div class="outer">
  <p>TEXT-1</p>
  <div class="inner">TEXT-2</div>
</div>`

export default [
  {
    name: 'tutorial-start',
    html: `
<html>
  Here is the editor for HTML.
  It is readonly in example mode for now.
  After exiting example mode, you can edit HTML here.
</html>`,
    selector: `
/*

Thank you for using Temme. 

Here is the editor for selector. You can edit here and see the result instantly.
In this tutorial, I will explain temme grammars through several examples with comments.

If you are ready, click the next button on the top.

*/`,
  },
  {
    name: 'tutorial-1',
    html: simpleHtml1,
    selector: `
// value-capture
.link[href=$href]{$txt}

/* Value-capture is a basic form of capture. It uses $foo syntax. Value-capture 
can be placed at attribute part (in square brackets) to capture attribute value,
 or at content part (in curly braces) to capture text/html.

In this basic example, CSS selector that matches element a is '.link'
'[href=$href]' is a attribute capture which means that "capture href attribute into .href".
'{$txt}' is a content capture means that "capture text content of the element into .txt". 
*/`,
  },
  {
    name: 'tutorial-2',
    html: simpleHtml1,
    selector: `
// default-value-capture

.link[href=$]; // capture href attribute as result

// capture text content as result
// .link{$}; // uncomment this line to see the effects

/* We can use a single $ to make a default value-capture, and 
the result will be a single value. 
*/`,
  },
  {
    name: 'tutorial-3',
    html: simpleHtml2,
    selector: `
// array-capture 
li@fruits {
  span[data-color=$color]{$name};
}

/* Array-Capture is useful when we want to capture an array of similar items.
Place '@foo { ... }' after a css selector, and define several children selectors
within the curly brackets. This means: for every node (called parent-node) that
matches parent-selector, execute the children selectors one-by-one; every 
parent-node corresponds an object as result, and the result of array-capture 
is the array composed of parent-node result. The array itself will be the foo
field of the upper-level result. 
*/
`,
  },
  {
    name: 'tutorial-4',
    html: simpleHtml2,
    selector: `
// default-array-capture 
li@ {
  span[data-color=$color]{$name};
}

/* Like default value-capture, we could just use a single at-sign to make a default 
array-capture, and the array will be the result of upper-level result.
*/
`,
  },
  {
    name: 'tutorial-5',
    html: simpleHtml2,
    selector: `
// Parent-Reference 
li@ {
  &[data-fruit-id=$fid];
  span[data-color=$color]{$name};
}

/* & gives us the ability to capture data in the parent node. It has the same 
semantic meaning as in sass, less or stylus. Parent-reference is useful in 
array-capture when the data is stored in the parent node.
*/
`,
  },
  {
    name: 'tutorial-6',
    html: simpleHtml3,
    selector: `
// Nested-Array-Captures
tr@ {
  &[data-row-id=$rowId];
  td@cells { &{$} };
};

/* Array-capture can be nested. Just place an array-capture within another array-capture.
*/
`,
  },
  {
    name: 'tutorial-7',
    html: simpleHtml3,
    selector: `
// Multiple Selectors at Top-Level
a[href=$link];
a{$text};
table[class=$tableClass];

/* Temme supports multiple selectors at top-level like in children selectors.
Do not forget to use the semicolon as the separator.
*/
`,
  },
  {
    name: 'tutorial-8',
    html: simpleHtml3,
    selector: `
// Assignments at top-level
$str = 'bar';
$num = 123;
$nil = null;
$bool = true;
$regx = /.*/gi; // JSON.stringify(regx) => empty object

/* Assignment at top-level is quite straightforward. You can supply a JavaScript
 literal on the right. String, Number, null, Boolean, and RegExp is accepted.
*/
`,
  },
  {
    name: 'tutorial-9',
    html: simpleHtml3,
    selector: `
// Assignments in content
$hasAElement = false;
$hasDivElement = false;

a { $hasAElement = true };
div { $hasDivElement = true };
table.awesome-table { $hasAwesomeTable = 666 };
table.foo-bar { $foobar = null };

/* Assignments in content are like conditional assignments. If there is such an element
that satisfies the given selector, then we assign.
*/
`,
  },
  {
    name: 'tutorial-10',
    html: simpleHtml3,
    selector: `
// Assignments in children selectors
tr@ {
  $row = true;
  &[data-row-id=$rowId];
};
`,
  },
  {
    name: 'tutorial-11',
    html: simpleHtml3,
    selector: `
// filters
tr@ {
 &[data-row-id=$rid|Number];
 td@cells|join(' ')|toLowerCase { &{$} };
}

/* When a value is captured, it is always a string. A filter is a 
simple function that receive input as this context with several 
arguments, and returns a single value. You could use filters to
process the captured value.

In the above example, '$rid|Number' means that every time $rid captures a value,
it will be processed by 'Number' filter and it will be converted to a number.

In "@cells|join(' ')|toLowerCase", two filters are chained, and both filters
are from its prototype. Every time @cells is captured, it will be processed like
cells = cells.join(' ').toLowerCase()

See source file src/filters.ts to view all built-in filters. 

*/`,
  },
  {
    name: 'tutorial-12',
    html: simpleHtml3,
    selector: `
// content
a{
  $text;                           // capture
  $assignmentInContent = true;     // assignment
  match('Star Me on ', $website);  // function call
};

/* The part in the curly brackets is called "content". Content consists of
several parts. Content part could be a capture, an assignment or a function call. 
*/
`,
  },
  {
    name: 'tutorial-13',
    html: simpleHtml4,
    selector: `
// special filters in content
div.outer{
  $a;
  $b|text;
  $c|html;
  $d|node|attr('class');
  $e|toLowerCase;
}

/* 'text', 'html' and 'node' are special filters in content. One of the three filters
is always used as the first filter in content capture. If not specified, 'text'
will be used.

Note the difference between content and array-capture: array-capture has an at-sign @.
*/`,
  },
  {
    name: 'tutorial-14',
    html: simpleHtml3,
    selector: `
// content functions
a {
  match('Star Me on ', $website);
}

/* We can call content functions in content. Content function is an advanced method that
can process match and capture at the same time.
See file src/contentFunctions.ts for more information.
*/`,
  },
  {
    name: 'tutorial-end',
    html: simpleHtml3,
    selector: `
/*
Thank you for reading this short tutorial.
Click next to see some real-world complex examples.
*/`,
  },
  {
    name: 'example-so-1',
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
    name: 'example-so-2',
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
