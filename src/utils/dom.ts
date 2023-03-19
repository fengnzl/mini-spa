import type { AnyObject } from '../types'
import { originalWindow } from './originalEnv'
export function removeNode(node: Element) {
  node.parentNode?.removeChild(node)
}

export function createElement(tag: string, attrs: AnyObject) {
  const node = document.createElement(tag)
  attrs &&
    Object.keys(attrs).forEach((key) => {
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
    } else {
      head.appendChild(item)
    }
  })
}

const onEventTypes: string[] = []
export function getEventTypes() {
  if (onEventTypes.length) return onEventTypes

  for (const key of Object.keys(originalWindow)) {
    if (typeof key === 'string' && key.startsWith('on'))
      onEventTypes.push(key.slice(2))
  }
  return onEventTypes
}

// unique element
export function isUniqueElement(key: string): boolean {
  return /^body$/i.test(key) || /^head$/i.test(key) || /^html$/i.test(key)
}
