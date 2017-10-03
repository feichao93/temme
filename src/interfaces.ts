export interface Dict<V> {
  [key: string]: V
}

export type Literal = string | number | boolean | null

export interface Capture {
  name: string
  filterList: Filter[]
}

export interface Filter {
  name: string
  args: Literal[]
}

export type TemmeSelector = SelfSelector | NormalSelector | Assignment

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

export interface Section {
  type: 'section'
  combinator: Combinator
  element: string
  qualifiers: Qualifier[]
  content: ContentPart[]
}

export type Combinator = ' ' | '>' | '+' | '~'

export type Qualifier = IdQualifier | ClassQualifirer | AttributeQualifier | PseudoQualifier

export interface IdQualifier {
  type: 'id-qualifier'
  id: string
}

export interface ClassQualifirer {
  type: 'class-qulifier'
  className: string
}

export type AttributeOperator = '=' | '~=' | '|=' | '*=' | '^=' | '$=' | null

export interface AttributeQualifier {
  type: 'attribute-qualifier'
  attribute: string
  operator: AttributeOperator
  value: string | Capture
}

// TODO currently pseudo qualifier is not supported
export interface PseudoQualifier {
  type: 'pseudo-qualifier'
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
