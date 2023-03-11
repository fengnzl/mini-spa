export function isPromise(fn: any): boolean {
  return (isObject(fn) || typeof fn === 'function') && typeof fn.then === 'function'
}

export function isObject(val: any): boolean {
  return typeof val === 'object' && val !== null
}

export function isFunction(target: any): boolean {
  return typeof target === 'function'
}
