## (todo) Procedures

procedure，也就是常规选择器后面花括号中的部分。当某一个结点满足匹配规则时，procedure 将会执行。前面我们用到的文本捕获和花括号内赋值其实只是 procedure 用于抓取结点的文本或是 HTML。

### 语法

1. `div{ proc(arg1, arg2) }`：当某一个结点满足匹配规则 `div` 时，执行 `proc` 这个 procedure，参数可以为 temme 支持的 JavaScript 字面量或是值捕获；
2. `div{ $text }`：等价于 `div{ text($text) }`，即当只提供一个值捕获时，默认执行 `text` procedure；也就是说文本捕获语法是 procedure 的一种缩写形式。
3. `div{ $foo = bar }`：等价于 `div{ assign($foo, bar) }`，即条件赋值语法是 `assign` procedure 的缩写形式。

### Content 中的捕获

`text`，`html`，`outerHTML` 和 `node` 在 content 中是特殊的过滤器。在 content 中进行捕获时，这四个特殊过滤器中一定会有一个作为捕获的第一个过滤器。如果没有显式的指定，那么 `text` 就会被使用。

- `text` 用于获取结点的文本信息；
- `html` 用于获取结点的 innerHTML；
- `outerHTML` 用于获取结点的 outerHTML；
- `node` 用于获取结点本身，当 temme 无法满足数据处理的需求时，我们可以用 `node` 过滤器来获取对应的 cheerio 结点，然后手动调用 cheerio 的 API。

例子：

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

### 内容函数

调用一个内容函数，参数依次为：将捕获结果对象，结点，以及圆括号中的参数。内容函数可以同时进行匹配和捕获，详情请看[源代码](/src/contentFunctions.ts)。

目前，内置的内容函数只有 `find`。`find` 会尝试去捕获一个结点文本的字串。`find`的用法如下：

- `find($x, 'world')`会尝试去抓取 `'world'` **之前**的字串。例如结点的文本是 `'hello world'`，那么结果将会是`{ x: 'hello' }`；
- `find('hello', $x)`会尝试去抓取 `'hello'` **之后**的字串；
- `find('hello', $x, 'world')` 会尝试去抓取 `'hello'` 和 `'world'` 之间的字串。

`find` 使用 `String#indexOf` 来搜索子串。如果 `find` 找不到应当在之前/之后出现的子串，那么`find` 会将捕获结果设置为 _failed_。

例子：

```JavaScript
const html = '<a href="https://github.com/shinima/temme">Star Me on GitHub</a>'
temme(html, `a { find('Star Me on ', $website) }`)
//=> { "website": "GitHub" }

temme(html, `a { find('Fork Me on ', $website) }`)
//=> null
```

### 使用自定义的内容函数

```JavaScript
import { contentFunctions } from 'temme'

// 获取/设置/移除 一个自定义的内容函数
contentFunctions.get('find')
contentFunctions.set('myContentFn', myContentFn)
contentFunctions.remove('uselessContentFn')

function myContentFn(result, node, capture1, string2) {
  /* 在这里实现自定义逻辑 */

  // 调用 CaptureResult#add 来向捕获结果中添加一个字段
  result.add(capture1.name, node.attr('foo'), capture1.filterList)

  // 调用 CaptureResult#setFailed 来将捕获结果设置为 failed
  result.setFailed()
}
// 自定内容函数的用法：div{ myContentFn($x, 'yyy') }
// 当 myContentFn() 被调用的时候, $x 会传递给参数 capture1，'yyy' 会传递给参数 string2
```

内容函数是一个功能强大的机制。不过在大部分场景中，我们都是不需要使用该机制的。temme 支持伪类选择器（由 [css-select](https://github.com/fb55/css-select#supported-selectors) 实现）。尤其是 `:contains`， `:not` 和 `:has` 这三个伪类选择器，大大提升了选择器的能力。在使用自定义的内容函数之前，先尝试一下伪类选择器是否满足需求。
