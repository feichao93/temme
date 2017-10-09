[![Build Status](https://img.shields.io/travis/shinima/temme/master.svg)](https://travis-ci.org/shinima/temme) [![Coverage Status](https://img.shields.io/coveralls/shinima/temme/master.svg)](https://coveralls.io/github/shinima/temme?branch=master) [![NPM Package](https://img.shields.io/npm/v/temme.svg)](https://www.npmjs.org/package/temme) [![Greenkeeper badge](https://badges.greenkeeper.io/shinima/temme.svg?style=flat-square)](https://greenkeeper.io/)

**Doc is building in progress.**

# Temme

Temme is a concise and convenient jQuery-like selector for node crawlers. Temme is built on top of [cheerio](https://github.com/cheeriojs/cheerio). While keeping the CSS selector syntax untouched, temme add some extra grammar to enable capturing data into result. Try temme in [playground](http://shinima.pw/temme/).

# Install

Install from npm:

`npm install temme` or `yarn add temme`

# Usage

```typescript
// es-module
import temme from 'temme'
// or use require
// const temme = require('temme').default

const html = '<div color="red">hello world</div>'
const temmeSelector = 'div[color=$c]{$t}'
temme(html, temmeSelector)
// => { c: 'red', t: 'hello world' }
```

# Inspiration

Temme is inspired by [Emmet](https://emmet.io/). Emmet generates HTML according to a css-selector-like template. The behavior of `emmet` is like the following function:
```JavaScript
emmet('div[class=red]{text content}')
// => <div class="red">text content</div>
```

If we extend this function to allow a second argument `data`. Then the function could look like:
```JavaScript
emmet('div[class=$cls]{$content}', { cls: 'red', content: 'text content' })
// => <div class="red">text content</div>
```

As the name indicates, temme is the reverse of `emmet`. If we express temme as a function, then it looks like:
```JavaScript
temme('<div class="red">text content</div>', 'div[class=$cls]{$content}')
// => { cls: 'red', content: 'text content' }
```

Comparison between emmet and temme:
* `emmet(selector, data) -> html`
* `temme(html, selector) -> data`

Given a selector, `emmet` expand this selector to HTML using data of the object, while `temme` capture data from HTML into an object according to the selector.

# Concepts

## Match

Given a root node (DOM node or cheerio node) and a selector, find the nodes that satisfies the selector. Frequently, we use `querySelectorAll(selector)` or `$(selector)` with jQuery to find the nodes that we want. CSS selectors contains only match information.

## Capture

Given a node and a temme-selector, and returns an object containing the specified content. Content can be value of attribute, text or html. Which fields contains which content are designated by the temme-selector.

## Match and Capture

Temme defines a new selector syntax called temme-selector. Temme-selector contains both match information and capture information. Match part is just like CSS selector; Capture part is described below.

# Grammar and Semantics

Take a quick tour of grammar in [playground tutorial][playground-tutorial] by examples!

## Value-Capture `$`

Value-capture is a basic form of capture. Its syntax is like `$foo`. The dollar sign `$` means it is a capture. `foo` should be a valid JavaScript identifier. Value-capture can be placed in attribute part (in square brackets) to capture attribute value, or in content part (in curly braces) to capture text/html. [example][example-value-capture]

Normal attribute match is like `[foo=bar]`. Attribute-capture is like `[foo=$bar]`, which means put the value of attribute `foo` into `.bar` of the capture result. In emmet, `div{foo}` expands to `<div>foo</div>`; In temme, content caputre `{$buzz}` means capture text of a node into `.buzz` of the capture result.

The output of `temme()` is an object called capture-result. Capture-result contains  captured items at specific fields. We can use a single `$` to make a default value-capture, and the capture result will be a single value. [example][example-default-value-capture]

## Array-capture `@` (TODO)

Array-capture is another form of capture. It is useful when we want to capture an array of similar items. We need place `@foo` after normal CSS selector (called parent-selector), and define several children selectors within a trailing curly brackets. This means: for every node (called parent-node) that matches parent-selector, execute the children selectors one-by-one; every parent-node corresponds an object as result, and the result of array-capture is the array composed of parent-node result. The array itself will be the `foo` field of the upper-level result. Like default value-capture, we could just use a single at-sign to make a default array-capture, and the array will be the result of upper-level result. [example][example-array-capture]

In the following example, we want to capture all answers in this [stackoverflow question][]. We know that every answer is in an `<div class="answer">...</div>` and we use `.answer@answers` as the parent selector. There are 4 value-capture selectors in the curly brackets and these children selectors will capture four different parts of an answer. The running procedure is straightforward: `.answer` selector will match an array of answer-div; for each answer-div, run the children selectors, and get an answer-object `{ upvote: ..., postText: "...", userName: ..., comments: "..." }`; put all the answer-objects into an array, and the array is the `answers` field of the final result.

If all we want is the answers array, we can make a default array-capture. Change the selector to `'.answer@ ( /* children selectors */ )'` , and the output will just be an array of answer objects. [example][example-default-array-capture]

## Nested Array-Captures

Array-capture can be nested. Just place a array-capture within another array-capture. For example, in [stackoverflow question][], one question has several answers and each answer has several comments. We could use the nested array-captures to capture an array of arrays of comments. [example][example-nested-array-capture]

## Parent Reference `&`

`&` gives us the ability to capture data in the parent node. It has the same semantic meaning as in sass, less or stylus. Parent-reference is useful in array-capture when the data is stored in the parent node. [example][example-parent-reference]

## Multiple Selectors at Top-Level

Like we can use multiple selectors as children of parent selector, we can use multiple selectors at top level. Remember to use semicolon as the separator. [example][example-multiple-selectors-at-top-level]

## Assignments

Assignment is a statement like `$foo = bar` where `foo` is an identifier and `bar` is a JavaScript literal (string/number/null/boolean/RegExp). Assignments could appears in three places:

1. In top-level, `$foo = 'bar'` means that string `'bar'` will be in `.foo` of the final result; [example][example-assignments-at-top-level]
2. In content-capture, `div.foo{ $a = null }` means that if we have such a div, then we put `null` in field `a`; [example][example-assignments-in-content]
3. In children selector, `li@list ( $x = 123 )` means that every object in `list` will have `123` as the `x` field. [example][example-assignments-in-children-selectors]

## JavaScript Style Comments

Temme selector supports both single line comments `// ......` and multi-line comments `/* ...... */`.

## Capture Filters (post-processors) `|`

When a value is captured, it is always a string. A filter is a simple function that receive input as *this context* with several arguments, and returns a single value. You could use filters to process the captured value. [example][example-filters]

### Filter Syntax

* No arguments: `li.good{$x|foo}` or `li.good{$x|foo()}`

  In the above, `foo` is the filter function. Every time variable `x` is captured, it will be processed as `x = foo.apply(x)`.

* With arguments: `div.bad{$x|foo(1,false)}`

  In the above, `foo` is the filter function. Every time variable `x` is captured, it will be processed as `x=foo.apply(x, [1, false])`;

* Chained filters: `div.hello{$x|foo|bar(0, 20)}`

  Filters are easy to be chained. In the above example, the value will first be processed by filter `foo` and then by filter `bar`. The value is processed like `x = foo.apply(x); x = bar.apply(x, [0, 20]);`.

Note that filter arguments could only be JavaScript literals (string/number/null/boolean, except RegExp).

### Built-in filters

Temme provides a few common filters out of box. Built-in filters could be divided into three categories:
1. Structure Manipulation Filters: this category includes `pack`, `flatten`, `compact`, `first`, `last`, `words`, `lines`. These functions is short but powerful. [See source for more detail](/src/filter.ts).
2. Type Coercion Filters: this category includes `String`, `Number`, `Date`, `Boolean`. These filters converts the captured value to specific type.
3. Prototype Filters: We can use methods on prototype chain as filters. For example, if we can ensure that `x` is always a string, then we can safely use `$x|substring(0, 20)` or `$x|toUpperCase`.

### Defining customized filters

Use `defineFilter` to add customized global filters. Or provide a customized filter map as the third parameter of function `temme`.

## Content

The selectors in the curly brackets after normal CSS selector are called content. Content is used to capture text or html of a node. Content consists of several content-part, seperated by semicolon. Each content-part can be in one of the following forms:
1. Capture.  This will capture text/html of the node into the specified field;
2. Assignment.  It is like a conditional assignment, if temme find that a node safisties the normal CSS selector, then the assignment is executed;
3. Content Function Call.  Call a content function, passing the capture-result object, the node and the arguments in the parentheses. Content function can do both matching and capturing. (TODO explain content functions more specific.) For example, `match('before', $buzz, 'after')` is translated to `match(result, node, 'before', { name: 'buzz', filterList: [] }, 'after')`. [example][example-content-functions]

### Capture in Content
`text`, `html` and `node` are special filters in content. One of the three is always used as the first filter in content capture. If not specified explicitly, `text` will be used. `text` gets the text content of the mathcing nodes; `html` gets the  inner HTML of the matching nodes; `node` gets the node itself, which is useful when temme-selector does not meet out requirements and we need to do manual capturing with cheerio APIs. [example][example-special-filters-in-content]

### Content Functions(TODO)

## Snippets (TODO)

Define the snippet before using.


[stackoverflow question]: https://stackoverflow.com/questions/291978/short-description-of-the-scoping-rules

[playground-tutorial]: http://shinima.pw/temme/?example=tutorial-start
[example-value-capture]: http://shinima.pw/temme/?example=tutorial-value-capture
[example-default-value-capture]: http://shinima.pw/temme/?example=tutorial-default-value-capture
[example-array-capture]: http://shinima.pw/temme/?example=tutorial-array-capture
[example-default-array-capture]: http://shinima.pw/temme/?example=tutorial-default-array-capture
[example-parent-reference]: http://shinima.pw/temme/?example=tutorial-parent-reference
[example-nested-array-capture]: http://shinima.pw/temme/?example=tutorial-nested-array-capture
[example-multiple-selectors-at-top-level]: http://shinima.pw/temme/?example=tutorial-multiple-selectors-at-top-level
[example-assignments-at-top-level]: http://shinima.pw/temme/?example=tutorial-assignments-at-top-level
[example-assignments-in-content]: http://shinima.pw/temme/?example=tutorial-assignments-in-content
[example-assignments-in-children-selectors]: http://shinima.pw/temme/?example=tutorial-assignments-in-children-selectors
[example-filters]: http://shinima.pw/temme/?example=tutorial-filters
[example-content]: http://shinima.pw/temme/?example=tutorial-content
[example-special-filters-in-content]: http://shinima.pw/temme/?example=tutorial-special-filters-in-content
[example-content-functions]: http://shinima.pw/temme/?example=tutorial-content-functions
