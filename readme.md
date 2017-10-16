[![Build Status](https://img.shields.io/travis/shinima/temme/master.svg)](https://travis-ci.org/shinima/temme) [![Coverage Status](https://img.shields.io/coveralls/shinima/temme/master.svg)](https://coveralls.io/github/shinima/temme?branch=master) [![NPM Package](https://img.shields.io/npm/v/temme.svg)](https://www.npmjs.org/package/temme) [![Greenkeeper badge](https://badges.greenkeeper.io/shinima/temme.svg)](https://greenkeeper.io/)

# Temme

Temme is a concise and convenient jQuery-like selector for node crawlers. Temme is built on top of [cheerio](https://github.com/cheeriojs/cheerio). While keeping the CSS selector syntax untouched, temme add some extra grammar to enable capturing data into result. Try temme in [playground](https://temme.js.org).

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

# Examples

[This example][example-github-commits] extracts commits information from GitHub commits page, including time, author, commit message and links. [This example][example-github-issues] extract issues information from GitHub issues page, including title, assignee and number of comments.

[这个例子][example-douban-short-reviews]从豆瓣短评网页中抓取了页面中的信息, 主要包括电影的基本信息和短评列表. [这个例子][example-tmall-reviews]从天猫的商品详情页面中抓取了评论列表, 包括用户的基本信息(匿名), 初次评价和追加评价, 以及晒的照片的链接.

# Inspiration

Temme is inspired by [Emmet](https://emmet.io/). Emmet generates HTML according to a css-selector-like template. The behavior of emmet is like the following function:
```JavaScript
emmet('div[class=red]{text content}')
// => <div class="red">text content</div>

// Extend this function to allow a second argument `data`
emmet('div[class=$cls]{$content}', { cls: 'red', content: 'text content' })
// => <div class="red">text content</div>
```

As the name indicates, temme is the reverse of emmet. If we express temme as a function, then it looks like:
```JavaScript
temme('<div class="red">text content</div>', 'div[class=$cls]{$content}')
// => { cls: 'red', content: 'text content' }
```

Comparison between `emmet` and `temme`:
* `emmet(selector, data) -> html`
* `temme(html, selector) -> data`

Given a selector, `emmet` expand this selector to HTML using data, while `temme` capture data from HTML according to the selector.

# Concepts

## Match

Given a root node (DOM node or cheerio node) and a selector, find the nodes that satisfies the selector. Frequently, we use `querySelectorAll(selector)` or `$(selector)` with jQuery to find the nodes that we want. CSS selectors contains only match information.

## Capture

Given a node and a temme-selector, and returns an object containing the specified items. Item can be value of attribute, text or html. Which fields contains which item are designated by the temme-selector.

## Match and Capture

Temme defines a new selector syntax called temme-selector. Temme-selector contains both match information and capture information. Match part is just like CSS selector; Capture part is described below.

# Grammar and Semantics

**Take a quick tour of grammar in [playground tutorial][playground-tutorial] by examples!**

## Value-Capture `$`

Syntax:
* `$xxx`:  Starts with a dollar sign; xxx should be a valid JavaScript identifier. 
* `[foo=$xxx]`:  Place in attribute part to catpure attribute value.
* `{$xxx}`:  Place in content part to capture html/text.
* `[foo=$]` / `{$}`:  Omit xxx and make a default-value-capture.

Value-capture is a basic form of capture. Value-capture can be placed in attribute part (in square brackets) to capture attribute value, or in content part (in curly braces) to capture text/html. [example][example-value-capture]

Normal attribute match is like `[foo=bar]`. Attribute-capture is like `[foo=$bar]`, which means put the value of attribute `foo` into `.bar` of the capture result. In emmet, `div{foo}` expands to `<div>foo</div>`; In temme, content caputre `{$buzz}` means capture text of a node into `.buzz` of the capture result.

The output of `temme()` is an object called capture-result. Capture-result contains  captured items at specific fields. We can use a single `$` to make a default value-capture, and the capture result will be a single value. [example][example-default-value-capture]

## Array-capture `@`

Syntax:
* `@xxx`:  Starts with an at sign; xxx should be a valid JavaScript identifier.
* `div.foo@xxx { /* children-selectors */ }`:  Can only be placed after a normal CSS selector; A pair of curly brackets is required after xxx; Put children selectors within the curly brackets.
* `div.foo@ { /* children-selector */ }`: Omit xxx and make a default-array-capture.

Array-capture is another form of capture. It is useful when we want to capture an array of similar items. We need place `@xxx` after normal CSS selector (called parent-selector), and define several children selectors within a trailing curly brackets. This means: for every node (called parent-node) that matches parent-selector, execute the children selectors one-by-one; every parent-node corresponds an object as result, and the result of array-capture is the array composed of parent-node result. The array itself will be the `.xxx` field of the upper-level result. Like default-value-capture, we could just use a single at-sign to make a default array-capture, and the array will be the result of upper-level result. [example][example-array-capture]

Like default-value-capture, we can omit xxx and make a default array-capture. [example][example-default-array-capture]

## Nested Array-Captures

Array-capture can be nested. Just place a array-capture within another array-capture. [basic example][example-nested-array-capture]

[In this stackoverflow example][example-so-all-answers-and-all-comments], one question has several answers and each answer has several comments. We could use the nested array-captures to capture an array of arrays of comments.

## Parent Reference `&`

`&` gives us the ability to capture data in the parent node. It has the same semantic meaning as in sass, less or stylus. Parent-reference is useful in array-capture when the data is stored in the parent node. [example][example-parent-reference]

## Multiple Selectors at Top-Level

Temme supports multiple selectors at top-level like in children selectors.
Do not forget to use the semicolon as the separator. [example][example-multiple-selectors-at-top-level]

## Assignments

Syntax:
* `$foo = bar`:  `foo` should be a valid JavaScript identifier; `bar` should be a JavaScript literal (string/number/null/boolean/RegExp).

Assignments could appears in three places:
1. At top level: `$foo = 'bar'` means that string `'bar'` will be in `.foo` of the final result; [example][example-assignments-at-top-level]
2. In content-capture: `div.foo{ $a = null }` is like a conditional capture, if there is a div that satisfies `.foo` qualifier, then the assignment is executed; [example][example-assignments-in-content]
3. In children selector, `li@list { $x = 123 }` means that every object in `list` will have `123` as the `.x` field. [example][example-assignments-in-children-selectors]

## JavaScript Style Comments

Temme selector supports both single line comments `// ......` and multi-line comments `/* ...... */`.

## Capture Filters (post-processors) `|`

### Syntax:
* `$foo|xxx` / `@bar|xxx`:  Place right after a value-capture or array-capture; xxx is the filter functions name and shoule be a valid JavaScript identifier.
* `$foo|xxx(arg1, arg2, ...)`:  Filter can accept arguments. Every argument is a JavaScript literal.
* `$foo|f1(a,b)|f2`: Filters can be chained.

When a value is captured, it is always a string. A filter is a simple function that receive input as `this` with several arguments, and returns a single value. You could use filters to process the captured value. [example][example-filters]

### Running semantics:

* `li.good{$x|foo}`:  Every time `x` is captured, it will be processed as `x = foo.apply(x)`;
* `div.bad{$x|foo(1, false)}`:  Every time variable `x` is captured, it will be processed as `x = foo.apply(x, [1, false])`;
* `div.hello{$x|foo|bar(0, 20)}`:  The value will first be processed by filter `foo` and then by filter `bar`. The value is processed like `x = foo.apply(x); x = bar.apply(x, [0, 20]);`.

### Built-in filters

Temme provides a few filters out of box. Built-in filters could be divided into three categories:
1. Structure Manipulation Filters: this category includes `pack`, `flatten`, `compact`, `first`, `last`, `nth`. These functions are short but powerful. [See source for more detail](/src/filters.ts).
2. Type Coercion Filters: this category includes `String`, `Number`, `Date`, `Boolean`. These filters converts the captured value to specific type.
3. Prototype Filters: We can use methods on prototype chain as filters. For example, if we can ensure that `x` is always a string, then we can safely use `$x|substring(0, 20)` or `$x|toUpperCase`.

### Using Customized Filters

Use `defineFilter` to add customized global filters. Or provide a customized filter map as the third parameter of function `temme`.

```JavaScript
import { defineFilter } from 'temme'

// Define a global filter
defineFilter('myFilter', function myFilter(arg1, arg2) { /* ... */ })

// Pass extraFilters as the third argument
const extraFilters = {
  secondItem() {
    return this[1]
  },
  /* put customized filters here */
}
temme(html, 'div@arr|secondItem { p{$text} }', extraFilters)
```

## Content

The selectors in the curly brackets after normal CSS selector are called content. Content is used to capture text or html of a node. Content consists of several content-parts, seperated by semicolons. Each content-part can be in one of the following forms:  [example][example-content]
1. Capture.  This will capture text/html of the node into the specified field;
2. Assignment.  It is like a conditional assignment, if temme find that a node safisties the normal CSS selector, then the assignment is executed;
3. Content Function Call **(experimental)**. See below for more detail.

### Capture in Content
`text`, `html` and `node` are special filters in content. One of the three is always used as the first filter in content capture. If not specified explicitly, `text` will be used. `text` gets the text content of the mathcing nodes; `html` gets the  inner HTML of the matching nodes; `node` gets the node itself, which is useful when temme-selector does not meet the requirements and we need to do manual capturing with cheerio APIs. [example][example-special-filters-in-content]

### Content Functions (experimental)

Call a content function, passing the capture-result object, the node and the arguments in the parentheses. Content function can do both matching and capturing. See [source](/src/contentFunctions.ts) for more implementation detail. [example][example-content-functions]

Currently, there is only one built-in content function `match`. `match` try to match args against trimed text of a node. Examples of `match`:

* If we call `match($foo, 'world')` on a node with `'hello world'`, then result will be `{ foo: 'hello ' } `
* If we call `match('before', $x, 'after')` on a node with text `'  before mmm  after'`, then the result will be `{ x: ' mmm  ' }`
* If args and text of the node does not match, then `match` will set the state of the capture-result as *failed*. The value of a *failed* capture-result is assumed to be `null`.

### Use Customized Content Functions (experimental)

```JavaScript
import { contentFunctions } from 'temme'

// Get a content function
contentFunctions.get('match')
// Set a customized content function
contentFunctions.set('myContentFn', myContentFn)
// Remove a content function
contentFunctions.remove('uselessContentFn')

function myContentFn(result, node, capture1, string2) {
  /* Your customized logic here */

  // Call CaptureResult#add to add a field of result
  result.add(capture1.name, node.attr('foo'), capture1.filterList)

  // Call CaptureResult#setFailed to set the result to failed state
  result.setFailed()
}
```

## Snippets (experimental)

Snippet is a way of reusing sub-selectors in a temme-selector. It is useful when the parent-selectors vary but children selectors alike.

### Syntax

* `@xxx = { /* selectors seperated by semicolon */ }`  Define a snippet named xxx. xxx should be a valid JavaScript identifier.
* `@xxx`  Expand the snippet named xxx. It is like that we insert the content of snippet xxx in place.

Snippet-define is allowed at top level only. Snippet-expand can be place at top level or in children selectors. Snippets can be nested: `@snippetA -> @snippetB -> @snippetC`; But snippets should not be circled: `@snippetA -> @snippetB -> @snippetA`.

The running semantics of snippet is simple: when temme encounters a snippet-expand, temme will replace the `@xxx` with its content.

(Note: This example is made up and the selector does not work with StackOverflow in fact) For example, a stackoverflow question asked by *person-A* may be edited by *person-B*. Without snippets, our temme-selector is: 

```
.ask-info@asked|pack {
  .time[title=$actionTime];
  .username{$username};
  .reputation{$reputation};
};
.edit-info@edited|pack {
  .time[title=$actionTime];
  .username{$username};
  .reputation{$reputation};
};
```

The children selectors in curly brace are duplicated. We can use snippet to deduplicate them:

```
@personInfo = {
  .time[title=$actionTime];
  .username{$username};
  .reputation{$reputation};
};
.ask-info@asked|pack { @personInfo };
.edit-info@edited|pack { @personInfo };
```

[playground-tutorial]: https://temme.js.org?example=tutorial-start
[example-value-capture]: https://temme.js.org?example=tutorial-value-capture
[example-default-value-capture]: https://temme.js.org?example=tutorial-default-value-capture
[example-array-capture]: https://temme.js.org?example=tutorial-array-capture
[example-default-array-capture]: https://temme.js.org?example=tutorial-default-array-capture
[example-parent-reference]: https://temme.js.org?example=tutorial-parent-reference
[example-nested-array-capture]: https://temme.js.org?example=tutorial-nested-array-capture
[example-multiple-selectors-at-top-level]: https://temme.js.org?example=tutorial-multiple-selectors-at-top-level
[example-assignments-at-top-level]: https://temme.js.org?example=tutorial-assignments-at-top-level
[example-assignments-in-content]: https://temme.js.org?example=tutorial-assignments-in-content
[example-assignments-in-children-selectors]: https://temme.js.org?example=tutorial-assignments-in-children-selectors
[example-filters]: https://temme.js.org?example=tutorial-filters
[example-content]: https://temme.js.org?example=tutorial-content
[example-special-filters-in-content]: https://temme.js.org?example=tutorial-special-filters-in-content
[example-content-functions]: https://temme.js.org?example=tutorial-content-functions

[example-so-all-answers-and-all-comments]: https://temme.js.org?example=so-all-answers-and-all-comments
[example-github-commits]: https://temme.js.org?example=github-commits
[example-github-issues]: https://temme.js.org?example=github-issues
[example-douban-short-reviews]: https://temme.js.org?example=douban-short-reviews-Chinese
[example-tmall-reviews]: https://temme.js.org?example=tmall-reviews-Chinese
