## Procedures

Procedure is a JavaScript function that will be called against the node that matches our selector. In temme, the procedure part is placed after the normal CSS selector within a pair of curly brace. Actually, in the previous docs, we have met procedures: text-capture and conditional-assignment are two special forms of procedures.

### Syntax

- `div{ proc(arg1, arg2) }` When a node matches the matching rules, `proc` will be executed. Every argument is either a capture (e.g. `$foo`) or a JavaScript literal.
- `div{ $arg }` This is a special form and is equivalent to `div{ text($arg) }`
- `div{ $foo = bar }`: This is a special form and is equivalent to `div{ assign($foo, bar) }`

### Text-Capture

Since text-capture is the most used capture form, temme uses `text` as the default procedure. When we only provide a single value-capture, the default capture `text` will be executed, in another word, `div{ $foo }` and `div{ text($foo) }` are equivalent.

### Conditional-Assignment

Conditional-assignment is the shortcut for `assign` procedure. In other words, `div{ $foo = bar }` is equivalent to `div{ assign($foo, bar) }`.

### Built-in Procedures

Temme provides the following built-in procedures to accommodate common capture requirements. Besides `text` and `assign`, built-in procedures contains:

- `div{ html($foo) }` Capture the inner-HTML of a node
- `div{ node($bar) }` Capture the node itself. When there are some capture requirements that cannot be satisfied with the declarative temme selector, we can get the cheerio node and call its JavaScript API.

Examples:

```html
<!-- html used below -->
<div class="outer"><p>TEXT-1</p> <div class="inner">TEXT-2</div></div>
```

```JavaScript
const selector = `
.outer{ $a };
.outer{ text($b) };
.outer{ html($c) };
.outer{ node($d|attr('class')) };
.outer{ $e|toLowerCase };

div{ $hasDiv = true };
table{ $hasTable = true };
`
temme(html, selector)
//=>
// {
//   "a": "TEXT-1 TEXT-2",
//   "b": "TEXT-1 TEXT-2",
//   "c": "<p>TEXT-1</p> <div class=\"inner\">TEXT-2</div>",
//   "d": "outer",
//   "e": "text-1 text-2",
//   "hasDiv": true
// }
```

### Procedure `find`

Procedure `find` tries to capture a substring of the node text. `find` accepts two or three arguments with each a string or a value-capture. The detailed usage is as follows:

- `find($x, 'world')` will try to capture the text **before** `'world'`. If the text of node is `'hello world'`, then the result will be `{ x: 'hello' }`
- `find('hello', $x)` will try to capture the text **after** `'hello'`.
- `find('hello', $x, 'world')` will try to capture the text **between** `'hello'` and `'world'`.

`find` simply uses `String#indexOf` to get the index of a substring. So when there are more than one matches, `find` will always use the first match. If `find` cannot find a substring matching the argument, then the result of `find` is null.

**Example:**

```html
<a href="https://github.com/shinima/temme">Star Me on GitHub</a>
```

```JavaScript
temme(html, `a { find('Star Me on ', $website) }`)
//=> { "website": "GitHub" }

temme(html, `a { find('Fork Me on ', $website) }`)
//=> null
// cannot find a substring matching 'Fork Me on ', so the result is null
```

### Customized Procedures

Like filters, temme supports several different ways to define customized procedures. When customized procedures get called, the arguments are as follows: the capture result, the node matching the CSS selector, the arguments passed in the selector.

Procedures are supported to be powerful and complex. In most situations, we do not need to used it. Temme supports pseudo-class selector (powered by [css-select](https://github.com/fb55/css-select#supported-selectors)). Especially `:contains`, `:not` and `:has`, pseudo-class selectors improve expression ability greatly. Before using customized procedures, try using these pseudo-class selectors.

Before implementing customized procedures, you can use [procedures.ts](/packages/temme/src/procedures.ts) as a reference.

### Global Procedures Definition

```JavaScript
import { defineProcedure } from 'temme'

defineProcedure('myProcedure', function myProcedure(result, node, ...args) {
  /* ... */
})
```

### Procedures as an argument of temme()

Provide a customized procedure map as the fifth argument of `temme`.

```JavaScript
const extraProcedures = {
  mark(result, node, arg) {
    result.add(arg, { mark: true, text: node.text() })
  },
  // ...
}
temme(html, 'div{ mark($foo) }', null, null, extraProcedures)
```

### Inline Procedures Definition

Define procedures in selector string. Inline procedure definition has the same syntax as JavaScript-style function definition. The difference is that temme uses _procedure_ as the keyword instead of _function_.

```javascript
procedure mark(result, node, arg) {
  /* Procedure logic here */
  /* The code here will be executed as in a JavaScript function */
  /* Note that the curly braces must be balanced here due to the parser limitations */
}

// We can use `mark` like this
div{ mark($foo) };
```
