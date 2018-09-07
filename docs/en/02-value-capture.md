## Value-Capture

Value-capture is the most basic and most used capture form. Value-capture can be placed in attribute part (in square brackets) to capture attribute value, or in content part (in curly braces) to capture text/html.

#### Syntax

- `[foo=$xxx]` Place in CSS attribute qualifiers to capture attribute value.
- `{$xxx}` Place in content part to capture html/text.

#### Running semantics

Normal attribute qualifier is in form `[foo=bar]`. Attribute-capture is in form `[foo=$bar]`, which means putting the value of attribute `foo` into `.bar` of the capture result. Content capture `{$buzz}` means capturing text of a node into `.buzz` of the capture result.

#### Examples

```html
<!-- html used below -->
<div class="red">text content</div>
```

```JavaScript
// capture attribute
temme(html, 'div[class=$cls];')
//=> { cls: 'red' }

// capture text
temme(html, 'div{$content};')
//=> { content: 'text content' }

// capture attribute and text at the same time
temme(html, 'div[class=$cls]{$content};')
//=> { cls: 'red', content: 'text content' }
```

## Default-Capture

The output of `temme()` is an object called capture-result. Capture-result contains captured items at specific fields. We can use a single `$` to make a default-value-capture, and the capture result will be a single value.

#### Syntax

- `[foo=$]` / `{$}`: Omit xxx and make a default-value-capture.

### Examples

```javascript
// default-attrbiute-capture
temme(html, 'div[class=$]')
//=> 'red'

// default-text-capture
temme(html, 'div{$content}')
//=> 'text content'
```
