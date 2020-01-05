import React from 'react'

export interface AceEditorProps {
  editorRef: React.MutableRefObject<any>
  style?: React.CSSProperties
  className?: string
}

export default class AceEditor extends React.Component<AceEditorProps, {}> {
  private divRef = React.createRef<HTMLDivElement>()
  private _editor: any

  get editor() {
    return this._editor
  }

  componentDidMount(): void {
    const { editorRef } = this.props

    const div = this.divRef.current
    this._editor = ace.edit(div)
    editorRef.current = this._editor
  }

  render() {
    const { className, style } = this.props
    return <div className={className} style={style} ref={this.divRef} />
  }
}
