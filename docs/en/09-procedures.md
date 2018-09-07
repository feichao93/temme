(TODO)

## Procedure

Procedure is a JavaScript function that will be called against the node that matches our selector.

#### Syntax

- `div{ fn(arg1, arg2) }`: `fn` is the procedure name, and `arg1` / `arg2` are extra arguments passed to the procedure function. Every argument is either a capture (e.g. `$foo`) or a JavaScript literal.
- `div{ $arg }`: This is a special form of procedure that means default procedure with a single extra argument. And this is the text-capture that we have seen previously.
- `div{ $arg = value }`: This is a special form of procedure that means assign `value` to `$arg` TODO
- `div{ fn($arg|filter!modifier) }` Filters and modifiers are allowed after the `$arg`.

#### Built-in Procedures

There are some built-in procedures out of the box.

- `text($arg)` gets the text content and save it into `$arg`
- `html($arg)` gets the inner HTML and save it into `$arg`
- `node($arg)` gets the node itself and save it into `$arg`
- `find(...args)` see below
- `assign($capture, literal)` assigns `literal` to `$capture`.

Examples: (TODO check this example)

```JavaScript
const html = '<div class="outer"><div class="inner">test text</div></div>'
const selector = `
div.outer{ $a };
div.outer{ text($b) };
div.outer{ html($c) };
div.outer{ node($d|attr('class')) };
`
temme(html, selector)
//=>
// {
//   "a": "test text",
//   "b": "test text",
//   "c": "<div class=\"inner\">test text</div> ",
//   "d": "outer",
// }
```

#### Procedure `find`

Procedure `find` tries to capture a substring of the node text.

- `find($x, 'world')` will try to capture the text **before** `'world'`. If the text of node is `'hello world'`, then the result will be `{ x: 'hello' }`
- `find('hello', $x)` will try to capture the text **after** `'hello'`.
- `find('hello', $x, 'world')` will try to capture the text **between** `'hello'` and `'world'`.

`find` simply uses `String#indexOf` to get the index of a substring.

Example:

```JavaScript
const html = '<a href="https://github.com/shinima/temme">Star Me on GitHub</a>'
temme(html, `a { find('Star Me on ', $website) }`)
//=> { "website": "GitHub" }

temme(html, `a { find('Fork Me on ', $website) }`)
//=> null
```

#### todo

Call a content function, passing the capture-result object, the node and the arguments in the parentheses. Content function can do both matching and capturing. See [source codes](/src/contentFunctions.ts) for more implementation detail.

### Customized Procedures

Like filters and modifiers, you can also customize procedures using one of the following methods:

1.  Use `defineProcedure` to define a global procedure
2.  Pass customized procedures as an argument of `temme()`
3.  Define inline procedures in selector string

```JavaScript
// method-1
import { defineProcedure } from 'temme'
defineProcedure('myContentFn', myContentFn)

// method-2
temme(selector, filters, modifiers, procedures)

// method-3 TODO

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
