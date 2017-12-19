[![Example Douban Movie](https://img.shields.io/badge/示例-豆瓣电影-2196F3.svg?style=flat-square)](/examples/douban-movie/readme.md) [![Example StackOverflow](https://img.shields.io/badge/示例-StackOverflow-2196F3.svg?style=flat-square)](/examples/stackoverflow/readme.md)

# temme

temme 是一个类 jQuery 的选择器，用于优雅地从 HTML 文档中提取所需的 JSON 数据。[打开在线版本以进行尝试](https://temme.js.org)

# 安装

`npm install temme` 或是 `yarn add temme`

# 命令行 API

```bash
# 全局安装temme
yarn global add temme

# 最基本的使用方式
temme <selector> <html>

# 从标准输入得到html；--format参数用于格式化输出
temme <selector> --format

# 使用文件中的选择器
temme <path-to-a-selector-file>

# 和curl命令配合使用
curl -s <url> | temme <selector>
```

# Node API

```typescript
// es-module
import temme from 'temme'
// or use require
// const temme = require('temme').default

const html = '<div color="red">hello world</div>'
const selector = 'div[color=$c]{$t}'
temme(html, selector)
// => { c: 'red', t: 'hello world' }
```

# 例子

完整的例子可以在 [*examples*](/examples) 文件夹中查看。如果对 temme 还不熟悉，那么可以从 [豆瓣电影的例子](/examples/douban-movie/readme.md) 或 [这个 StackOverflow 的例子](/examples/stackoverflow/readme.md) 开始。

在线版本中也包含了一些其他较短的例子。比如[这个例子][example-douban-movie-summary]从豆瓣电影页面中抓取了电影的基本信息和评分信息。[这个例子][example-tmall-reviews]从天猫的商品详情页面中抓取了评论列表，包括用户的基本信息，初次评价和追加评价, 以及晒的照片的链接.

# 灵感

从名字上也可以看出来，Temme 是 [Emmet](https://emmet.io/) 的「逆」。Emmet 根据一个模板（模板的语法和 CSS 选择器类似）生成 HTML 文档/片段。用一个函数来表达 emmet，大概是这样的：

```JavaScript
emmet('div[class=red]{text content}')
// => <div class="red">text content</div>

// 拓展一下emmet函数, 使其接受第二个参数 `data`
emmet('div[class=$cls]{$content}', { cls: 'red', content: 'text content' })
// => <div class="red">text content</div>
```

而 temme 是 emmet 的「逆」。temme 用函数表示出来是这样的：

```JavaScript
temme('<div class="red">text content</div>', 'div[class=$cls]{$content}')
// => { cls: 'red', content: 'text content' }
```

`emmet` 与 `temme` 的比较：
* `emmet(selector, data) -> html`
* `temme(html, selector) -> data`

给定一个选择器,  `emmet` 会使用数据将该选择器展开为 HTML 片段，而 `temme` 根据该选择器从 HTML 文档/片段中抓取想要的数据。

# 一些概念：匹配 & 捕获 & Temme-Selector

从 HTML 文档中选取 JSON 数据之前，我们需要回答两个问题：

1. 如何找到存放了数据的结点？
2. 找到结点之后，应该提取结点的哪个特性？提取的数据应该放在结果的什么字段？

第一个问题的答案简单：我们使用 CSS 选择器。CSS 选择器被广泛使用在前端开发中：Web 标准中 CSS 选择器用于指定 CSS 规则所应用的元素；JQuery/cheerio 使用 CSS 选择器来选择文档中的元素/结点；puppeteer 中很多函数都接受一个 CSS 选择器作为参数。同样的，temme 也使用 CSS 选择器。

不过 CSS 选择器只包含了 *匹配* 信息，只能回答第一个问题。为了回答第二个问题，我们需要去拓展 CSS 选择器的语法，使得新的语法（叫做 temme-selector）可以包含 *捕获* 信息。捕获信息一般包含了「哪些数据需要被提取，并存放到结果的哪个字段」；这里的数据可以是结点特性的值，或是结点的文本 / HTML。选择器 `'div[class=$cls]'` 将特性 `class` 捕获到结果的 `.cls` 字段；选择器 `'p{$content}'` 将结点的文本内容捕获到结果的 `.content` 字段。

拓展的语法部分参考了我以前用过的一些工具。Temme 支持 JavaScript 风格的注释，JavaScript 字面量（string/number/null/boolean/RegExp），赋值语句，父结点引用（参考了[stylus](http://stylus-lang.com/docs/selectors.html#parent-reference)），特性/内容捕获（受 Emmet 的启发），以及过滤器（参考了 [Django](https://docs.djangoproject.com/en/dev/ref/templates/language/#filters) 以及一些其他模板语法）。本文档的下方列出了这些语法的规则和对应的运行时行为。

# 语法及其运行时行为

## 值捕获 `$`

#### 语法
* `[foo=$xxx]`  放在特性匹配部分，来捕获该特性的值；
* `{$xxx}`  放在内容部分来捕获元素的 HTML 或文本内容；
* `[foo=$]` / `{$}`  省略 xxx，以进行「默认值捕获」。

值捕获是捕获的基本方式。把值捕获放在特性部分（也就是方括号内）用于捕获特性的值；也可以放在内容部分（花括号内）用于捕获节点的 HTML 或文本。

#### 运行时行为

CSS 选择器中，特性匹配的语法是这样的：`[foo=bar]`；而特性捕获的语法是这样的：`[foo=$bar]`。该捕获语法的含义：将特性 `foo` 的值放到结果的 `.bar` 字段中。内容捕获 `{$buzz}` 表示：将节点的文本内容放到结果的 `.buzz` 字段中。

`temme()` 的输出是一个对象, 叫做捕获结果。捕获结果在特定的字段中包含了捕获的元素。我们可以使用一个 `$` 符号来进行默认值捕获, 此时捕获结果将会为单个值。

#### 例子

```JavaScript
temme('<div class="red">text content</div>', 'div[class=$cls]{$content};')
//=> { cls: 'red', content: 'text content' }

temme('<div class="red">text content</div>', 'div[class=$]')
//=> 'red'
```

## 数组捕获 `@`

#### 语法

* `div.foo@xxx { /* children-selectors */ }`  将 `@xxx { /* ... */ }` 放在一个普通的 CSS 选择器之后
* `div.foo@ { /* children-selector */ }` 省略 xxx 以进行及「默认数组捕获」

数组捕获是另外一种形式的捕获, 用于将相似的数据捕获到一个数组中。我们将 `@xxx { /* ... */ }` 放到一个普通的 CSS 选择器（称为父选择器）之后，其中 `@` 符号是数组捕获的标志符，花括号是必需的。我们在花括号中定义若干个子选择器，用于捕获数组中的内容。

#### 运行时行为

对于每一个满足父选择器的结点（称为父结点），在该结点下依次执行子选择器。每一个父结点都会产生一个捕获结果，这些结果将会放在一个数组中，作为本次数组捕获的结果。而数组则会存放在上层结果的 `.xxx` 字段。

和「默认值捕获」一样，我们可以省略 xxx 只保留一个 `@` 符号来进行 「默认数组捕获」，此时数组捕获得到的数组会直接成为上层结果。

#### 例子

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

// 默认数组捕获
temme(html, 'li@ { span[data-color=$color]{$name}; }')
//=>
// [
//   { "color": "red", "name": "apple" },
//   { "color": "white", "name": "pear"  },
//   { "color": "purple", "name": "grape" }
// ]
```

## 嵌套的数组捕获

数组捕获可以嵌套使用，将一个数组捕获放在另外一个数组捕获中就可以完成嵌套数组的捕获。[在这个 StackOverflow 的例子中][example-so-question-detail]，一个问题有多个回答，每个回答有多个评论。我们使用嵌套的数组捕获可以捕获一个评论的二维数组。

## 父结点引用 `&`

`&` 用于捕获父结点的数据。该语法和 sass, less 以及 stylus 中的父结点引用的含义一样。当数据存放在父结点中时，我们使用该语法来捕获父结点中的数据。

#### 例子

```JavaScript
// html和前面的数组捕获中的一样
temme(html, 'li@ { &[data-fruit-id=$fid]; }')
//=> [ { "fid": "1" }, { "fid": "2" }, { "fid": "3" } ]
```

## 多个选择器 

Temme 支持同时使用多个选择器。注意每一个选择器都需要用分号进行结尾。如果选择器是以闭花括号结尾的，那么该分号是可选的。

#### 例子

```JavaScript
// html和前面的数组捕获中的一样
temme(html, ` [data-color=red]{$name};
              [data-fruit-id="3"] [data-color=$color]; `)
//=> { "name": "apple", "color": "purple" }
```

## 赋值

#### 语法

* `$foo = bar;`  foo是一个合法 JavaScript 标识符；bar 是一个 JavaScript 字面量；目前 temme 支持的字面量包括 string, number, null, boolean, RegExp。

#### 运行时行为

赋值的含义取决于该语法结构所在的上下文：

* 在顶层中，`$foo = 'bar';` 表示将字符串 bar 放到最终结果的 foo 字段
* 在 content 中，`div.foo{ $a = null }` 像是一个条件赋值，如果有一个元素满足选择器 `div.foo`，那么就执行该赋值操作；
* 在数组匹配的子选择器中，`li@list { $x = 123 }` 意味着数组匹配结果中每个数组元素的 x 字段的值都为数字 `123`。

#### 例子

```JavaScript
// html和前面的数组捕获中的一样
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

## JavaScript风格的注释

Temme支持单行注释 `// ......` 与块状注释 `/* ...... */`。

## 过滤器 `|`

#### 语法
* `$foo|xxx` / `@bar|xxx`  放在值捕获或是数组捕获的右边；xxx是过滤函数的名字；
* `$foo|xxx(arg1, arg2, ...)`  过滤器可以接受若干个参数；每一个参数都是一个JavaScript字面量；
* `$foo|f1(a,b)|f2` 过滤器可以进行串联。

#### 运行时的行为

每当一个值被捕获时，该值的类型总是字符串。一个过滤器是一个简单的函数，接受一个输入（也就是捕获的值，会放在 `this` 中）与若干参数，然后返回一个输出。我们可以使用过滤器来处理捕获的值。

* `li.good{$x|foo}`  每当`x`被捕获的时候，它就会像这样被处理 `x = foo.apply(x)`
* `div.bad{$x|foo(1, false)}`  每当x被捕获的时候，它就会像这样被处理 `x = foo.apply(x, [1, false])`
* `div.hello{$x|foo|bar(0, 20)}` 被捕获的值首先被 foo 处理，然后会被 bar 处理。整个过程相当于 `x = foo.apply(x); x = bar.apply(x, [0, 20]);`

#### 内建的过滤器

Temme 提供了一些内建的过滤器。这些过滤器分为下面三个部分：

1. Structure Manipulation Filters：该部分包括 `pack`，`flatten`，`compact`，`first`, `last`，`nth`，`get`。这些过滤器简单又实用，看 [源代码](/src/filters.ts) 以了解细节。
2. Type Coercion Filters：该部分包括 `String`，`Number`，`Date`，`Boolean`。这些过滤器用于将输入转换为指定的类型。
3. Prototype Filters：我们可以使用来自原型链的方法（这也是为什么输入放在 `this` 的原因）。举个例子，如果我们可以保证 x 每次被捕获的时候其类型总是字符串, 那么我们可以安全地使用 `$x|substring(0, 20)` 或是 `$x|toUpperCase`。

#### 数组过滤器语法 `||`

使用数组过滤器语法 `||`，temme 将认为捕获的值是一个数组，然后对数组中每个元素应用该过滤器。

```JavaScript
temme('<div>1 22 333 4444</div>', `div{ $|split(' ')||Number }`)
// => [1, 22, 333, 4444]
```

## 使用自定义的过滤器

temme 允许用多种方式来定义自定义的过滤器。

#### 全局过滤器定义

使用 `defineFilter` 来添加全局过滤器。

```JavaScript
import { defineFilter } from 'temme'

// 定义全局过滤器
defineFilter('myFilter', function myFilter(arg1, arg2) { /* ... */ })
```

#### 将过滤器以参数的形式提供给 temme()

`temme()` 函数的第三个参数用于指定额外的过滤器。

```JavaScript
// 额外的过滤器
const extraFilters = {
  secondItem() {
    return this[1]
  },
  // ...
}
temme(html, 'div@arr|secondItem { p{$text} }', extraFilters)
```

#### 内联定义的过滤器

在选择器字符串中直接定义过滤器。过滤器定义语法和 JavaScript 函数定义语法一样，区别在于将关键字 *function* 换成了 *filter*。

```
filter myFilter(arg1, arg2, arg3) {
  /* Filter Logic Here. */
  /* The code here will be executed as in a JavaScript function. */
  /* Note that the curly braces must be balanced here. */
}

// 我们可以这么使用myFilter
div{$txt|myFilter(x, y, z)};
```

## Content

Content，也就是常规选择器后面花括号中的部分。Content 用于抓取结点的文本或是 HTML。Content 由多个 content-part 组成，多个 content-part 之间用分号进行分隔。每一个 content-part 的形式可以为下面的形式之一：

1. 捕获.  会抓取将结点的文本内容或是 HTML 到指定的字段；
2. 赋值.  该形式类似条件赋值，当 temme 找到一个满足常规选择器的结点时，会执行该赋值；
3. 内容函数调用 **(experimental)**  具体见下方。

### Content 中的捕获

`text`，`html`，`outerHTML` 和 `node` 在 content 中是特殊的过滤器。在 content 中进行捕获时，这四个特殊过滤器中一定会有一个作为捕获的第一个过滤器。如果没有显式的指定，那么 `text` 就会被使用。

* `text` 用于获取结点的文本信息；
* `html` 用于获取结点的 innerHTML；
* `outerHTML` 用于获取结点的 outerHTML；
* `node` 用于获取结点本身，当 temme 无法满足数据处理的需求时，我们可以用 `node` 过滤器来获取对应的 cheerio 结点，然后手动调用 cheerio 的 API。

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

### 内容函数 (experimental)

调用一个内容函数，参数依次为：将捕获结果对象，结点，以及圆括号中的参数。内容函数可以同时进行匹配和捕获，详情请看[源代码](/src/contentFunctions.ts)。

目前，内置的内容函数只有 `find`。`find` 会尝试去捕获一个结点文本的字串。`find`的用法如下：

* `find($x, 'world') `会尝试去抓取 `'world'` **之前**的字串。例如结点的文本是 `'hello world'`，那么结果将会是`{ x: 'hello' }`；
* `find('hello', $x) `会尝试去抓取 `'hello'` **之后**的字串；
* `find('hello', $x, 'world')` 会尝试去抓取 `'hello'` 和 `'world'` 之间的字串。

`find` 使用 `String#indexOf` 来搜索子串。如果 `find` 找不到应当在之前/之后出现的子串，那么`find` 会将捕获结果设置为 *failed*。

例子：

```JavaScript
const html = '<a href="https://github.com/shinima/temme">Star Me on GitHub</a>'
temme(html, `a { find('Star Me on ', $website) }`)
//=> { "website": "GitHub" }

temme(html, `a { find('Fork Me on ', $website) }`)
//=> null
```

### 使用自定义的内容函数 (experimental)

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

## 片段 (experimental)

片段用于复用选择器。当父选择器不同而子选择器非常类似的时候，片段可用于消除重复。

#### 语法

* `@xxx = { /* selectors */ };`  定义一个新的片段，片段的名称为 xxx。xxx 必须是一个合法的 JavaScript 标识符；
* `@xxx;`  展开名称为 xxx 的片段。

片段定义只能放在顶层。而片段的展开可以放在顶层或是子选择器中。片段可以嵌套：A 使用 B，B 使用 C ( A -> B -> C )；但片段不能循环展开。

#### 运行时的行为

片段的运行时行为非常简单： 当 temme 遇到片段展开的时候，temme 将会用片段的内容替换 `@xxx;`。

#### 例子

注意：这个例子是我编造出来的, 无法运行在真实的 StackOverflow。一个 StackOverflow 的问题，由用户A提问，然后可以被用户B修改。现在我们需要选取两位用户的信息，选择器如下：

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

上面的选择器有部分是重复的。我们可以使用片段来去除重复：

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
[example-douban-movie-summary]: https://temme.js.org?example=douban-movie-summary-Chinese
[example-tmall-reviews]: https://temme.js.org?example=tmall-reviews-Chinese
