import type { AnyObject, Application } from '../types'
import { AppStatus } from '../types'
import { isObject, isPromise } from '../utils/utils'
import { parseHTMLAndLoadSources } from '../utils/parseHTMLAndLoadSources'

export async function bootstrapApp(app: Application): Promise<any> {
  await parseHTMLAndLoadSources(app)
  const { bootstrap, mount, unmount } = app

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

async function getProps(
  props: Function | AnyObject | undefined,
): Promise<Function | AnyObject> {
  if (typeof props === 'function')
    return props()
  if (isObject(props))
    return props as AnyObject
  return {}
}

function validateLifeCycleFunc(name: string, fn: any) {
  if (typeof fn !== 'function')
    throw new Error(`The ${name} must be a function`)
}
