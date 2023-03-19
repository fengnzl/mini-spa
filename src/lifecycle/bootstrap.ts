import type { AnyObject, Application } from '../types'
import { AppStatus } from '../types'
import { isObject, isPromise } from '../utils/utils'
import { executeScripts, parseHTMLAndLoadSources } from '../utils/source'
import { triggerAppHook } from '../utils/application'
import { SandBox } from '../sandbox/SandBox'
import { addStyles } from '../utils/dom'
declare const window: any

export async function bootstrapApp(app: Application): Promise<any> {
  triggerAppHook(app, 'beforeBootstrap', AppStatus.BEFORE_BOOTSTRAP)
  // eslint-disable-next-line no-useless-catch
  try {
    await parseHTMLAndLoadSources(app)
  }
  catch (error) {
    throw error
  }

  app.sandBox = new SandBox(app)
  app.sandBox.start()
  app.container.innerHTML = app.pageBody as string

  // 执行子应用入口页面的 styles 和 scripts 标签
  addStyles(app.styles!)
  executeScripts(app.scripts as string[], app)

  const { bootstrap, mount, unmount } = await getLifeCycleFuncs(app)

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
    .then(() => {
      triggerAppHook(app, 'bootstrapped', AppStatus.BOOTSTRAPPED)
      // 子应用首次加载的脚本执行完就不再需要了
      app.scripts!.length = 0
      // 记录当前的 window 快照，重新挂载子应用时恢复
      app.sandBox?.recordWindowSnapshot()
    })
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

async function getLifeCycleFuncs(app: Application) {
  const result = app.sandBox?.proxyWindow[`mini-single-spa-${app.name}`]
  if (typeof result === 'function')
    return result()

  if (isObject(result))
    return result

  throw new Error(
     `The micro app must inject the lifecycle("bootstrap" "mount" "unmount") into window['mini-single-spa-${name}']`,
  )
}
