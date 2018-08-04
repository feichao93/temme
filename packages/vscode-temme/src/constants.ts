import { DocumentFilter } from 'vscode'

export const TEMME_MODE: DocumentFilter = { language: 'temme', scheme: 'file' }
export const TAGGED_LINK_PATTERN = /(<.*>)\s*(.+)$/
