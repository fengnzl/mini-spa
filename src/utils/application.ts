import type { AppStatus, Application } from '../types'
import { isFunction } from './utils'
export function triggerAppHook<K extends keyof Application>(app: Application, hook: K, status: AppStatus) {
  app.status = status
  if (isFunction(app[hook]))
    (app[hook] as Function)()
}
