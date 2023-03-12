import type { SandBox } from './sandbox/SandBox'
export interface AnyObject {
  [key: string]: any
}

export type MicroWindow = Window & any

export type SnapshotMap = Map<string | symbol, any>

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
  // app 访问入口 URL 链接
  pageEntry: string
  // app 挂载的 dom
  container: HTMLElement
  // app 入口 html 的 body 内容
  pageBody?: string
  // 子应用已经加载的远程资源 用于去重
  appLoadedURLs?: string[]
  // app 的 js 沙箱运行时
  sandBox?: SandBox | null
  /**
   * app 所有的非全局 style，当 app 加载时需要添加到页面中
   */
  styles?: string[] | HTMLStyleElement[]
  /**
   * app 页面入口上的非全局 script，只会执行一次
   */
  scripts?: string[]
  /**
   * app 是否是第一次加载
   */
  isFirstLoaded?: boolean
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
  // 子应用 app 生命周期钩子， 加载入口页面资源触发，只会触发一次
  beforeBootstrap?: () => void
  // app 生命周期钩子，页面入口的资源被加载并执行后触发，只会触发一次
  bootstrapped?: () => void
  // app 生命周期钩子，挂载前触发，每次挂载都会触发一次
  beforeMount?: () => void
  // app 生命周期钩子，挂载后触发，每次挂载都会触发一次
  mounted?: () => void
  // app 生命周期钩子，卸载前触发，每次卸载都会触发一次
  beforeUnmount?: () => void
  // app 生命周期钩子，卸载后触发，每次卸载都会触发一次
  unMounted?: () => void
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
