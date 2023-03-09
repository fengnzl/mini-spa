export function $(selector: string): HTMLElement | null {
  return document.querySelector(selector)
}

export function pathPrefix(prefix: string) {
  return function (location = window.location): boolean {
    return location.pathname.startsWith(`${prefix}`)
  }
}