import { AppStatus } from '../types'
import type { Application } from '../types'
import { appMaps } from '../utils/application'

export function registerApplication(app: Application) {
  if (typeof app.activeRule === 'string') {
    const path = app.activeRule
    app.activeRule = (location = window.location) => location.pathname === path
  }
  app = {
    ...app,
    isFirstLoaded: true,
    status: AppStatus.BEFORE_BOOTSTRAP,
    pageBody: '',
    scripts: [],
    styles: [],
    appLoadedURLs: [],
  }
  
  if (!app.sandboxConfig) {
    app.sandboxConfig = {
      enabled: true,
      css: false
    }
  }
  appMaps.set(app.name, app)
}
