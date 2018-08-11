## Procedures

procedure，也就是常规选择器后面花括号中的部分。当某一个结点满足匹配规则时，procedure 将会执行。其实在前面的文档中，我们已经用到了 procedure：文本捕获和条件赋值是两种特殊的 procedure 形式。

### 语法

1. `div{ proc(arg1, arg2) }`：当某一个结点满足匹配规则 `div` 时，`proc` 将被执行；参数可以为 temme 支持的 JavaScript 字面量或是值捕获；
2. `div{ $text }`：等价于 `div{ text($text) }`
3. `div{ $foo = bar }`：等价于 `div{ assign($foo, bar) }`

### 文本捕获

因为文本捕获经常被使用，所以 temme 将默认的 procedure 设置为了文本捕获。当我们在花括号内只提供一个值捕获时，默认将执行 `text` procedure，即 `div{ $foo }` 与 `div{ text($foo) }` 是等价的。

### 条件赋值

条件赋值是 `assign` procedure 的缩写形式，即 `div{ $foo = bar }` 等价于 `div{ assign($foo, bar) }`。

### 默认的 procedure

temme 提供了若干默认 procedure，用来完成常见的数据抓取需求。除了上述的 `text` 和 `assign` 以外，temme 还提供了以下 procedure：

- `div{ html($foo) }`：用于获取结点的 innerHTML；
- `div{ node($bar) }` 用于获取结点本身，当 temme 无法满足数据处理的需求时，我们可以用 `node` 过滤器来获取对应的 cheerio 结点，然后手动调用 cheerio 的 API；
- `div{ find(arg1, ...) }`：用于在节点的文本中寻找满足特定条件的子串，详细用法见下方。

### 例子：

```html
<!-- 下面用到的 html 的内容 -->
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

### procedure find

procedure find 用于捕获满足条件的结点文本子串。find 接受两个或三个参数，每个参数为一个字符串或一个值捕获结构。具体用法如下：

- `find($x, 'world')` 会尝试去抓取 `'world'` **之前**的子串。例如结点的文本是 `'hello world'`，那么结果将会是 `{ x: 'hello' }`；
- `find('hello', $x)`会尝试去抓取 `'hello'` **之后**的子串；
- `find('hello', $x, 'world')` 会尝试去抓取 `'hello'` 和 `'world'` 之间的字串。

find 使用 `String#indexOf` 来搜索需要匹配的字符串，当有多个结果满足匹配条件时，find 总是选择第一种结果（即 find 搜索子串的行为与 `String#indexOf` 的搜索行为一致）。如果 find 找不到需要匹配的字符串，那么 find 的结果为空。

**find 例子：**

```html
<a href="https://github.com/shinima/temme">Star Me on GitHub</a>
```

```JavaScript
temme(html, `a { find('Star Me on ', $website) }`)
//=> { "website": "GitHub" }

temme(html, `a { find('Fork Me on ', $website) }`)
//=> null
// 找不到字符串 'Fork Me on '，所以结果为空
```

## 使用自定义的 procedure

和过滤器类似，temme 允许多种方式来自定义 procedure。当自定义 procedure 被调用时，参数依次为：捕获结果对象，满足 CSS 选择器的结点，以及选择器中 procedure 的参数。捕获结果对象的相关 API 见下方。

procedure 是一个强大且复杂的机制。不过在大部分场景中，我们都是不需要使用该机制的。temme 支持伪类选择器（由 [css-select](https://github.com/fb55/css-select#supported-selectors) 实现）。尤其是 `:contains`，`:not` 和 `:has` 这三个伪类选择器，大大提升了选择器的能力。在使用自定义的 procedure 之前，先尝试一下伪类选择器是否满足需求。

在实现自定义的 procedure 时，可以参考[内置 procedure 的实现方式](/packages/temme/src/procedures.ts)。

### 定义全局 procedure

```JavaScript
import { defineProcedure } from 'temme'

defineProcedure('myProcedure', function myProcedure(result, node, ...args) {
  /* ... */
})
```

### 将 procedure 以参数的形式提供给 temme()

`temme()` 函数的**第五个**参数用于指定额外的 procedure。

```JavaScript
const extraProcedures = {
  mark(result, node, arg) {
    result.add(arg, { mark: true, text: node.text() })
  },
  // ...
}
temme(html, 'div{ mark($foo) }', null, null, extraProcedures)
```

### 内联定义的 procedure

在选择器字符串中直接定义 procedure。procedure 定义语法和 JavaScript 函数定义语法一样，区别在于将关键字 _function_ 换成了 _procedure_。

```javascript
procedure mark(result, node, arg) {
  /* 在这里书写 procedure 的逻辑，这里的代码将会以 JavaScript 函数的形式被执行 */
  /* 注意因为语法解析器的限制，这里的花括号必须是平衡的 */
}

// 像下面这样使用 mark
div{ mark($foo) };
```
