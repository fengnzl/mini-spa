import type { Application } from '../types'
import { AppStatus } from '../types'
import { isPromise } from '../utils/utils'
import { triggerAppHook } from '../utils/application'
export function unMountApp(app: Application) {
  triggerAppHook(app, 'beforeUnmount', AppStatus.BEFORE_UNMOUNT)

  let result = app.unmount!(app.props!)
  if (!isPromise(result))
    result = Promise.resolve(result)

  return result
    .then(() => {
      app.sandBox?.stop()
      triggerAppHook(app, 'unMounted', AppStatus.UNMOUNTED)
    })
    .catch((err) => {
      app.status = AppStatus.UNMOUNT_ERROR
      throw err
    })
}
