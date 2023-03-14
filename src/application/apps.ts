import { bootstrapApp } from '../lifecycle/bootstrap'
import { unMountApp } from '../lifecycle/unmount'
import type { Application } from '../types'
import { AppStatus } from '../types'
import { mountApp } from '../lifecycle/mount'
import { appMaps } from '../utils/application'

export async function loadApps() {
  const toUnMountApp = getAppsWithStatus(AppStatus.MOUNTED)
  await Promise.all(toUnMountApp.map(unMountApp))

  const toBootstrapApp = getAppsWithStatus(AppStatus.BEFORE_BOOTSTRAP)
  await Promise.all(toBootstrapApp.map(bootstrapApp))

  const toMountApp = [
    ...getAppsWithStatus(AppStatus.BOOTSTRAPPED),
    ...getAppsWithStatus(AppStatus.UNMOUNTED),
  ]
  await Promise.all(toMountApp.map(mountApp))
}

function getAppsWithStatus(status: AppStatus) {
  const result: Application[] = []
  appMaps.forEach((app) => {
    // to bootstrap or to mount
    if (isActive(app) && app.status === status) {
      switch (app.status) {
        case AppStatus.BEFORE_BOOTSTRAP:
        case AppStatus.BOOTSTRAPPED:
        case AppStatus.UNMOUNTED:
          result.push(app)
          break
      }
    }
    else if (
      app.status === AppStatus.MOUNTED
      && status === AppStatus.MOUNTED
    ) {
      // to unmount
      result.push(app)
    }
  })
  return result
}

function isActive(app: Application) {
  return typeof app.activeRule === 'function' && app.activeRule(window.location)
}
