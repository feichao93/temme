# Temme

Temme是一个类jQuery的选择器, 用于从HTML文档中提取所需的JSON数据. 如果你在用Node写爬虫, 并使用[cheerio](https://github.com/cheeriojs/cheerio)来处理HTML文档, 那么Temme很可能很有用. Temme在CSS选择器语法的基础上加入了额外的语法, 用于从HTML文档中抓取结构化的JSON数据. 在[playground](https://temme.js.org)中进行尝试.

# 安装

`npm install temme` or `yarn add temme`

# 用法

```typescript
// es-module
import temme from 'temme'
// or use require
// const temme = require('temme').default

const html = '<div color="red">hello world</div>'
const temmeSelector = 'div[color=$c]{$t}'
temme(html, temmeSelector)
// => { c: 'red', t: 'hello world' }
```

# 例子

英文例子: [This example][example-github-commits] extracts commits information from GitHub commits page, including time, author, commit message and links. [This example][example-github-issues] extract issues information from GitHub issues page, including title, assignee and number of comments.

[这个例子][example-douban-short-reviews]从豆瓣短评网页中抓取了页面中的信息, 主要包括电影的基本信息和短评列表. [这个例子][example-tmall-reviews]从天猫的商品详情页面中抓取了评论列表, 包括用户的基本信息(匿名), 初次评价和追加评价, 以及晒的照片的链接.

# 灵感

从名字上就可以看出来, Temme是[Emmet](https://emmet.io/)反着写而来的. Emmet根据一个模板(模板的语法和CSS选择器较为接近)生成HTML文档/片段. 用一个函数来表达emmet, 大概是这样的:

```JavaScript
emmet('div[class=red]{text content}')
// => <div class="red">text content</div>

// 拓展一下emmet函数, 使其接受第二个参数 `data`
emmet('div[class=$cls]{$content}', { cls: 'red', content: 'text content' })
// => <div class="red">text content</div>
```

从命名上也能看出, temme是emmet的"逆过程". temme用函数表示出来是这样的:

```JavaScript
temme('<div class="red">text content</div>', 'div[class=$cls]{$content}')
// => { cls: 'red', content: 'text content' }
```

`emmet`与`temme`的比较:
* `emmet(selector, data) -> html`
* `temme(html, selector) -> data`

给定一个选择器, `emmet`会使用数据将该选择器展开为HTML片段, 而`temme`根据该选择器从HTML文档/片段中抓取想要的数据.

# 概念

## 匹配

给定一个根节点(DOM节点或是cheerio结点)和一个选择器, 找到那些满足该选择器的子节点. 一般来说, 我们用`querySelectorAll(selector)`或是`jQuery(selector)`来选择想要的节点元素. CSS选择器仅包含了"匹配"信息.

## 捕获

给定一个节点和一个temme-selector, 并返回一个包含指定数据的对象. 数据可以指HTML标签的特性值, 或是标签的文本内容等. temme-selector指定了返回结果中哪个字段存放哪个数据.

## 匹配与捕获

Temme定义了一个新的语法, 叫做temme-selector. Temme-selector同时包含了匹配信息和捕获信息. 匹配部分和CSS选择器一模一样; 捕获部分的语法请看下方.

# 捕获语法及其语义

**在[playground tutorial][playground-tutorial]照着例子学习一下语法!**

## 值捕获 `$`

语法:
* `$xxx`:  以美元符作为起始字符; xxx是一个合法的JavaScript标识符.
* `[foo=$xxx]`:  放在特性匹配部分, 来捕获该特性的值.
* `{$xxx}`:  放在内容部分来捕获元素的HTML或文本内容..
* `[foo=$]` / `{$}`:  省略xxx, 以进行"默认值捕获".

值捕获是捕获的基本方式. 你可以把值捕获放在特性部分(也就是方括号内)用于捕获特性的值; 也可以放在内容部分(花括号内)用于捕获节点的HTML或文本. [example][example-value-capture]

CSS选择器中, 特性匹配的语法是这样的: `[foo=bar]`; 而特性捕获的语法是这样的: `[foo=$bar]`. 该捕获语法的含义: 将特性`foo`的值放到结果的`.bar`字段中. 在emmet中, `div{foo}`会被展开为 `<div>foo</div>`; 在temme中, 内容捕获`{$buzz}`表示: 将节点的文本内容放到结果的'.buzz'字段中.

`temme()`的输出是一个对象, 叫做捕获结果. 捕获结果在特定的字段中包含了捕获的元素. 我们可以使用一个单独的美元符号来进行默认值捕获, 此时捕获结果将会为单个值. [example][example-default-value-capture]

## 数组捕获 `@`

语法:
* `@xxx`:  以一个at符号作为起始字符; xxx为一个合法的JavaScript标识符.
* `div.foo@xxx { /* children-selectors */ }`:  只能放在一个普通的CSS选择器之后. at符号和花括号都是必需的
* `div.foo@ { /* children-selector */ }`: 省略xxx以进行及默认数组捕获

数组捕获是另外一种形式的捕获, 可以将相似的数据捕获到一个数组中. 我们将`@xxx`放到正常CSS选择器(父选择器)之后, 在花括号中定义若干个子选择器.

这意味着:
1. 数组捕获的结果是一个数组(下称结果数组)
2. 对于每一个匹配父选择器的结点(父结点), 依次执行子选择器; 每个父结点都会产生一个捕获结果
3. 结果数组存放了父结点的捕获结果, 而该结果数组本身则会成为上层结果的`.xxx`字段

[example][example-array-capture]

和值捕获一样, 我们也可以省略xxx以进行默认数组捕获 [example][example-default-array-capture]

## 嵌套的数组捕获

可以嵌套进行数组捕获. 将一个数组捕获放在另外一个数组捕获中就可以了. [basic example][example-nested-array-capture]

[在这个StackOverflow的例子中][example-so-all-answers-and-all-comments], 一个问题有多个回答, 而每个回答有多个评论. 我们使用嵌套的数组捕获可以捕获一个数组的数组的评论.

## 父结点引用 `&`

`&`用于捕获父结点的数据. 该语法和sass, less以及stylus中的父结点引用的含义一样. 当数据存放在父结点中时, 该语法还是挺有用的. [example][example-parent-reference]

## 多个选择器

Temme支持在顶层放置多个选择器(就和在子选择器中一样). 每一个选择器都需要用分号进行结尾. 如果选择器是以闭花括号结尾的, 那么该分号是可选的. [example][example-multiple-selectors-at-top-level]

## 赋值

语法:
* `$foo = bar;`:  `foo`是一个合法JavaScript标识符; `bar`是一个JavaScript字面量(string/number/null/boolean/RegExp).

赋值语法可以出现三个地方:
1. 顶层: `$foo = 'bar';` 将字符串`'bar'`放到最终结果的`.bar`字段 [example][example-assignments-at-top-level]
2. 在content中, `div.foo{ $a = null }`像是条件赋值, 如果有一个元素满足选择器`div.foo`, 那么就执行该赋值操作; [example][example-assignments-in-content]
3. 在子选择器中, `li@list { $x = 123 }` `list`中的每个对象的`.x`字段的值都为数字`123`. [example][example-assignments-in-children-selectors]

## JavaScript风格的注释

Temme支持单行注释`// ......`与块状注释`/* ...... */`.

## 过滤器 `|`

### 语法:
* `$foo|xxx` / `@bar|xxx`:  放在值捕获或是数组捕获的右边; `xxx`是过滤函数的名字.
* `$foo|xxx(arg1, arg2, ...)`:  过滤器可以接受若干个参数; 每一个参数都是一个JavaScript字面量.
* `$foo|f1(a,b)|f2`: 过滤器可以进行串联.

每当一个值被捕获时, 该值的类型总是字符串. 一个过滤器就是一个简单的函数, 接受一个输入(也就是捕获的值, 会放在`this`中)与若干参数, 然后返回一个输出. 我们可以使用过滤器来处理捕获的值. [example][example-filters]

### 运行时的行为

* `li.good{$x|foo}`:  每当`x`被捕获的时候, 它就会像这样被处理: `x = foo.apply(x)`;
* `div.bad{$x|foo(1, false)}`:  每当`x`被捕获的时候, 它就会像这样被处理: `x = foo.apply(x, [1, false])`;
* `div.hello{$x|foo|bar(0, 20)}`: 被捕获的值首先被`foo`处理, 然后会被`bar`处理. 整个过程相当于: `x = foo.apply(x); x = bar.apply(x, [0, 20]);`.

### 内建的过滤器

Temme提供了一些内建的过滤器. 这些过滤器分为下面三个部分:
1. Structure Manipulation Filters: 该部分包括`pack`, `flatten`, `compact`, `first`, `last`, `nth`. 这些过滤器简单又实用, 看[源代码](/src/filters.ts)以了解更多.
2. Type Coercion Filters: 该部分包括`String`, `Number`, `Date`, `Boolean`. 这些过滤器用于将输入转换为指定的类型.
3. Prototype Filters: 我们可以使用来自原型链的方法(这也是为什么输入放在`this`的原因). 举个例子, 如果我们可以保证`x`每次被捕获的时候其类型总是字符串, 那么我们可以安全地使用`$x|substring(0, 20)` 或是 `$x|toUpperCase`.

### 使用自定义的过滤器

使用`defineFilter`来添加全局过滤器. 也可以在调用`temme`函数时提供第三个参数: 一个自定义的过滤器字典(JavaScript对象).

```JavaScript
import { defineFilter } from 'temme'

// 定义全局过滤器
defineFilter('myFilter', function myFilter(arg1, arg2) { /* ... */ })

// 额外的过滤器
const extraFilters = {
  secondItem() {
    return this[1]
  },
  // ...
}
temme(html, 'div@arr|secondItem { p{$text} }', extraFilters)
```

### 内联定义的过滤器

也可以在选择器字符串中直接定义过滤器. 过滤器定义语法和JavaScript函数定义语法一样, 唯一的区别在于将关键字*function*换成了*filter*.

```
filter inlineFilter(arg1, arg2, arg3) {
  /* Filter Logic Here. */
  /* The code here will be executed as in a JavaScript function. */
  /* Note that the curly braces must be balanced here. */
}
```

### 数组过滤器语法 `||`

使用数组过滤器语法`||`, temme将会认为捕获的值是一个数组, 然后对数组中每个元素应用该过滤器.

```JavaScript
temme('<div>1 22 333 4444</div>', `div{ $|split(' ')||Number }`)
// => [1, 22, 333, 4444]
```

## Content TODO

The selectors in the curly brackets after normal CSS selector are called content. Content is used to capture text or html of a node. Content consists of several content-parts, seperated by semicolons. Each content-part can be in one of the following forms:  [example][example-content]
1. Capture.  This will capture text/html of the node into the specified field;
2. Assignment.  It is like a conditional assignment, if temme find that a node safisties the normal CSS selector, then the assignment is executed;
3. Content Function Call **(experimental)**. See below for more detail.

### Capture in Content
`text`, `html` and `node` are special filters in content. One of the three is always used as the first filter in content capture. If not specified explicitly, `text` will be used. `text` gets the text content of the mathcing nodes; `html` gets the  inner HTML of the matching nodes; `node` gets the node itself, which is useful when temme-selector does not meet the requirements and we need to do manual capturing with cheerio APIs. [example][example-special-filters-in-content]

### Content Functions (experimental)

Call a content function, passing the capture-result object, the node and the arguments in the parentheses. Content function can do both matching and capturing. See [source](/src/contentFunctions.ts) for more implementation detail. [example][example-content-functions]

Currently, there is only one built-in content function `find`. `find` try to capture a substring of the node text. Examples of `find`:

* `find($x, 'world')` will try to capture the text **before** `'world'`. If the text of node is `'hello world'`, then the result will be `{ x: 'hello' }`
* `find('hello', $x)` will try to capture the text **after** `'hello'`.
* `find('hello', $x, 'world')` will try to capture the text **between** `'hello'` and `'world'`.

`find` simply uses `String#indexOf` to get the index of a substring. If `find` cannot find the substring that should appear before/after the target substring, then it will set the capture-result as *failed*.

### Use Customized Content Functions (experimental)

```JavaScript
import { contentFunctions } from 'temme'

// Get a content function
contentFunctions.get('find')
// Set a customized content function
contentFunctions.set('myContentFn', myContentFn)
// Remove a content function
contentFunctions.remove('uselessContentFn')

function myContentFn(result, node, capture1, string2) {
  /* Your customized logic here */

  // Call CaptureResult#add to add a field of result
  result.add(capture1.name, node.attr('foo'), capture1.filterList)

  // Call CaptureResult#setFailed to set the result to failed state
  result.setFailed()
}
```

Content function is a more powerful way than normal css selector. But in most scenarios, we do not need customized content functions. Temme supports pseudo-selector powered by [css-select](https://github.com/fb55/css-select#supported-selectors). Especially, `:contains`, `:not` and `:has` are useful pseudo-selectors which enhance the select ability a lot. Before using customized content functions, try to test whether pseudo-selectors can satisfy the requirements.

## Snippets (experimental)

Snippet is a way of reusing sub-selectors in a temme-selector. It is useful when the parent-selectors vary but children selectors alike.

### Syntax

* `@xxx = { /* selectors */ };`  Define a snippet named xxx. xxx should be a valid JavaScript identifier.
* `@xxx;`  Expand the snippet named xxx. It is like that we insert the content of snippet xxx in place.

Snippet-define is allowed at top level only. Snippet-expand can be place at top level or in children selectors. Snippets can be nested: `@snippetA -> @snippetB -> @snippetC` (snippetA uses snippetB, snippetB uses snippetC); But snippets should not be circled: `@snippetA -> @snippetB -> @snippetA`.

The running semantics of snippet is simple: when temme encounters a snippet-expand, temme will replace the `@xxx` with its content.

(Note: This example is made up and the selector does not work with the real StackOverflow html) For example, a stackoverflow question asked by *person-A* may be edited by *person-B*. Without snippets, our temme-selector is: 

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
.ask-info@asked|pack { @personInfo };
.edit-info@edited|pack { @personInfo };
```

[playground-tutorial]: https://temme.js.org?example=tutorial-start
[example-value-capture]: https://temme.js.org?example=tutorial-value-capture
[example-default-value-capture]: https://temme.js.org?example=tutorial-default-value-capture
[example-array-capture]: https://temme.js.org?example=tutorial-array-capture
[example-default-array-capture]: https://temme.js.org?example=tutorial-default-array-capture
[example-parent-reference]: https://temme.js.org?example=tutorial-parent-reference
[example-nested-array-capture]: https://temme.js.org?example=tutorial-nested-array-capture
[example-multiple-selectors-at-top-level]: https://temme.js.org?example=tutorial-multiple-selectors-at-top-level
[example-assignments-at-top-level]: https://temme.js.org?example=tutorial-assignments-at-top-level
[example-assignments-in-content]: https://temme.js.org?example=tutorial-assignments-in-content
[example-assignments-in-children-selectors]: https://temme.js.org?example=tutorial-assignments-in-children-selectors
[example-filters]: https://temme.js.org?example=tutorial-filters
[example-content]: https://temme.js.org?example=tutorial-content
[example-special-filters-in-content]: https://temme.js.org?example=tutorial-special-filters-in-content
[example-content-functions]: https://temme.js.org?example=tutorial-content-functions

[example-so-all-answers-and-all-comments]: https://temme.js.org?example=so-all-answers-and-all-comments
[example-github-commits]: https://temme.js.org?example=github-commits
[example-github-issues]: https://temme.js.org?example=github-issues
[example-douban-short-reviews]: https://temme.js.org?example=douban-short-reviews-Chinese
[example-tmall-reviews]: https://temme.js.org?example=tmall-reviews-Chinese
