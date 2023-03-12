import type { Application, MicroWindow, SnapshotMap } from '../types'
import { originalWindow } from '../utils/originalEnv'
import { hasOwnProperty, isFunction } from '../utils/utils'
/**
 * js 沙箱，用于隔离子应用 window 作用域
 */
export class SandBox {
  // 子应用 window 的代理对象
  public proxyWindow: MicroWindow = {}
  // 子应用的 window 对象
  public microAppWindow: MicroWindow = {}
  // 子应用名称
  private appName = ''
  // 子应用是否激活
  private active = false
  // 子应用向 window 注入的 key
  private injectedKeySet = new Set<string | symbol>()
  // 记录子应用第一次 mount() 前的 window 快照
  private windowSnapshot = new Map<string | symbol, SnapshotMap>()

  constructor(app: Application) {
    this.initWindowSnapshot()
    this.appName = app.name
    this.proxyWindow = this.createProxyWindow()
  }

  /**
   * 启动子应用
   */
  start() {
    if (this.active)
      return
    this.active = true
  }

  /**
   * 停止子应用
   */
  stop() {
    if (!this.active)
      return
    this.active = false
    this.injectedKeySet.forEach((key) => {
      Reflect.deleteProperty(this.microAppWindow, key)
    })
    this.injectedKeySet.clear()
  }

  /**
   * 初始化子应用快照
   */
  initWindowSnapshot() {
    this.windowSnapshot.set('attrs', new Map())
  }

  /**
   * 记录子应用快照
   */
  recordWindowSnapshot() {
    const { windowSnapshot, microAppWindow } = this
    const recordAttrs = windowSnapshot.get('attrs')
    this.injectedKeySet.forEach((key) => {
      recordAttrs?.set(key, microAppWindow[key])
    })
  }

  /**
   * 还原子应用快照
   */
  restoreWindowSnapshot() {
    const { windowSnapshot, microAppWindow } = this
    const recordAttrs = windowSnapshot.get('attrs')
    recordAttrs?.forEach((value, key) => {
      this.injectedKeySet.add(key)
      microAppWindow[key] = value
    })
  }

  createProxyWindow() {
    return new Proxy(this.microAppWindow, {
      get(target, key) {
        // 如果是代理对象的属性
        if (Reflect.has(target, key))
          return Reflect.get(target, key)

        // 获取原始 window 上的属性
        const result = originalWindow[key]
        // window 上的原始方法必须绑定在 window 上运行
        return (isFunction(result) && needToBindOriginalWindow(result))
          ? result.bind(originalWindow)
          : result
      },
      set: (target, key, value) => {
        if (!this.active)
          return true
        // 记录添加的变量
        this.injectedKeySet.add(key)
        return Reflect.set(target, key, value)
      },
      deleteProperty: (target, key) => {
        if (hasOwnProperty(target, key)) {
          this.injectedKeySet.delete(key)
          return Reflect.deleteProperty(target, key)
        }
        return true
      },
    })
  }
}
// 除了类，构造函数活着使用 call()、bind()、apply() 之外的都需绑定在window上
function needToBindOriginalWindow(fn: Function) {
  if (fn.toString().startsWith('class')
    || (/^[A-Z][\w]+$/.test(fn.name) && fn.prototype.constructor === fn)
    || isBoundFunction(fn)
  )
    return false

  return true
}

export function isBoundFunction(fn: Function) {
  return fn.name.startsWith('bound ')
}
