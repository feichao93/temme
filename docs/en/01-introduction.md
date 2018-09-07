# Temme

Temme is a concise and convenient selector to extract JSON from HTML documents. Try temme in the [playground](https://temme.js.org). If you are using VSCode editor, welcome install [the vscode-temme extension](https://marketplace.visualstudio.com/items?itemName=shinima.vscode-temme).

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

// pass extra filters/modifiers/procedures
temme(html, selector, extraFilters, extraModifiers, extraProcedures)
```

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

- `emmet(selector, data) -> html`
- `temme(html, selector) -> data`

Given a selector, `emmet` expand this selector to HTML using data, while `temme` capture data from HTML according to the selector.

# Match and Capture

Before extracting JSON from HTML, we need to answer two questions:

1.  How to find the nodes that contains the data we want?
2.  After finding the nodes, which attributes of the node should be extracted, and which fields should be used to store the extracted data?

The answer to the first question is simple: we use CSS selector. CSS selectors are widely used in various aspects. In web standards, CSS selectors define the elements to which a set of CSS rules apply. JQuery/cheerio uses CSS selectors to select elements/nodes in HTML documents. In temme, we use CSS selectors too.

But CSS selectors only contain _match_ information and they can only answer the first question. To answer the second question, we need to extend the CSS selectors syntax so that the new syntax (called temme-selector) can contain _capture_ information. Capture information is mainly about which items are stored into which fields in result (result is an JavaScript object). Item can be value of attributes, text or html of nodes. Temme-selector `'div[class=$cls]'` captures attribute `class` into `.cls` of the result; Temme-selector `'p{$content}'` captures text content of the p element into field `.content` of the result.

The extended syntax is inspired by several other tools. Temme supports JavaScript-style comments, JavaScript literals (string/number/null/boolean/RegExp), assignments, parent-reference as in [stylus](http://stylus-lang.com/docs/selectors.html#parent-reference), attributes/content capture inspired by Emmet, filters like in [Django](https://docs.djangoproject.com/en/dev/ref/templates/language/#filters) and many other templates. Please refer to other documentations for the grammar and the running semantics of the extended syntax.
