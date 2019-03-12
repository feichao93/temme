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
