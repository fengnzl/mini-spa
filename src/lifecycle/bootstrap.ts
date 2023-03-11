import type { AnyObject, Application } from '../types'
import { AppStatus } from '../types'
import { isObject, isPromise } from '../utils/utils'
import { parseHTMLAndLoadSources } from '../utils/parseHTMLAndLoadSources'
declare const window: any

export async function bootstrapApp(app: Application): Promise<any> {
  // eslint-disable-next-line no-useless-catch
  try {
    await parseHTMLAndLoadSources(app)
  }
  catch (error) {
    throw error
  }

  const { bootstrap, mount, unmount } = await getLifeCycleFuncs(app.name)

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

async function getLifeCycleFuncs(name: string) {
  const result = window[`mini-single-spa-${name}`]
  if (typeof result === 'function')
    return result()

  if (isObject(result))
    return result

  throw new Error(
     `The micro app must inject the lifecycle("bootstrap" "mount" "unmount") into window['mini-single-spa-${name}']`,
  )
}
