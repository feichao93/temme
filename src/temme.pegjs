{
  const defaultCaptureKey = '@@default-capture@@'
}

Start = s* selector:Selector s* { return selector }

Selector = SelfSelector / NonSelfSelector

SelfSelector
  = '&' attrList:AttrSelector? content:Content? {
    return { self: true, attrList, content }
  }

NonSelfSelector
  = css:CssSelector name:CssSelectorName? s* children:Children? {
    return { self: false, css, name, children }
  }

CssSelectorName
  = '@' chars:NormalChar+ { return chars.join('') }
  / '@' { return defaultCaptureKey }

Children
  = '('
  s* head:Selector s* tail:(',' s* s:Selector { return s })*
  s* ','? // optimal extra comma
  s* ')' {
    return [head].concat(tail)
  }

CssSelector
  = head:Part tail:(CssPartSep part:Part { return part })* {
    return [head].concat(tail)
  }

CssPartSep 'css-selector-part-seperator'
  = s+
  / & '>' s*

Part 'css-selector-part'
  = direct:('>' s* { return '>' })? tag:Tag id:Id? classList:Class*
    attrList:AttrSelector? content:Content? {
    return { direct: Boolean(direct), tag, id, classList: classList.length ? classList : null, attrList, content }
  }
  / direct:('>' s* { return '>' })? tag:Tag? id:Id classList:Class*
    attrList:AttrSelector? content:Content? {
    return { direct: Boolean(direct), tag, id, classList: classList.length ? classList : null, attrList, content }
  }
  / direct:('>' s* { return '>' })? tag:Tag? id:Id? classList:Class+
    attrList:AttrSelector? content:Content? {
    return { direct: Boolean(direct), tag, id, classList: classList.length ? classList : null, attrList, content }
  }

Content
  = '{' s* capture:ValueCapture s* '}' { 
    return capture
  }

ValueCapture
  = '$' chars:NormalChar+ { return { capture: chars.join('') } }
  / '$' { return { capture: defaultCaptureKey } }

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

AttrValue 'attribute-value'
  = ValueCapture
  / chars:NormalChar+ { return chars.join('') }
  / "'" chars:StrChar+ "'" { return chars.join('') }
  / '"' chars:StrChar+ '"' { return chars.join('') }

Id
  = '#' name:Name { return name }

Class
  = '.' name:Name { return name }

Tag
  = name:Name

Name
  = chars:CssChar+ { return chars.join(''); }

StrChar // 可以放在字符串中的字符
 = [-_0-9a-z ]i

CssChar // 可以作为css名称/tag名称的字符
  = [_a-z0-9-]i

NormalChar // 可以作为普通变量名的字符
  = [_a-z0-9]i

h 'hex-digit'
  = [0-9a-f]i

s 'whitespace'
  = [ \t\r\n\f]
