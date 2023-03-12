import type { AnyObject } from '../types'
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

const head = document.head
export function addStyles(styles: string[] | HTMLStyleElement[]) {
  styles.forEach((item) => {
    if (typeof item === 'string') {
      const node = createElement('style', {
        type: 'text/css',
        textContent: item,
      })
      head.appendChild(node)
    }
    else {
      head.appendChild(item)
    }
  })
}
