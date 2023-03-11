import type { Application } from '../types'
import { AppStatus } from '../types'
import { isPromise } from '../utils/utils'
import { triggerAppHook } from '../utils/application'
export function mountApp(app: Application): Promise<any> {
  triggerAppHook(app, 'beforeMount', AppStatus.BEFORE_MOUNT)
  app.container.innerHTML = app.pageBody as string

  let result = app.mount!({
    props: app.props,
    container: app.container,
  })
  if (!isPromise(result))
    result = Promise.resolve(result)

  return result
    .then(() => triggerAppHook(app, 'mounted', AppStatus.MOUNTED))
    .catch((err) => {
      app.status = AppStatus.MOUNT_ERROR
      throw err
    })
}
