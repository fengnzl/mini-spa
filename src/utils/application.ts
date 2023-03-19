import type { AppStatus, Application } from '../types'
import { isFunction, nextTick } from './utils'

export const appMaps = new Map<string, Application>()

let currentAppName: null | string = null

export function getCurrentAppName() {
  return currentAppName
}

export function setCurrentAppName(name: string | null) {
  currentAppName = name
}

export function getCurrentApp() {
  return currentAppName && appMaps.get(currentAppName)
}

export function getApp(name: string) {
  return appMaps.get(name)
}

export function temporarySetCurrentAppName(name: string | null) {
  if (currentAppName !== name) {
    currentAppName = name
    nextTick(() => (currentAppName = null))
  }
}

export function triggerAppHook<K extends keyof Application>(
  app: Application,
  hook: K,
  status: AppStatus
) {
  app.status = status
  if (isFunction(app[hook])) (app[hook] as Function)()
}

export function isSandboxEnabled(app: Application) {
  return app.sandboxConfig.enabled
}
