import type { Application } from '../types'
import { AppStatus } from '../types'
import { isPromise } from '../utils/utils'
import { triggerAppHook, isSandboxEnabled } from '../utils/application';
import { addStyles } from '../utils/dom';
export function mountApp(app: Application): Promise<any> {
  triggerAppHook(app, 'beforeMount', AppStatus.BEFORE_MOUNT)
  app.container.setAttribute('single-spa-name', app.name)

  if (!app.isFirstLoaded) {
    if (isSandboxEnabled(app)) {
      // 重新加载子应用时恢复快照
      app.sandBox?.restoreWindowSnapshot()
      app.sandBox?.start()
    }
    
    app.container.innerHTML = app.pageBody as string
    addStyles(app.styles as HTMLStyleElement[])
  }
  else {
    app.isFirstLoaded = false
  }
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
