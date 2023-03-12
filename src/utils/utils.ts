export function isPromise(fn: any): boolean {
  return (isObject(fn) || typeof fn === 'function') && typeof fn.then === 'function'
}

export function isObject(val: any): boolean {
  return typeof val === 'object' && val !== null
}

export function isFunction(target: any): boolean {
  return typeof target === 'function'
}

// 避免 Object.create(null) 创建的对象原型为 null 没有 hasOwnProperty 方法
export function hasOwnProperty(target: any, key: string | symbol): boolean {
  return Object.prototype.hasOwnProperty.call(target, key)
}
