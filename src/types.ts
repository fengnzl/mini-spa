export interface AnyObject {
  [key: string]: any
}

export enum AppStatus {
  BEFORE_BOOTSTRAP = 'BEFORE_BOOTSTRAP',
  BOOTSTRAPED = 'BOOTSTRAPED',
  BEFORE_MOUNT = 'BEFORE_MOUNT',
  MOUNTED = 'MOUNTED',
  BEFORE_UNMOUNT = 'BEFORE_UNMOUNT',
  UNMOUNTED = 'UNMOUNTED',
  BOOTSTRAP_ERROR = 'BOOTSTRAP_ERROR',
  MOUNT_ERROR = 'MOUNT_ERROR',
  UNMOUNT_ERROR = 'UNMOUNT_ERROR',
}

export interface Application {
  name: string
  acitveRule: Function | string
  props: AnyObject | Function
  /**
   * loadApp 必须返回一个 Promise, resolve 之后得到一个对象
   * bootstrap: () => Promise<any>
   * mount: (props: AnyObject) => Promise<any>
   * unmount: (props: AnyProject) => Promise<any>
   */
  loadApp: () => Promise<any>
}
