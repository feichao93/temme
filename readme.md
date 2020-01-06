[![Build Status](https://img.shields.io/travis/shinima/temme/master.svg?style=flat-square)](https://travis-ci.org/shinima/temme) [![Coverage Status](https://img.shields.io/coveralls/shinima/temme/master.svg?style=flat-square)](https://coveralls.io/github/shinima/temme?branch=master) [![NPM Package](https://img.shields.io/npm/v/temme.svg?style=flat-square)](https://www.npmjs.org/package/temme) ![Node Version Requirement](https://img.shields.io/badge/node-%3E=6-f37c43.svg?style=flat-square) [![VSCode Extension](https://img.shields.io/badge/vscode-插件-green.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=shinima.vscode-temme) [![Example Fangwen](https://img.shields.io/badge/例子-芳文社-2196F3.svg?style=flat-square)](https://zhuanlan.zhihu.com/p/36036616) [![Example Douban Movie](https://img.shields.io/badge/例子-豆瓣电影-2196F3.svg?style=flat-square)](/examples/douban-movie/readme.md)

<a href="readme-en.md">English Version</a>

# temme

temme 是一个类 jQuery 的选择器，用于简洁优雅地从 HTML 文档中提取所需的 JSON 数据。

- [中文文档](/docs/zh-cn/)
- [在线版本](https://temme.js.org)
- [VSCode 插件](https://marketplace.visualstudio.com/items?itemName=shinima.vscode-temme)
- [反馈 / 疑问](https://github.com/shinima/temme/issues)
- [升级指南](/docs/zh-cn/upgrade-guide-0.7-to-0.8.md)

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
