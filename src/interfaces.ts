export interface Dict<V> {
  [key: string]: V
}

export type Literal = string | number | boolean | null | RegExp

export interface Capture {
  name: string
  filterList: Filter[]
}

export interface Filter {
  name: string
  args: Literal[]
}

export type TemmeSelector = SelfSelector
  | NormalSelector
  | Assignment
  | SnippetDefine
  | SnippetExpand

export type ExpandedTemmeSelector = SelfSelector
  | NormalSelector
  | Assignment
  | SnippetDefine

export interface NormalSelector {
  type: 'normal-selector'
  sections: Section[]
  arrayCapture: Capture
  children: TemmeSelector[]
}

export interface SelfSelector {
  type: 'self-selector'
  section: Section
}

export interface Assignment {
  type: 'assignment'
  capture: Capture
  value: Literal
}

export interface SnippetDefine {
  type: 'snippet-define'
  name: string
  selectors: TemmeSelector[]
}

export interface SnippetExpand {
  type: 'snippet-expand'
  name: string
}

export interface Section {
  combinator: Combinator
  element: string
  qualifiers: Qualifier[]
  content: ContentPart[]
}

export type Combinator = ' ' | '>' | '+' | '~'

export type Qualifier = IdQualifier | ClassQualifier | AttributeQualifier | PseudoQualifier

export interface IdQualifier {
  type: 'id-qualifier'
  id: string
}

export interface ClassQualifier {
  type: 'class-qulifier'
  className: string
}

export type AttributeOperator = '=' | '~=' | '|=' | '*=' | '^=' | '$='

export interface AttributeQualifier {
  type: 'attribute-qualifier'
  attribute: string
  operator: AttributeOperator
  value: string | Capture
}

// TODO currently pseudo qualifier is not supported
export interface PseudoQualifier {
  type: 'pseudo-qualifier'
  value: string
}


export type ContentPart = ContentPartCapture | Assignment | ContentPartCall

export interface ContentPartCapture {
  type: 'capture'
  capture: Capture
}

export interface ContentPartCall {
  type: 'call'
  funcName: string
  args: (Literal | Capture)[]
}

// The following line is related to
// https://github.com/s-panferov/awesome-typescript-loader/issues/501
export const DummyValue325353 = '242gascdfe'
