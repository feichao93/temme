export interface Dict<V> {
  [key: string]: V
}

export type Literal = string | number | boolean | null | RegExp

export interface Capture {
  name: string
  filterList: Filter[]
  // 当用户没有提供 modifier 时，解析结果中该字段为 null
  modifier: Modifier
}

export interface Filter {
  isArrayFilter: boolean
  name: string
  args: Literal[]
}

export interface Modifier {
  name: string
  args: Literal[]
}

export type TemmeSelector =
  | ParentRefSelector
  | NormalSelector
  | Assignment
  | SnippetDefine
  | SnippetExpand
  | FilterDefine
  | ModifierDefine
  | ProcedureDefine

export type ExpandedTemmeSelector =
  | ParentRefSelector
  | NormalSelector
  | Assignment
  | SnippetDefine
  | FilterDefine
  | ModifierDefine
  | ProcedureDefine

export interface NormalSelector {
  type: 'normal-selector'
  sections: Section[]
  // 当用户没有提供 procedure 时，该字段为 null
  procedure: Procedure
  // 当用户没有提供 arrayCapture 时，该字段为 null
  arrayCapture: Capture
  children: TemmeSelector[]
}

export interface ParentRefSelector {
  type: 'parent-ref-selector'
  section: Section
  // 当用户没有提供 procedure 时，该字段为 null
  procedure: Procedure
}

export interface Procedure {
  name: string
  args: (Literal | Capture)[]
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

export interface FilterDefine {
  type: 'filter-define'
  name: string
  argsPart: string
  code: string
}

export interface ModifierDefine {
  type: 'modifier-define'
  name: string
  argsPart: string
  code: string
}

export interface ProcedureDefine {
  type: 'procedure-define'
  name: string
  argsPart: string
  code: string
}

export interface Section {
  combinator: Combinator
  element: string
  qualifiers: Qualifier[]
}

export type Combinator = ' ' | '>' | '+' | '~'

export type Qualifier = IdQualifier | ClassQualifier | AttributeQualifier | PseudoQualifier

export interface IdQualifier {
  type: 'id-qualifier'
  id: string
}

export interface ClassQualifier {
  type: 'class-qualifier'
  className: string
}

export type AttributeOperator = '=' | '~=' | '|=' | '*=' | '^=' | '$='

export interface AttributeQualifier {
  type: 'attribute-qualifier'
  attribute: string
  operator: AttributeOperator
  value: string | Capture
}

export interface PseudoQualifier {
  type: 'pseudo-qualifier'
  name: string
  content: string
}
