import { AppStatus } from '../types'
import type { Application } from '../types'
import { apps } from './apps'

export function registerApplication(app: Application) {
  if (typeof app.activeRule === 'string') {
    const path = app.activeRule
    app.activeRule = (location = window.location) => location.pathname === path
  }

  app.status = AppStatus.BEFORE_BOOTSTRAP
  apps.push(app)
}
