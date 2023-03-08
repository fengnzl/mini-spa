import type { AnyObject, Application } from '../types'
import { AppStatus } from '../types'
import { isObject, isPromise } from '../utils/utils'

export async function bootstrapApp(app: Application): Promise<any> {
  const { bootstrap, mount, unmount } = await app.loadApp()

  validateLifeCycleFunc('bootstrap', bootstrap)
  validateLifeCycleFunc('mount', mount)
  validateLifeCycleFunc('unmount', unmount)

  app.bootstrap = bootstrap
  app.mount = mount
  app.unmount = unmount

  try {
    app.props = await getProps(app.props)
  }
  catch (err) {
    app.status = AppStatus.BOOTSTRAP_ERROR
    throw err
  }

  let result = app.bootstrap!(app.props)
  if (!isPromise(result))
    result = Promise.resolve(result)

  return result
    .then(() => app.status = AppStatus.BOOTSTRAPPED)
    .catch((err) => {
      app.status = AppStatus.BOOTSTRAP_ERROR
      throw err
    })
}

async function getProps(props: Function | AnyObject) {
  if (typeof props === 'function')
    return props()
  if (isObject(props))
    return props
  return {}
}

function validateLifeCycleFunc(name: string, fn: any) {
  if (typeof fn !== 'function')
    throw new Error(`The ${name} must be a function`)
}
