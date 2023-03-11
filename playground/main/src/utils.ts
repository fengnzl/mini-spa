export function $(query: string): HTMLElement | null {
  return document.querySelector(query)
}

export function pathPrefix(prefix: string) {
  return function (location: Location = window.location) {
    return location.pathname.startsWith(`${prefix}`)
  };
}