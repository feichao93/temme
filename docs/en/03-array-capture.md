## Array-capture `@`

Array-capture is another form of capture. It is useful when we want to capture an array of similar items. We need place `@xxx { /* ... */ }` after a normal CSS selector (called parent-selector). `@` is the mark of an array-capture. A pair of curly brackets is required after @xxx; Children selectors are put within the curly brackets.

### Syntax

- `div.foo@xxx { /* children-selectors */ }` Place `@xxx { /* ... */ }` after a normal CSS selector
- `div.foo@ { /* children-selectors */ }` Omit xxx and make a default-array-capture.

Note that in array-capture, `@`-sign and a pair of curly brace always appear at the same time. If only curly brace appears, then this pair of curly brace refers to a text-capture.

### Running Semantics

For every node (called parent-node) that matches parent-selector, execute the children selectors one-by-one; every parent-node corresponds to a sub-result. These sub-results are gathered into an array. The array is the result of this array-capture. And the array will be the `.xxx` field of the upper-level result.

Like default-value-capture, we could just use a single at-sign to make a default array-capture, and the array will be the result of upper-level result.

### Examples

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

```JavaScript
// array-capture
temme(html, 'li@fruits { span[data-color=$color]{$name}; }')
//=>
// {
//   "fruits": [
//     { "color": "red", "name": "apple" },
//     { "color": "white", "name": "pear"  },
//     { "color": "purple", "name": "grape" }
//   ]
// }

// default-array-capture
temme(html, 'li@ { span[data-color=$color]{$name}; }')
//=>
// [
//   { "color": "red", "name": "apple" },
//   { "color": "white", "name": "pear"  },
//   { "color": "purple", "name": "grape" }
// ]
```

## Parent Reference `&`

`&` gives us the ability to capture data in the parent node. It has the same semantic meaning as in sass, less or stylus. Parent-reference is useful in array-capture when the data is stored in the parent node.

### Examples

```JavaScript
// html is the same as in array-capture
temme(html, 'li@ { &[data-fruit-id=$fid]; }')
//=> [ { "fid": "1" }, { "fid": "2" }, { "fid": "3" } ]
```

## Nested Array-Captures

Array-capture can be nested. Just place a array-capture within another array-capture. [In this StackOverflow example][example-so-question-detail], one question has several answers and each answer has several comments. We could use the nested array-captures to capture an array of arrays of comments.
