import type { Application } from '../types'
import { AppStatus } from '../types'
import { isPromise } from '../utils/utils'
export function unMountApp(app: Application) {
  app.status = AppStatus.BEFORE_UNMOUNT

  let result = app.unmount!(app.props)
  if (!isPromise(result))
    result = Promise.resolve(result)

  return result
    .then(() => app.status = AppStatus.UNMOUNTED)
    .catch(() => app.status = AppStatus.UNMOUNT_ERROR)
}
