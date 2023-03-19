import type { Application, MicroWindow, SnapshotMap } from '../types'
import deepCopy from '../utils/deepCopy'
import {
  originalDefineProperty,
  originalEval,
  originalWindow,
  originalWindowAddEventListener,
  originalWindowRemoveEventListener,
} from '../utils/originalEnv'
import { hasOwnProperty, isFunction } from '../utils/utils'
import { getEventTypes } from '../utils/dom'
import {
  originalDocumentAddEventListener,
  originalDocument,
} from '../utils/originalEnv'
import { patchDocument, releaseDocument } from './patchDocument'
import { temporarySetCurrentAppName } from '../utils/application'
import {
  documentEventMap,
  patchDocumentEvents,
  releaseAppDocumentEvents,
  releaseDocumentEvents,
} from './patchDocumentEvents'
/**
 * js 沙箱，用于隔离子应用 window 作用域
 */
export class SandBox {
  // 当前存活的子应用数量
  static activeCount = 0
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
  // 重写相关事件
  // 子应用 setTimeout 集合，卸载子应用时清除
  private timeoutSet = new Set<number>()
  // 子应用 setInterval 集合，卸载子应用时清除
  private intervalSet = new Set<number>()
  // 子应用 requestIdleCallback 集合，卸载子应用时清除
  private idleSet = new Set<number>()
  // 子应用绑定 window 上的事件，退出子应用时清除
  private windowEventMap = new Map<
    string | symbol,
    { listener: any; options: any }[]
  >()
  // 子应用 window onxxx 事件集合，退出子应用时清除
  private onWindowEventMap = new Map<
    string,
    EventListenerOrEventListenerObject
  >()

  constructor(app: Application) {
    this.initWindowSnapshot()
    this.appName = app.name
    this.hijackProperties()
    this.proxyWindow = this.createProxyWindow(app.name)
  }

  /**
   * 启动子应用
   */
  start() {
    if (this.active) return
    this.active = true

    // 如果当前子应用为第一个
    if (SandBox.activeCount++ === 0) {
      patchDocument()
      patchDocumentEvents()
    }
  }

  /**
   * 停止子应用
   */
  stop() {
    if (!this.active) return
    this.active = false

    const {
      injectedKeySet,
      microAppWindow,
      timeoutSet,
      intervalSet,
      idleSet,
      windowEventMap,
      onWindowEventMap,
    } = this

    injectedKeySet.forEach((key) => {
      Reflect.deleteProperty(microAppWindow, key)
    })
    for (const timer of timeoutSet) originalWindow.clearTimeout(timer)

    for (const timer of intervalSet) originalWindow.clearInterval(timer)

    for (const timer of idleSet) originalWindow.cancelIdleCallback(timer)

    for (const [type, arr] of windowEventMap) {
      for (const item of arr) {
        originalWindowRemoveEventListener.call(
          originalWindow,
          type as string,
          item.listener,
          item.options
        )
      }
    }
    getEventTypes().forEach((eventType) => {
      const fn = onWindowEventMap.get(
        eventType
      ) as EventListenerOrEventListenerObject
      fn &&
        originalWindowRemoveEventListener.call(originalWindow, eventType, fn)
    })

    timeoutSet.clear()
    intervalSet.clear()
    idleSet.clear()
    injectedKeySet.clear()
    windowEventMap.clear()
    onWindowEventMap.clear()
    injectedKeySet.clear()

    releaseAppDocumentEvents(this.appName)

    // 所有子应用都已卸载
    if (--SandBox.activeCount === 0) {
      releaseDocument()
      releaseDocumentEvents()
    }
  }

  /**
   * 初始化子应用快照
   */
  initWindowSnapshot() {
    this.windowSnapshot.set('attrs', new Map())
    this.windowSnapshot.set('windowEvents', new Map())
    this.windowSnapshot.set('onWindowEvents', new Map())
    this.windowSnapshot.set('documentEvents', new Map())
  }

  /**
   * 记录子应用快照
   */
  recordWindowSnapshot() {
    const {
      windowSnapshot,
      microAppWindow,
      onWindowEventMap,
      windowEventMap,
      injectedKeySet,
    } = this
    const recordAttrs = windowSnapshot.get('attrs')
    const recordWindowEvents = windowSnapshot.get('windowEvents')
    const recordOnWindowEvents = windowSnapshot.get('onWindowEvents')
    const recordDocumentEvents = windowSnapshot.get('documentEvents')

    injectedKeySet.forEach((key) => {
      recordAttrs?.set(key, deepCopy(microAppWindow[key]))
    })

    windowEventMap.forEach((obj, type) => {
      recordWindowEvents?.set(type, deepCopy(obj))
    })

    onWindowEventMap.forEach((func, type) => {
      recordOnWindowEvents?.set(type, func)
    })

    documentEventMap.get(this.appName)?.forEach((arr: any[], type: string) => {
      recordDocumentEvents?.set(type, deepCopy(arr))
    })
  }

  /**
   * 还原子应用快照
   */
  restoreWindowSnapshot() {
    const {
      windowSnapshot,
      microAppWindow,
      injectedKeySet,
      windowEventMap,
      onWindowEventMap,
    } = this
    const recordAttrs = windowSnapshot.get('attrs')
    const recordWindowEvents = windowSnapshot.get('windowEvents')
    const recordOnWindowEvents = windowSnapshot.get('onWindowEvents')
    const recordDocumentsEvents = windowSnapshot.get('documentsEvents')

    recordAttrs?.forEach((value, key) => {
      injectedKeySet.add(key)
      microAppWindow[key] = deepCopy(value)
    })

    recordWindowEvents?.forEach((arr, type) => {
      windowEventMap.set(type, deepCopy(arr))
      for (const item of arr) {
        originalWindowAddEventListener.call(
          originalWindow,
          type as string,
          item.listener,
          item.options
        )
      }
    })

    recordOnWindowEvents?.forEach((func, type) => {
      onWindowEventMap.set(type as string, func)
      originalWindowAddEventListener.call(originalWindow, type as string, func)
    })

    const curMap = documentEventMap.get(this.appName)
    recordDocumentsEvents?.forEach((arr, type) => {
      curMap?.set(type as string, deepCopy(arr))
      for (const item of arr) {
        originalDocumentAddEventListener.call(
          originalDocument,
          type as string,
          item.listeners,
          item.options
        )
      }
    })
  }

  /**
   * 劫持 window 属性
   */
  hijackProperties() {
    const {
      microAppWindow,
      intervalSet,
      timeoutSet,
      idleSet,
      windowEventMap,
      onWindowEventMap,
    } = this

    microAppWindow.setTimeout = function setTimeout(
      callback: Function,
      timeout?: number | undefined,
      ...args: any[]
    ): number {
      const timer = originalWindow.setTimeout(callback, timeout, ...args)
      timeoutSet.add(timer)
      return timer
    }

    microAppWindow.clearTimeout = function clearTimeout(timer?: number): void {
      if (timer === undefined) return
      originalWindow.clearTimeout(timer)
      timeoutSet.delete(timer)
    }

    microAppWindow.setInterval = function setInterval(
      callback: Function,
      timeout?: number | undefined,
      ...args: any[]
    ): number {
      const timer = originalWindow.setInterval(callback, timeout, ...args)
      intervalSet.add(timer)
      return timer
    }

    microAppWindow.clearInterval = function clearInterval(
      timer?: number
    ): void {
      if (timer === undefined) return
      originalWindow.clearInterval(timer)
      intervalSet.delete(timer)
    }
    microAppWindow.requestIdleCallback = function requestIdleCallback(
      callback: IdleRequestCallback,
      options?: IdleRequestOptions | undefined
    ): number {
      const timer = originalWindow.requestIdleCallback(callback, options)
      idleSet.add(timer)
      return timer
    }
    microAppWindow.cancelIdleCallback = function cancelIdleCallback(
      timer?: number
    ): void {
      if (timer === undefined) return
      originalWindow.cancelIdleCallback(timer)
      idleSet.delete(timer)
    }

    microAppWindow.addEventListener = function addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions | undefined
    ) {
      if (!windowEventMap.get(type)) windowEventMap.set(type, [])

      windowEventMap.get(type)?.push({ listener, options })
      return originalWindowAddEventListener.call(
        originalWindow,
        type,
        listener,
        options
      )
    }

    microAppWindow.removeEventListener = function removeEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions | undefined
    ) {
      const arr = windowEventMap.get(type) || []
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].listener === listener) {
          arr.splice(i, 1)
          break
        }
      }
      return originalWindowRemoveEventListener.call(
        originalWindow,
        type,
        listener,
        options
      )
    }

    microAppWindow.eval = originalEval
    microAppWindow.originalWindow = originalWindow
    microAppWindow.window = microAppWindow
    microAppWindow.document = originalDocument

    // 劫持 window.onxxx 事件
    getEventTypes().forEach((eventType) => {
      originalDefineProperty(microAppWindow, `on${eventType}`, {
        configurable: true,
        enumerable: true,
        get() {
          return onWindowEventMap.get(eventType)
        },
        set(val) {
          onWindowEventMap.set(eventType, val)
          return originalWindowAddEventListener.call(
            originalWindow,
            eventType,
            val
          )
        },
      })
    })
  }

  /**
   * 代理 window 对象
   */
  createProxyWindow(appName: string) {
    const descriptorMap = new Map<string| symbol, 'target' | 'originalWindow'>()
    return new Proxy(this.microAppWindow, {
      get(target, key) {
        // 如果是代理对象的属性
        if (Reflect.has(target, key)) return Reflect.get(target, key)

        // 获取原始 window 上的属性
        const result = originalWindow[key]
        // window 上的原始方法必须绑定在 window 上运行
        return isFunction(result) && needToBindOriginalWindow(result)
          ? result.bind(originalWindow)
          : result
      },
      set: (target, key, value) => {
        if (!this.active) return true
        // 记录添加的变量
        this.injectedKeySet.add(key)
        return Reflect.set(target, key, value)
      },
      has(target, key) {
        temporarySetCurrentAppName(appName)
        return key in target || key in originalWindow
      },
      // Object.keys(window)
      // Object.getOwnPropertyNames(window)
      // Object.getOwnPropertySymbols(window)
      // Reflect.ownKeys(window)
      ownKeys(target) {
        temporarySetCurrentAppName(appName)
        const result = Reflect.ownKeys(target).concat(
          Reflect.ownKeys(originalWindow)
        )
        return Array.from(new Set(result))
      },
      deleteProperty: (target, key) => {
        if (hasOwnProperty(target, key)) {
          this.injectedKeySet.delete(key)
          return Reflect.deleteProperty(target, key)
        }
        return true
      },
      getOwnPropertyDescriptor(target, key) {
        if (Reflect.has(target, key)) {
          // 这里的作用是保证在获取（Object.getOwnPropertyDescriptor）和设置（Object.defineProperty）一个 key 的 descriptor 时，都操作的是同一个对象
          // 即都操作 proxyWindow 或 originalWindow，否则会报错
          descriptorMap.set(key, 'target')
          return Object.getOwnPropertyDescriptor(target, key)
        }

        if (Reflect.has(originalWindow, key)) {
          descriptorMap.set(key, 'originalWindow')
          return Object.getOwnPropertyDescriptor(originalWindow, key)
        }
      },
      defineProperty: (target, key, value) => {
        if (!this.active) return true
        if (descriptorMap.get(key) === 'target') {
          return Reflect.defineProperty(target, key, value)
        }

        return Reflect.defineProperty(originalWindow, key, value)
      },
      // 返回 window 真正的原型
      getPrototypeOf() {
        return Reflect.getPrototypeOf(originalWindow)
      },
    })
  }
}
// 除了类，构造函数活着使用 call()、bind()、apply() 之外的都需绑定在window上
function needToBindOriginalWindow(fn: Function) {
  if (
    fn.toString().startsWith('class') ||
    (/^[A-Z][\w]+$/.test(fn.name) && fn.prototype?.constructor === fn) ||
    isBoundFunction(fn)
  )
    return false

  return true
}

export function isBoundFunction(fn: Function) {
  return fn.name.startsWith('bound ')
}
