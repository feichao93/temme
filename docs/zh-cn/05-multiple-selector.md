## 多个选择器

Temme 支持同时使用多个选择器。注意每一个选择器都需要用分号进行结尾。如果选择器是以闭花括号结尾的，那么该分号是可选的。

#### 例子

```JavaScript
// html和前面的数组捕获中的一样
temme(html, ` [data-color=red]{$name};
              [data-fruit-id="3"] [data-color=$color]; `)
//=> { "name": "apple", "color": "purple" }
```
