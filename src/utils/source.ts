import type { Application, Source } from '../types'
import { createElement, removeNode } from './dom'
import { addCSSScope } from './addCSSSCope';
import { originalWindow, originalAppendChild } from './originalEnv';

const urlReg = /^https?:\/\//
function isValidURL(url: any) {
  return urlReg.test(url)
}
export function parseHTMLAndLoadSources(app: Application) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<void>(async (resolve, reject) => {
    const { pageEntry } = app
    if (!isValidURL(pageEntry))
      return reject(Error(`${pageEntry} is not a valid url`))

    let html = ''
    try {
      html = await loadSourceText(pageEntry)
    } catch (e) {
      reject(e)
    }
    const domParser = new DOMParser()
    const doc = domParser.parseFromString(html, 'text/html')
    const { scripts, styles } = extractScriptsAndStyles(
      doc as unknown as Element,
      app
    )

    // 提取了 script style 后剩下的 body 部分的 html 内容
    app.pageBody = doc.body.innerHTML

    let isScriptsLoaded = false
    let isStylesLoaded = false

    // 加载 scripts
    Promise.all(loadScripts(scripts))
      .then((data) => {
        isScriptsLoaded = true
        app.scripts = data as string[]
        if (isScriptsLoaded && isScriptsLoaded) resolve()
      })
      .catch(reject)

    // 加载 style
    Promise.all(loadStyles(styles))
      .then((data) => {
        isStylesLoaded = true
        app.styles = data as string[]
        if (isScriptsLoaded && isStylesLoaded) resolve()
      })
      .catch(reject)
  })
}

async function loadSourceText(url: string) {
  return (await fetch(url)).text()
}

export const globalLoadedURLs: string[] = []

function extractScriptsAndStyles(node: Element, app: Application) {
  if (!node.children.length) return { scripts: [], styles: [] }

  let styles: Source[] = []
  let scripts: Source[] = []
  for (const child of Array.from(node.children)) {
    const isGlobal = Boolean(child.getAttribute('global'))
    const tagName = child.tagName

    if (tagName === 'STYLE') {
      removeNode(child)
      styles.push({
        isGlobal,
        value: child.textContent || '',
      })
    } else if (tagName === 'SCRIPT') {
      removeNode(child)
      const src = child.getAttribute('src') || ''
      if (app.appLoadedURLs?.includes(src) || globalLoadedURLs.includes(src)) {
        continue
      }

      const config: Source = {
        isGlobal,
        type: child.getAttribute('type'),
        value: child.textContent || '',
      }

      if (src) {
        config.url = src
        if (isGlobal) {
          globalLoadedURLs.push(src)
        } else {
          app.appLoadedURLs!.push(src)
        }
      }

      scripts.push(config)
    } else if (tagName === 'LINK') {
      removeNode(child)
      const href = child.getAttribute('href') || ''
      if (app.appLoadedURLs!.includes(href) || globalLoadedURLs.includes(href)) {
        continue
      }

      if (child.getAttribute('rel') === 'stylesheet' && href) {
        styles.push({
          url: href,
          isGlobal,
          value: '',
        })

        if (isGlobal) {
          globalLoadedURLs.push(href)
        } else {
          app.appLoadedURLs!.push(href)
        }
      }
    } else {
      const result = extractScriptsAndStyles(child, app)
      scripts = scripts.concat(result.scripts)
      styles = styles.concat(result.styles)
    }
  }

  return { scripts, styles }
}

const head = document.head
function loadScripts(scripts: Source[]) {
  if (!scripts.length) return []
  return scripts
    .map((item) => {
      const type = item.type || 'text/javascript'
      if (item.isGlobal) {
        const script = createElement('script', {
          type,
          global: item.isGlobal,
        })

        if (item.url) script.setAttribute('src', item.url)
        else script.textContent = item.value

        originalAppendChild.call(head, script)
        // eslint-disable-next-line array-callback-return
        return
      }

      if (item.url) return loadSourceText(item.url)
      return Promise.resolve(item.value)
    })
    .filter(Boolean)
}

export function executeScripts(scripts: string[], app: Application) {
  // eslint-disable-next-line no-useless-catch
  try {
    scripts.forEach((code) => {
      if (app.sandboxConfig?.enabled) {
        // ts 使用 with 会报错，所以需要这样包一下
        // 将子应用的 js 代码全局 window 环境指向代理环境 proxyWindow
        const warpCode = `
          ;(function(proxyWindow){
            with (proxyWindow) {
              (function(window){${code}\n}).call(proxyWindow, proxyWindow)
            }
          })(this);
        `

        new Function(warpCode).call(app.sandBox!.proxyWindow)
      } else {
        new Function('window', code).call(originalWindow, originalWindow)
      }
    })
  } catch (e) {
    throw e
  }
}

function loadStyles(styles: Source[]) {
  if (!styles.length) return []

  return styles
    .map((item) => {
      if (item.isGlobal) {
        if (item.url) {
          const link = createElement('link', {
            global: item.isGlobal,
            rel: 'stylesheet',
            href: item.url,
          })
          originalAppendChild.call(head, link)
        } else {
          const style = createElement('style', {
            global: item.isGlobal,
            type: 'text/css',
            textContent: item.value,
          })
          originalAppendChild.call(head, style)
        }
      }

      if (item.url) return loadSourceText(item.url)
      return Promise.resolve(item.value)
    })
    .filter(Boolean)
}


export async function fetchScriptAndExecute(url: string, app: Application) {
  const content = await loadSourceText(url)
  executeScripts([content], app)
}

export async function fetchStyleAndReplaceStyleContent(style: HTMLStyleElement, url: string, app: Application) {
  const content = await loadSourceText(url)
  style.textContent = content
  if (app.sandboxConfig.css) {
    addCSSScope(style, app)
  }
}