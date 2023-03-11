import type { Application } from '../types'
import { AppStatus } from '../types'
import { isPromise } from '../utils/utils'
export function mountApp(app: Application): Promise<any> {
  app.status = AppStatus.BEFORE_MOUNT
  app.container.innerHTML = app.pageBody as string

  let result = app.mount!({
    props: app.props,
    container: app.container,
  })
  if (!isPromise(result))
    result = Promise.resolve(result)

  return result
    .then(() => app.status = AppStatus.MOUNTED)
    .catch((err) => {
      app.status = AppStatus.MOUNT_ERROR
      throw err
    })
}
