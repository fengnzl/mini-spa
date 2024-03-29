import type { MicroWindow } from '../types'
export const originalWindow: MicroWindow = window
export const originalWindowAddEventListener = window.addEventListener
export const originalWindowRemoveEventListener = window.removeEventListener
export const originalDefineProperty = Object.defineProperty
// eslint-disable-next-line no-eval
export const originalEval = window.eval
export const originPushState = window.history.pushState
export const originReplaceState = window.history.replaceState

export const originalDocument = document
export const originalDocumentAddEventListener = document.addEventListener
export const originalDocumentRemoveEventListener = document.removeEventListener
export const originalAppendChild = Element.prototype.appendChild
export const originalInsertBefore = Element.prototype.insertBefore
export const originalCreateElement = Document.prototype.createElement
export const originalQuerySelector = Document.prototype.querySelector
export const originalQuerySelectorAll = Document.prototype.querySelectorAll
export const originalGetElementById = Document.prototype.getElementById
export const originalGetElementsByClassName =
  Document.prototype.getElementsByClassName
export const originalGetElementsByTagName =
  Document.prototype.getElementsByTagName
export const originalGetElementsByName = Document.prototype.getElementsByName
