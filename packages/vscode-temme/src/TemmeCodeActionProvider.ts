import {
  CancellationToken,
  CodeActionContext,
  CodeActionProvider,
  Command,
  Range,
  TextDocument,
  window,
} from 'vscode'
import { TAGGED_LINK_PATTERN } from './constants'

export default class TemmeCodeActionProvider implements CodeActionProvider {
  async provideCodeActions(
    document: TextDocument,
    range: Range,
    context: CodeActionContext,
    token: CancellationToken,
  ) {
    const editor = window.activeTextEditor
    if (editor == null) {
      return null
    }
    if (editor.document.languageId !== 'temme') {
      return null
    }
    const currentLineText = document.lineAt(editor.selection.start.line).text
    const match = currentLineText.match(TAGGED_LINK_PATTERN)
    if (match != null) {
      const tag = match[1]
      const link = match[2].trim()
      return [
        {
          title: `Temme: run ${tag}`,
          command: 'temme.runSelector',
          arguments: [link],
        } as Command,
        {
          title: `Temme: watch ${tag}`,
          command: 'temme.startWatch',
          arguments: [link],
        },
      ]
    } else {
      return null
    }
  }
}
