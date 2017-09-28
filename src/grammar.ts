export default `{
  const defaultCaptureKey = '@@default-capture@@'
  const ingoreCaptureKey = '@@ignore-capture@@'
}

// 起始规则
Start = s* selectorList:MultipleSelector s* { return selectorList }

MultipleSelector
  = head:Selector s* tail:(',' s* s:Selector { return s })*
  s* ','? // optional extra comma
  {
    return [head].concat(tail)
  }

// 选择器
Selector = SelfSelector / NonSelfSelector

// 自身选择器, 以 & 为开头的选择器
SelfSelector
  = '&' id:Id? classList:Class* attrList:AttrSelector? content:Content? {
    return { self: true, id, classList, attrList, content }
  }

// 非自身选择器, 即不以 & 为开头的选择器
NonSelfSelector
  = css:CssSelector s* nc:NameAndChildren? {
    return {
      self: false,
      css,
      name: nc && nc.name,
      filterList: nc && nc.filterList,
      children: nc && nc.children,
    }
  }

NameAndChildren
  = name:CssSelectorName filterList:Filter* s* children:ParenthesizedChildren {
    return { name, filterList, children }
  }
  / name:CssSelectorName filterList:Filter* s+ singleChild:Selector {
    return { name, filterList, children: singleChild ? [singleChild] : null }
  }
  / name:CssSelectorName filterList:Filter* {
    error('After @-sign there must be valid children selectors. You need to parenthesize the children selectors, or you need a blank after @-sign')
  }

CssSelectorName
  = '@' chars:NormalChar+ { return chars.join('') }
  / '@' { return defaultCaptureKey }

ParenthesizedChildren
  = '('
    s* head:Selector s* tail:(',' s* s:Selector { return s })*
    s* ','? // optimal extra comma
    s* ')' {
    return [head].concat(tail)
  }

Filter
  = '|' chars:NormalChar+ {
    return chars.join('')
  }

// 普通CSS选择器, 包含多个部分
CssSelector
  = head:CssSelectorPart tail:(CssPartSep part:CssSelectorPart { return part })* {
    return [head].concat(tail)
  }

CssPartSep 'css-selector-part-seperator'
  = s+
  / & '>' s*

CssSelectorPart 'css-selector-part'
  // todo 这里可以用 !操作符(也有可能是&操作符) 来简化规则
  = direct:('>' s*)? tag:Tag id:Id? classList:Class*
    attrList:AttrSelector? content:Content? {
    return { direct: Boolean(direct), tag, id, classList: classList.length ? classList : null, attrList, content }
  }
  / direct:('>' s*)? tag:Tag? id:Id classList:Class*
    attrList:AttrSelector? content:Content? {
    return { direct: Boolean(direct), tag, id, classList: classList.length ? classList : null, attrList, content }
  }
  / direct:('>' s*)? tag:Tag? id:Id? classList:Class+
    attrList:AttrSelector? content:Content? {
    return { direct: Boolean(direct), tag, id, classList: classList.length ? classList : null, attrList, content }
  }

Content
  = '{'
    s* single:ValueCapture
    s* ','? // optimal extra comma
    s* '}' {
    return [{ funcName: 'text', args: [single] }]
  }
  / '{'
    s* head:ContentPart tail:(ContentPartSep part:ContentPart { return part })*
    s* ','? // optimal extra comma
    s* '}' {
    return [head].concat(tail)
  }

ContentPart
  = funcName:Name
    s* '('
    s* firstArg:Arg s* restArgs:(',' s* arg:Arg { return arg })*
    s* ','? // optimal extra comma
    s* ')' {
    return { funcName, args: [firstArg].concat(restArgs) }
  }

Arg = String / ValueCapture

ValueCapture
  = '$' chars:NormalChar+ filterList:Filter* {
    return { capture: chars.join(''), filterList }
  }
  / '$' filterList:Filter* {
    return { capture: defaultCaptureKey, filterList }
  }
  / '_' { return { capture: ingoreCaptureKey, filterList: [] } }

AttrSelector 'attribute-selector'
  = '[' s*
    head:AttrPart tail:(AttrPartSep part:AttrPart { return part })*
    s* ','? // optimal extra comma
    s* ']' {
    return [head].concat(tail)
  }

AttrPart 'attribute-selector-part'
  = name:Name '=' value:AttrValue { return { name, value } }
  / name:Name { return { name, value: '' } }

AttrPartSep 'attribute-selector-part-seprator'
  = s* ',' s*
  / s+

ContentPartSep 'content-part-seprator' = AttrPartSep

AttrValue 'attribute-value'
  = ValueCapture
  / chars:NormalChar+ { return chars.join('') }
  / String

String = SingleQuoteString / DoubleQuoteString
SingleQuoteString = "'" chars:StrChar+ "'" { return chars.join('') }
DoubleQuoteString = '"' chars:StrChar+ '"' { return chars.join('') }

Id
  = '#' name:Name { return name }

Class
  = '.' name:Name { return name }

Tag
  = name:Name

Name
  = chars:CssChar+ { return chars.join(''); }

// 可以放在字符串中的字符
StrChar
 = [^'"]i

// 可以作为css名称/tag名称的字符
CssChar
  = [_a-z0-9-]i

// 可以作为普通变量名的字符
NormalChar
  = [_a-z0-9]i

h 'hex-digit'
  = [0-9a-f]i

s 'whitespace'
  = [ \\t\\r\\n\\f]
`
