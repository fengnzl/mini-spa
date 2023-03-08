import { overwriteEventAndHistory } from './navigation/overwriteEventAndHistory'
export { registerApplication } from './application/registerApplication'
export { start } from './start'

declare const window: any

window.__IS_SINGLE_SPA__ = true
overwriteEventAndHistory()
