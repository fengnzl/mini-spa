import type { AnyObject } from '../../dist/types'
export function removeNode(node: Element) {
  node.parentNode?.removeChild(node)
}

export function createElement(tag: string, attrs: AnyObject) {
  const node = document.createElement(tag)
  attrs && Object.keys(attrs).forEach((key) => {
    node.setAttribute(key, attrs[key])
  })
  return node
}
