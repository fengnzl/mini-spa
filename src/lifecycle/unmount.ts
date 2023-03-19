import type { Application } from '../types'
import { AppStatus } from '../types'
import { isPromise } from '../utils/utils'
import { triggerAppHook, isSandboxEnabled } from '../utils/application';
import { removeStyles } from '../utils/dom';
export function unMountApp(app: Application) {
  triggerAppHook(app, 'beforeUnmount', AppStatus.BEFORE_UNMOUNT)

  let result = app.unmount!(app.props!)
  if (!isPromise(result))
    result = Promise.resolve(result)

  return result
    .then(() => {
      if (isSandboxEnabled(app)) {
        app.sandBox?.stop()
      }
      
      app.styles = removeStyles(app.name)
      triggerAppHook(app, 'unMounted', AppStatus.UNMOUNTED)
    })
    .catch((err) => {
      app.status = AppStatus.UNMOUNT_ERROR
      throw err
    })
}
