[![Build Status](https://img.shields.io/travis/shinima/temme/master.svg?style=flat-square)](https://travis-ci.org/shinima/temme) [![Coverage Status](https://img.shields.io/coveralls/shinima/temme/master.svg?style=flat-square)](https://coveralls.io/github/shinima/temme?branch=master) [![NPM Package](https://img.shields.io/npm/v/temme.svg?style=flat-square)](https://www.npmjs.org/package/temme) [![Doc in Chinese](https://img.shields.io/badge/文档-中文-607D8B.svg?style=flat-square)](./readme-zh.md) [![Example Douban Movie](https://img.shields.io/badge/示例-豆瓣电影-2196F3.svg?style=flat-square)](/examples/douban-movie/readme.md) [![Example StackOverflow](https://img.shields.io/badge/Example-StackOverflow-2196F3.svg?style=flat-square)](/examples/stackoverflow/readme.md)

# Temme

Temme is a concise and convenient selector to extract JSON from HTML documents. Try temme in the [playground](https://temme.js.org).

# Install

`yarn add temme` or `npm install temme`

# Command Line API

```bash
# Command line tool prefers global installation
yarn global add temme

# Basic usage
temme <selector> <html-or-path-to-a-html-file>

# Use html from stdin; --format to format the output
temme <selector> --format

# Use selector from a file
temme <path-to-a-selector-file>

# Pipe html from `curl` to `temme`
curl -s <url> | temme <selector>
```

# Node API

```typescript
// es-module
import temme from 'temme'
// or use require
// const temme = require('temme').default

const html = '<div color="red">hello world</div>'
const selector = 'div[color=$c]{$t};'
temme(html, selector)
//=> { c: 'red', t: 'hello world' }
```

# Examples

Full examples are available under the [*examples*](/examples) folder. If you are not familiar with temme, you can start with [this douban-movie example (Chinese)](/examples/douban-movie/readme.md) or [this StackOverflow example](/examples/stackoverflow/readme.md).

There are several short examples on the playground. [This example][example-github-commits] extracts commits information from GitHub commits page, including time, author, commit message and links. [This example][example-github-issues] extract issues information from GitHub issues page, including title, assignee and number of comments.

# Inspiration

Temme is inspired by [Emmet](https://emmet.io/). Emmet generates HTML according to a css-selector-like template. The behavior of emmet is like the following function:
```JavaScript
emmet('div[class=red]{text content};')
//=> <div class="red">text content</div>

// Extend this function to allow a second argument `data`
emmet('div[class=$cls]{$content};', { cls: 'red', content: 'text content' })
//=> <div class="red">text content</div>
```

As the name indicates, temme is the reverse of emmet. If we abstract temme as a function, then it looks like:
```JavaScript
temme('<div class="red">text content</div>', 'div[class=$cls]{$content};')
//=> { cls: 'red', content: 'text content' }
```

List the signatures of `emmet` and `temme`, and we get:
* `emmet(selector, data) -> html`
* `temme(html, selector) -> data`

Given a selector, `emmet` expand this selector to HTML using data, while `temme` capture data from HTML according to the selector.

# Some Concepts: Match & Capture & Temme-Selector

Before extracting JSON from HTML, we need to answer two questions:

1. How to find the nodes that contains the data we want?
2. After finding the nodes, which attributes of the node should be extracted, and which fields should be used to store the extracted data?

The answer to the first question is simple: we use CSS selector. CSS selectors are widely used in various aspects. In web standards, CSS selectors define the elements to which a set of CSS rules apply. JQuery/cheerio uses CSS selectors to select elements/nodes in HTML documents. In temme, we use CSS selectors too.

But CSS selectors only contain *match* information and they can only answer the first question. To answer the second question, we need to extend the CSS selectors syntax so that the new syntax (called temme-selector) can contain *capture* information. Capture information is mainly about which items are stored into which fields in result (result is an JavaScript object). Item can be value of attributes, text or html of nodes. Temme-selector `'div[class=$cls]'` captures attribute `class` into `.cls` of the result; Temme-selector `'p{$content}'` captures text content of the p element into field `.content` of the result.

The extended syntax is inspired by several other tools. Temme supports JavaScript-style comments, JavaScript literals (string/number/null/boolean/RegExp), assignments, parent-reference as in [stylus](http://stylus-lang.com/docs/selectors.html#parent-reference), attributes/content capture inspired by Emmet, filters like in [Django](https://docs.djangoproject.com/en/dev/ref/templates/language/#filters) and many other templates. The grammar and the running semantics of the extended syntax are listed below.

# Grammar and Semantics

## Value-Capture `$`

#### Syntax

* `[foo=$xxx]`  Place in CSS attribute qualifiers to catpure attribute value.
* `{$xxx}`  Place in content part to capture html/text.
* `[foo=$]` / `{$}`:  Omit xxx and make a default-value-capture.

Value-capture is a basic form of capture. Value-capture can be placed in attribute part (in square brackets) to capture attribute value, or in content part (in curly braces) to capture text/html. 

#### Running semantics

Normal attribute qualifier is in form `[foo=bar]`. Attribute-capture is in form `[foo=$bar]`, which means putting the value of attribute `foo` into `.bar` of the capture result. Content capture `{$buzz}` means capturing text of a node into `.buzz` of the capture result.

The output of `temme()` is an object called capture-result. Capture-result contains captured items at specific fields. We can use a single `$` to make a default-value-capture, and the capture result will be a single value.

#### Examples

```JavaScript
temme('<div class="red">text content</div>', 'div[class=$cls]{$content};')
//=> { cls: 'red', content: 'text content' }

temme('<div class="red">text content</div>', 'div[class=$]')
//=> 'red'
```

## Array-capture `@`

#### Syntax
* `div.foo@xxx { /* children-selectors */ }`  Place `@xxx { /* ... */ }` after a normal CSS selector
* `div.foo@ { /* children-selectors */ }` Omit xxx and make a default-array-capture.

Array-capture is another form of capture. It is useful when we want to capture an array of similar items. We need place `@xxx { /* ... */ }` after a normal CSS selector (called parent-selector). `@` is the mark of an array-capture. A pair of curly brackets is required after @xxx; Children selectors are put within the curly brackets.

#### Running Semantics

For every node (called parent-node) that matches parent-selector, execute the children selectors one-by-one; every parent-node corresponds to a sub-result. These sub-results are gathered into an array. The array is the result of this array-capture. And the array will be the `.xxx` field of the upper-level result.

Like default-value-capture, we could just use a single at-sign to make a default array-capture, and the array will be the result of upper-level result.

#### Examples

```JavaScript
const html = `
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

temme(html, 'li@fruits { span[data-color=$color]{$name}; }')
//=>
// { 
//   "fruits": [
//     { "color": "red", "name": "apple" },
//     { "color": "white", "name": "pear"  },
//     { "color": "purple", "name": "grape" }
//   ]
// }

// Default value capture
temme(html, 'li@ { span[data-color=$color]{$name}; }')
//=>
// [
//   { "color": "red", "name": "apple" },
//   { "color": "white", "name": "pear"  },
//   { "color": "purple", "name": "grape" }
// ]
```

## Nested Array-Captures

Array-capture can be nested. Just place a array-capture within another array-capture. [In this StackOverflow example][example-so-question-detail], one question has several answers and each answer has several comments. We could use the nested array-captures to capture an array of arrays of comments.

## Parent Reference `&`

`&` gives us the ability to capture data in the parent node. It has the same semantic meaning as in sass, less or stylus. Parent-reference is useful in array-capture when the data is stored in the parent node.

#### Examples

```JavaScript
// html is the same as in array-capture
temme(html, 'li@ { &[data-fruit-id=$fid]; }')
//=> [ { "fid": "1" }, { "fid": "2" }, { "fid": "3" } ]
```

## Multiple Selectors

Temme supports multiple selectors at top-level and in children selectors. Every selector should end with a semicolon. But if the selector ends with curly brace, then the semicolon is optional.

#### Examples

```JavaScript
// html is the same as in array-capture
temme(html, ` [data-color=red]{$name};
              [data-fruit-id="3"] [data-color=$color]; `)
//=> { "name": "apple", "color": "purple" }
```

## Assignments

#### Syntax

* `$foo = bar;`  foo should be a valid JavaScript identifier; bar should be a JavaScript literal (string/number/null/boolean/RegExp).

#### Running Semantics

The running semantics differs when assignments appear in different places:

* At top level: `$foo = 'bar';` means that string `'bar'` will be in `.foo` of the final result;
* In content-capture: `div.foo{ $a = null }` is like a conditional capture: if there is such a div that satisfies `.foo` qualifier, then the assignment is executed;
* In children selector, `li@list { $x = 123 }` means that every object in `list` will have `123` as the `.x` field.

#### Examples

```JavaScript
// html is the same as in array-capture
temme(html, `
$top = 'level';
ul { $hasUlElement = true };
div { $hasDivElement = true };

li@array {
  $row = true;
  $isPurple = false;
  [data-color=purple]{$isPurple = true};
};`)
//=>
// {
//   "top": "level",
//   "hasUlElement": true,
//   "array": [
//     { "row": true, "isPurple": false },
//     { "row": true, "isPurple": false },
//     { "row": true, "isPurple": true }
//   ]
// }
```

## JavaScript Style Comments

Temme selector supports both single line comments `// ......` and block comments `/* ...... */`.

## Capture Filters `|`

#### Syntax
* `$foo|xxx` / `@bar|xxx`  Place right after a value-capture or array-capture; xxx is the filter functions name and shoule be a valid JavaScript identifier.
* `$foo|xxx(arg1, arg2, ...)`  Filter can accept arguments. Every argument should be a JavaScript literal.
* `$foo|f1(a,b)|f2`  Filters can be chained.

#### Running Semantics

When a value is captured, it is always a string. A filter is a simple function that receive input as `this` with several arguments, and returns a single value. We use filters to process the captured value.

* `div{$x|foo}`  Every time x is captured, it will be processed as `x = foo.apply(x)`;
* `div{$x|foo(1, false)}`  Every time variable x is captured, it will be processed as `x = foo.apply(x, [1, false])`;
* `div{$x|foo|bar(0, 20)}`  The value will first be processed by filter foo and then by filter bar. The value is processed like `x = foo.apply(x); x = bar.apply(x, [0, 20]);`.

#### Built-in filters

Temme provides a few filters out of box. Built-in filters could be divided into three categories:
1. Structure Manipulation Filters: this category includes `pack`, `flatten`, `compact`, `first`, `last`, `nth`, `get`. These functions are short but powerful. [See source for more detail](/src/filters.ts).
2. Type Coercion Filters: this category includes `String`, `Number`, `Date`, `Boolean`. These filters converts the captured value to specific type.
3. Prototype Filters: We can use methods on prototype chain as filters (This is why the input is supplied as `this`). For example, if we can ensure that x is always a string, then we can safely use `$x|substring(0, 20)` or `$x|toUpperCase`.

#### Array-Filters Syntax `||`

Using array-filter syntax `||`, temme will treat the captured value as an array, and apply the filter to every item of this array.

```JavaScript
temme('<div>1 22 333 4444</div>', `div{ $|split(' ')||Number }`)
//=> [1, 22, 333, 4444]
```

## Customized Filters

Temme supports defining customized filter in several ways.

#### Global Filters Definition

Use `defineFilter` to define customized global filters.

```JavaScript
import { defineFilter } from 'temme'

// Define a global filter
defineFilter('myFilter', function myFilter(arg1, arg2) { /* ... */ })
```

#### Filters as a Parameter of temme()

Provide a customized filter map as the third parameter of function `temme`.

```JavaScript
// Pass extraFilters as the third argument
const extraFilters = {
  secondItem() {
    return this[1]
  },
  /* more customized filters here */
}
temme(html, 'div@arr|secondItem { p{$text} }', extraFilters)
```

#### Inline Filters Definition

Define filters in selector. Inline filters definition has the same syntax as JavaScript-style function definition. The difference is that temme use *filter* as the keyword instead of *function*.

```
filter myFilter(arg1, arg2, arg3) {
  /* Filter Logic Here. */
  /* The code here will be executed as in a JavaScript function. */
  /* Note that the curly braces must be balanced here. */
}

// We can use `myFilter` like this:
div{$txt|myFilter(x, y, z)};
```

## Content

The selectors in the curly brackets after normal CSS selector are called content. Content is used to capture text or html of a node. Content consists of several content-parts, separated by semicolons. Each content-part can be in one of the following forms:

1. Capture.  This will capture text/html of the node into the specified field;
2. Assignment.  It is like a conditional assignment, if temme find that a node satisfies the normal CSS selector, then the assignment is executed;
3. Content Function Call **(experimental)**. See below for more detail.

### Capture in Content

`text`, `html`, `outerHTML` and `node` are special filters in content. One of these is always used as the first filter in content capture. If not specified explicitly, `text` will be used.

* `text` gets the text content of the matching nodes;
* `html` gets the inner HTML of the matching nodes;
* `outerHTML` gets the outer HTML of the matching nodes;
* `node` gets the node itself, which is useful when temme-selector does not meet the requirements and we need to call cheerio APIs manually. 

Examples:

```JavaScript
const html = '<div class="outer"> <p>TEXT-1</p> <div class="inner">TEXT-2</div> </div>'
const selector = `
div.outer{
  $a;
  $b|text;
  $c|html;
  $d|outerHTML;
  $e|node|attr('class');
  $f|toLowerCase;
}`
temme(html, selector)
//=>
// {
//   "a": " TEXT-1 TEXT-2 ",
//   "b": " TEXT-1 TEXT-2 ",
//   "c": " <p>TEXT-1</p> <div class=\"inner\">TEXT-2</div> ",
//   "d": "<div class=\"outer\"> <p>TEXT-1</p> <div class=\"inner\">TEXT-2</div> </div>",
//   "e": "outer",
//   "f": " text-1 text-2 "
// }
```

### Content Functions (experimental)

Call a content function, passing the capture-result object, the node and the arguments in the parentheses. Content function can do both matching and capturing. See [source codes](/src/contentFunctions.ts) for more implementation detail.

Currently, this feature is experimental and there is only one built-in content function `find`. `find` try to capture a substring of the node text.

* `find($x, 'world')` will try to capture the text **before** `'world'`. If the text of node is `'hello world'`, then the result will be `{ x: 'hello' }`
* `find('hello', $x)` will try to capture the text **after** `'hello'`.
* `find('hello', $x, 'world')` will try to capture the text **between** `'hello'` and `'world'`.

`find` simply uses `String#indexOf` to get the index of a substring. If `find` cannot find the substring that should appear before/after the target substring, then it will set the capture-result as *failed*.

Example:

```JavaScript
const html = '<a href="https://github.com/shinima/temme">Star Me on GitHub</a>'
temme(html, `a { find('Star Me on ', $website) }`)
//=> { "website": "GitHub" }

temme(html, `a { find('Fork Me on ', $website) }`)
//=> null
```

### Use Customized Content Functions (experimental)

```JavaScript
import { contentFunctions } from 'temme'

// Get/set/remove a customized content function
contentFunctions.get('find')
contentFunctions.set('myContentFn', myContentFn)
contentFunctions.remove('uselessContentFn')

function myContentFn(result, node, capture1, string2) {
  /* Your customized logic here */

  // Call CaptureResult#add to add a field of result
  result.add(capture1.name, node.attr('foo'), capture1.filterList)

  // Call CaptureResult#setFailed to set the result to failed state
  result.setFailed()
}
// Usage: div{ myContentFn($x, 'yyy') }
// When myContentFn() is called, $x is passed to parameter capture1,
// and 'yyy' is passed to parameter string2
```

Content function is a more powerful way than normal css selector. But in most scenarios, we do not need customized content functions. Temme supports pseudo-selector powered by [css-select](https://github.com/fb55/css-select#supported-selectors). Especially, `:contains`, `:not` and `:has` are useful pseudo-selectors which enhance the select ability a lot. Before using customized content functions, try to test whether pseudo-selectors can satisfy the requirements.

## Snippets (experimental)

Snippet is a way of reusing sub-selectors in a temme-selector. It is useful when the parent-selectors vary but children selectors alike.

#### Syntax

* `@xxx = { /* selectors */ };`  Define a snippet named xxx. xxx should be a valid JavaScript identifier.
* `@xxx;`  Expand the snippet named xxx. It is like that we replace xxx with the content of snippet.

Snippet-define is allowed at top level only. Snippet-expand can be place at top level or in children selectors. Snippets can be nested: `A -> B -> C` (A uses B, B uses C); But snippets should not be circled.

#### Running Semantics

The running semantics of snippet is simple: when temme meets a snippet-expand, temme will replace the `@xxx` with its content.

#### Examples:

Note that this example is made up and the selector does not work with the real StackOverflow html. A StackOverflow question asked by *person-A* may be edited by *person-B*. Without snippets, our temme-selector is: 

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
.ask-info@asked|pack { @personInfo; };
.edit-info@edited|pack { @personInfo; };
```

[example-so-question-detail]: https://temme.js.org?example=so-question-detail
[example-github-commits]: https://temme.js.org?example=github-commits
[example-github-issues]: https://temme.js.org?example=github-issues
