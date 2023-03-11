export function $(query: string): HTMLElement {
  return document.querySelector(query) as HTMLElement
}

export function pathPrefix(prefix: string) {
  return function (location: Location = window.location) {
    return location.pathname.startsWith(`${prefix}`)
  };
}
