export * from './CaptureResult'
export * from './check'
export * from './constants'
export * from './contentFunctions'
export * from './filters'
export * from './modifiers'
export * from './interfaces'
export * from './temme'
export * from './utils'

import temme from './temme'

declare const TEMME_VERSION: string
export const version = TEMME_VERSION

export default temme
