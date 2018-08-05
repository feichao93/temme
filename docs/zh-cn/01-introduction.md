# temme

temme 是一个类 jQuery 的选择器，用于优雅地从 HTML 文档中提取所需的 JSON 数据。打开[在线版本](https://temme.js.org)以进行尝试。如果你使用的是 VSCode 编辑器，欢迎安装 [vscode-temme 插件](https://marketplace.visualstudio.com/items?itemName=shinima.vscode-temme)。

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

# 灵感

从名字上也可以看出来，Temme 是 [Emmet](https://emmet.io/) 的「逆」。Emmet 根据一个模板（模板的语法和 CSS 选择器类似）生成 HTML 文档/片段。用一个函数来表达 emmet，大概是这样的：

```javascript
emmet('div[class=red]{text content}')
// => <div class="red">text content</div>

// 拓展一下emmet函数, 使其接受第二个参数 `data`
emmet('div[class=$cls]{$content}', { cls: 'red', content: 'text content' })
// => <div class="red">text content</div>
```

而 temme 是 emmet 的「逆」。temme 用函数表示出来是这样的：

```javascript
temme('<div class="red">text content</div>', 'div[class=$cls]{$content}')
// => { cls: 'red', content: 'text content' }
```

`emmet` 与 `temme` 的比较：

- `emmet(selector, data) -> html`
- `temme(html, selector) -> data`

给定一个选择器, `emmet` 会使用数据将该选择器展开为 HTML 片段，而 `temme` 根据该选择器从 HTML 文档/片段中抓取想要的数据。

# 一些概念：匹配 & 捕获 & Temme-Selector

从 HTML 文档中选取 JSON 数据之前，我们需要回答两个问题：

1. 如何找到存放了数据的结点？
2. 找到结点之后，应该提取结点的哪个特性？提取的数据应该放在结果的什么字段？

第一个问题的答案简单：我们使用 CSS 选择器。CSS 选择器被广泛使用在前端开发中：Web 标准中 CSS 选择器用于指定 CSS 规则所应用的元素；JQuery/cheerio 使用 CSS 选择器来选择文档中的元素/结点；puppeteer 中很多函数都接受一个 CSS 选择器作为参数。同样的，temme 也使用 CSS 选择器。

不过 CSS 选择器只包含了 _匹配_ 信息，只能回答第一个问题。为了回答第二个问题，我们需要去拓展 CSS 选择器的语法，使得新的语法（叫做 temme-selector）可以包含 _捕获_ 信息。捕获信息一般包含了「哪些数据需要被提取，并存放到结果的哪个字段」；这里的数据可以是结点特性的值，或是结点的文本 / HTML。选择器 `'div[class=$cls]'` 将特性 `class` 捕获到结果的 `.cls` 字段；选择器 `'p{$content}'` 将结点的文本内容捕获到结果的 `.content` 字段。

拓展的语法部分参考了我以前用过的一些工具。Temme 支持 JavaScript 风格的注释，JavaScript 字面量（string/number/null/boolean/RegExp），赋值语句，父结点引用（参考了[stylus](http://stylus-lang.com/docs/selectors.html#parent-reference)），特性/内容捕获（受 Emmet 的启发），以及过滤器（参考了 [Django](https://docs.djangoproject.com/en/dev/ref/templates/language/#filters) 以及一些其他模板语法）。本文档的下方列出了这些语法的规则和对应的运行时行为。
