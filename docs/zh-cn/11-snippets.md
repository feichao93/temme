## 片段

片段用于复用选择器。当父选择器不同而子选择器非常类似的时候，片段可用于消除重复。

#### 语法

- `@xxx = { /* selectors */ };` 定义一个新的片段，片段的名称为 xxx。xxx 必须是一个合法的 JavaScript 标识符；
- `@xxx;` 展开名称为 xxx 的片段。

片段定义只能放在顶层。而片段的展开可以放在顶层或是子选择器中。片段可以嵌套：A 使用 B，B 使用 C ( A -> B -> C )；但片段不能循环展开。

#### 运行时的行为

片段的运行时行为非常简单： 当 temme 遇到片段展开的时候，temme 将会用片段的内容替换 `@xxx;`。

#### 例子

注意：这个例子是我编造出来的, 无法运行在真实的 StackOverflow。一个 StackOverflow 的问题，由用户 A 提问，然后可以被用户 B 修改。现在我们需要选取两位用户的信息，选择器如下：

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
