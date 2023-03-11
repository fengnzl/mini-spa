export interface AnyObject {
  [key: string]: any
}

export enum AppStatus {
  BEFORE_BOOTSTRAP = 'BEFORE_BOOTSTRAP',
  BOOTSTRAPPED = 'BOOTSTRAPPED',
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
  activeRule: Function | string
  props?: AnyObject | Function
  /**
   * loadApp 必须返回一个 Promise, resolve 之后得到一个对象
   * bootstrap: (props: AnyObject) => Promise<any>
   * mount: (props: AnyObject) => Promise<any>
   * unmount: (props: AnyObject) => Promise<any>
   */
  // loadApp: () => Promise<any>
  status?: AppStatus
  unmount?: (props: AnyObject) => Promise<any>
  mount?: (props: AnyObject) => Promise<any>
  bootstrap?: (props: AnyObject) => Promise<any>
  pageEntry: string
  container: HTMLElement
  pageBody?: string
  // 子应用已经加载的远程资源 用于去重
  appLoadedURLs?: string[]
}

/**
 * script css 的全局属性
 */
export interface Source {
  // 是否是全局资源
  isGlobal: boolean
  // 资源的 url
  url?: string
  // 资源的内容 如果 url 有值 则忽略
  value: string | null
  // script 的类型
  type?: string | null
}
