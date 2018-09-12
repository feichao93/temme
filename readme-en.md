[![Build Status](https://img.shields.io/travis/shinima/temme/master.svg?style=flat-square)](https://travis-ci.org/shinima/temme) [![Coverage Status](https://img.shields.io/coveralls/shinima/temme/master.svg?style=flat-square)](https://coveralls.io/github/shinima/temme?branch=master) [![NPM Package](https://img.shields.io/npm/v/temme.svg?style=flat-square)](https://www.npmjs.org/package/temme) ![Node Version Requirement](https://img.shields.io/badge/node-%3E=6-f37c43.svg?style=flat-square) [![VSCode Extension](https://img.shields.io/badge/vscode-extension-green.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=shinima.vscode-temme) [![Example StackOverflow](https://img.shields.io/badge/Example-StackOverflow-2196F3.svg?style=flat-square)](/examples/stackoverflow/readme.md)

# temme

Temme is a concise and convenient selector to extract JSON from HTML documents.

## Links

👉 [documentation](#documentation)

👉 [playground](https://temme.js.org)

👉 [VSCode extension](https://marketplace.visualstudio.com/items?itemName=shinima.vscode-temme)

👉 [BUG report](https://github.com/shinima/temme/issues)

## Examples

```html
<!-- html used below -->
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
</ul>
```

We could the following temme selector to extract _an array of fruit color and name_ against the above html. （[Online Version](https://temme.js.org/?example=basic-array-capture)）

```javascript
import temme from 'temme'

const selector = `li@fruits {
  span[data-color=$color]{$name};
}`
temme(html, selector)
//=>
// {
//   "fruits": [
//     { "color": "red", "name": "apple" },
//     { "color": "white", "name": "pear"  },
//     { "color": "purple", "name": "grape" }
//   ]
// }
```

If you are very familiar with temme, you could start with this [stackoverflow example](/examples/stackoverflow/readme.md). There are some short examples in the online playground. [This example](https://temme.js.org?example=github-commits) extracts commits information from GitHub commits page, including time, author, commit message and links. [This example](https://temme.js.org?example=github-issues) extract issues information from GitHub issues page, including title, assignee and number of comments.

## Documentation

- [01-introduction](/docs/en/01-introduction.md)
- [02-value-capture](/docs/en/02-value-capture.md)
- [03-array-capture](/docs/en/03-array-capture.md)
- [04-multiple-selector](/docs/en/04-multiple-selector.md)
- [05-assignments](/docs/en/05-assignments.md)
- [06-javascript](/docs/en/06-javascript.md)
- [07-filters](/docs/en/07-filters.md)
- [08-modifiers](/docs/en/08-modifiers.md)
- [09-procedures](/docs/en/09-procedures.md)
- [10-snippets](/docs/en/10-snippets.md)

## Upgrade from 0.7 to 0.8

0.8 introduces some breaking changes, mainly for introducing the _modifier_ feature, and replacing _content_ to _procedure_. And, class `CaptureResult` gets a lot of simplification, please see the documentation of [CaptureResult](/docs/zh-cn/08-modifiers.md#类-captureresult).

If you still need the old version documentation, you can find it [here](https://github.com/shinima/temme/blob/v0.7.0/readme.md).

### 1. content/procedure supports only single part

content/procedure does not supports multiple parts any more. You need to write the selector multiple times:

```javascript
const prev = `div{ $text; find('foo', $bar); }`
const current = `
  div{ $text };
  div{ find('foo', $bar) };
`
```

#### 2. special filters are removed

In _procedure_, temme does not provide the special filters. But temme providers some built-in procedure to do the similiar task:

```javascript
const prev = `
  div{ $t|text };
  div{ $h|html };
  div{ $n|node };
  div{ $o|outerHTML };
`
const current = `
  div{ text($t) };
  div{ html($h) };
  div{ node($n) };
  // 暂无 outerHTML procedure
`
```

Note: because `outerHTML` API itself is [kind of special](https://github.com/cheeriojs/cheerio/issues/54), temme does not provide the outerHTML procedure for now. If you need this, please use JavaScript API manually.

### 3. filter nth is removed

Please use filter `get` instead.
