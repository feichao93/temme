## 多个选择器

Temme 支持多个选择器并别使用，注意每一个选择器都需要**用分号进行结尾**。当选择器是以闭花括号结尾时，那么分号是可选的。

### 例子

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

```JavaScript
// 我们可以在选择器顶层书写多个选择器
temme(html, ` [data-color=red]{$name};
              [data-fruit-id="3"] [data-color=$color]; `)
//=> { "name": "apple", "color": "purple" }

// 也可以在数组捕获中的花括号内书写多个选择器
temme(html, `
  li@ {
    span[data-color=$color];
    span{$name};
  }`)
//=>
// [
//   { "color": "red", "name": "apple" },
//   { "color": "white", "name": "pear" },
//   { "color": "purple", "name": "grape" },
// ]
```
