# Temme

Temme is a more convenient selector to retrieve information from HTML for node spider. Temme is constructed on top of [cheerio](https://github.com/cheeriojs/cheerio), so the syntax is very similar. Temme add some extra grammar to enable selecting multiple items or selecting an array of items at a time.

# Install

Install from npm:

`npm install temme` or `yarn add temme`

# Usage

Import to you `.js` or `.ts`:

```typescript
// es-module
import temme, { defineFilter } from 'temme'
// or use require
const temme = require('temme').default
```

```typescript
const html = '<div id="answers"> <a name="tab-top"></a> <div id="answers-header"> <div class="subhe......'

const selector = `
  .answer@answers (
    .votecell .vote-count-post{$upvote},
    .post-text{$postText},
    .user-info .user-details>a{$userName},
    .comments{$comments},
  )
`
const myFilters = {
  repeat: s => s + s,
  substring20: s => s.substring(0, 20),
}

const result = temme(html, selector, myFilters)
```

# Value-Capture `#`

In Temme, we use normal CSS selector to find the nodes that contains the data we want. After find the nodes, we use capture syntax to store the data into variable.

Use `$foo` to capture what you want. Value capture can be placed at attribute part(in brackets) or content part(in curly braces). In the above basic example, we capture the href attribute into field `url` and we capture the text content into field `title`.

When use value-capture, the result will be an object containing the fields that you define. You can use a single `$` to make a default value-capture, and the result will be a single value. It is useful when you just need capture one field.

*The examples mostly use [this page](https://stackoverflow.com/questions/291978/short-description-of-the-scoping-rules) as html source.*

### Example: Retrieve question URL and question title

* **HTML preview**

![value-capture-preview](/docs/value-capture-preview.jpg)

* **DOM structure**

![value-capture-dom-structure](/docs/value-capture-dom-structure.jpg)

* **Normal CSS selector** `#question-header .question-hyperlink`
* **Temme selector** `#question-header .question-hyperlink[href=$url]{$title}`
* **output**

```json
{
  "url": "/questions/291978/short-description-of-the-scoping-rules",
  "title": "Short Description of the Scoping Rules?"
}
```

# Array-capture `@`

In temme, you could use `@foo` to make an array-capture. You place `@foo` after normal CSS selector(call parent-selector), and define several children selectors using a parenthesis. This means: for every node that matches parent-selector, execute the children selectors one-by-one, put the results of children selectors into an array. The array be the `foo` field of the final result. Like default value-capture, you could just use a dollar sign to make a default array-capture, and the array will be the final result.

### Example: Retrieve all answers

* **HTML preview** Below is what an answer looks like. In the page there are several answers of the same structure.

![array-capture-preview](/docs/array-capture-preview.jpg)

* **DOM structure**

![array-capture-dom-structure](/docs/array-capture-dom-structure.jpg)

* **Selectors and result**

![array-capture-selectors-and-result](/docs/array-capture-selectors-and-result.jpg)

* **Default array capture**

![default-array-capture-selectors-and-result](/docs/default-array-capture-selectors-and-result.jpg)

# Recursive array-captures

Array-capture can be recursive. Just place `@foo` within another array-capture's children part. For example, in stackoverflow.com, one question has several answers and each answer has several comments. We could use the following temme selector to capture an array of arrays(answers) of items(comments).

![array-of-arrays](/docs/array-of-arrays.jpg)

# Parent Reference `&`

`&` gives us the ability to capture data in the parent node. It has the same semantic meaning as in sass, less or stylus.

TODO more docs here.

# Capture Filters (post-processors) `:`

When a value is captured, it is always a string. A filter is a simple function that receive a single parameter and returns a single value. You could use filters to processed the captured value. For example, convert the string to a Date object.

* `li.good{$x:foo}`

  In the above, `foo` is the filter. Every time variable x is captured, it will be process as `x = foo(x)`.

* `div.bad{$:foo:bar}`

  Filters are easy to be chained. In the above example, the value will first be processed by filter `foo` and then by filter `bar`. `value = bar(foo(value))`.

### Built-in filters

Temme provide some common filters. In file `temme.ts`, `defaultFilterMap` defines some built-in filters.

### Defining customized filters

Use `defineFilter` to add customized global filters. Or provide a customized filter map as the third parameter of function `temme`.

# Content functions

By default, `li{$name}` will capture <u>the text content</u> of element into field name. We could use other content functions to capture <u>html</u> or <u>cheerio-node</u>.

Four supported content functions

1. `text($var)` captures the text content of element (default behavior).
2. `html($var)` captures the inner-html of element
3. `node($var)` captures the cheerio-node.
4. `contains('xxx')` checks whether text content contains 'xxx' and captures nothing. If the check fails, the element does not match the selector(Just like the element does not match normal CSS selector).

### Multiple content functions

We could use multiple content functions in a single curly brace. For example,

`p{contains('hello'), html($h), node($n), text($t)}`

This selectors means: check the text content of element contains string 'hello'. If  it does, capture the inner-html of element into field `h`, capture the cheerio-node into field `n`, and capture the text content of element into field `t`.

### Text matching

`text` content function supports string matching. `text` accepts multiple parameters. Each parameter is either a value-capture form or a string literal. It will try to match the text content against multiple parameters. If match succeed, the result will be an object in which field `foo` is the corresponding text  content in the whole text. (TODO text matching description should be more specific.)

For example:

`text(\$name, ':', \$value)`

The above selector will match `<p>foo: hello world!</p>`. And the result is:

```json
{
  "name": "foo",
  "value": " hello world!"
}
```

