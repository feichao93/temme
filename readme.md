[![Build Status](https://img.shields.io/travis/shinima/temme/master.svg?style=flat-square)](https://travis-ci.org/shinima/temme) [![Coverage Status](https://img.shields.io/coveralls/shinima/temme/master.svg?style=flat-square)](https://coveralls.io/github/shinima/temme?branch=master) [![NPM Package](https://img.shields.io/npm/v/temme.svg?style=flat-square)](https://www.npmjs.org/package/temme) ![Node Version Requirement](https://img.shields.io/badge/node-%3E=6-f37c43.svg?style=flat-square) [![VSCode Extension](https://img.shields.io/badge/vscode-插件-green.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=shinima.vscode-temme) [![Example Fangwen](https://img.shields.io/badge/例子-芳文社-2196F3.svg?style=flat-square)](https://zhuanlan.zhihu.com/p/36036616) [![Example Douban Movie](https://img.shields.io/badge/例子-豆瓣电影-2196F3.svg?style=flat-square)](/examples/douban-movie/readme.md)

<a href="readme-en.md">English Version</a>

# temme

temme 是一个类 jQuery 的选择器，用于简洁优雅地从 HTML 文档中提取所需的 JSON 数据。

## 相关链接

👉[中文文档](#文档链接)

👉[在线版本](https://temme.js.org)

👉[VSCode 插件](https://marketplace.visualstudio.com/items?itemName=shinima.vscode-temme)

👉[反馈 / 疑问](https://github.com/shinima/temme/issues)

👉[升级指南](#升级指南从-07-升级到-08)

## 例子

```html
<!-- 下面用到的 html 的内容 -->
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

对于上面的 html，我们可以使用下面的 temme 选择器来提取「水果颜色和名称的列表」。（[在线版本链接](https://temme.js.org/?example=basic-array-capture)）

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

如果你对 temme 还不熟悉，那么可以从 [豆瓣电影的例子](/examples/douban-movie/readme.md) 开始。在线版本中也包含了一些其他较短的例子。比如[这个例子](https://temme.js.org?example=douban-movie-summary-Chinese)从豆瓣电影页面中抓取了电影的基本信息和评分信息。[这个例子](https://temme.js.org?example=tmall-reviews-Chinese)从天猫的商品详情页面中抓取了评论列表，包括用户的基本信息，初次评价和追加评价, 以及晒的照片的链接.

## 文档链接

- [01-introduction](/docs/zh-cn/01-introduction.md)
- [02-value-capture](/docs/zh-cn/02-value-capture.md)
- [03-array-capture](/docs/zh-cn/03-array-capture.md)
- [04-multiple-selector](/docs/zh-cn/04-multiple-selector.md)
- [05-assignments](/docs/zh-cn/05-assignments.md)
- [06-javascript](/docs/zh-cn/06-javascript.md)
- [07-filters](/docs/zh-cn/07-filters.md)
- [08-modifiers](/docs/zh-cn/08-modifiers.md)
- [09-procedures](/docs/zh-cn/09-procedures.md)
- [10-snippets](/docs/zh-cn/10-snippets.md)

## 升级指南：从 0.7 升级到 0.8

0.8 版本的更新较大，主要是引入了 modifier 特性，同时原来的 content 机制改为 procedure 机制。同时，类 CaptureResult 也得到了大幅简化，详见 [CaptureResult](/docs/zh-cn/08-modifiers.md#类-captureresult) 文档。

如果你仍需要老版本的文档，[可以在这里可以找到](https://github.com/shinima/temme/blob/v0.7.0/readme-zh.md)。

#### 1. content/procedure 仅支持单个 part

content/procedure 不再支持多个 part，想要使用多个 part，需要写成多个选择器的形式：

```javascript
const prev = `div{ $text; find('foo', $bar); }`
const current = `
  div{ $text };
  div{ find('foo', $bar) };
`
```

#### 2. 特殊 filters 被移除

procedure 中不再提供「特殊 filters」，但提供了对应的内置 procedure。你需要将「特殊 filters」换成对应的 procedures：

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

注意：因为 outerHTML 这个 API [本身就有些奇怪](https://github.com/cheeriojs/cheerio/issues/54)，所以 temme 中暂时没有提供 outerHTML procedure。如果需要 outerHTML 的话，请使用 JavaScript API 进行获取。

#### 3. filter nth 被移除

请使用 filter `get`
