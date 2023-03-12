import type { Application, Source } from '../types'
import { createElement, removeNode } from './dom'

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
    }
    catch (e) {
      reject(e)
    }
    const domParser = new DOMParser()
    const doc = domParser.parseFromString(html, 'text/html')
    const { scripts, styles } = extractScriptsAndStyles(
      doc as unknown as Element,
      app,
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
        if (isScriptsLoaded && isScriptsLoaded)
          resolve()
      })
      .catch(reject)

    // 加载 style
    Promise.all(loadStyles(styles))
      .then((data) => {
        isStylesLoaded = true
        app.styles = data as string[]
        if (isScriptsLoaded && isStylesLoaded)
          resolve()
      })
      .catch(reject)
  })
}

async function loadSourceText(url: string) {
  return (await fetch(url)).text()
}

export const globalLoadedURLs: string[] = []

function extractScriptsAndStyles(
  node: Element,
  app: Application,
): { scripts: Source[]; styles: Source[] } {
  if (!app.appLoadedURLs)
    app.appLoadedURLs = []

  if (!node.children.length)
    return { scripts: [], styles: [] }

  const styles: Source[] = []
  const scripts: Source[] = []
  for (const child of Array.from(node.children)) {
    // 是否是全局资源
    const isGlobal = Boolean(child.getAttribute('global'))

    const tagName = child.tagName
    // 如果是 style 样式类型
    if (tagName === 'STYLE') {
      removeNode(child)
      styles.push({
        isGlobal,
        value: child.textContent || '',
      })
    }
    else if (tagName === 'SCRIPT') {
      removeNode(child)
      const src = child.getAttribute('src') || ''
      if (app.appLoadedURLs.includes(src) || globalLoadedURLs.includes(src))
        continue

      const config: Source = {
        isGlobal,
        value: child.textContent || '',
        type: child.getAttribute('type') || '',
      }
      if (src) {
        config.url = src
        if (isGlobal)
          globalLoadedURLs.push(src)

        else
          app.appLoadedURLs.push(src)
      }
      scripts.push(config)
    }
    else if (tagName === 'LINK') {
      removeNode(child)
      const href = child.getAttribute('href') || ''
      if (app.appLoadedURLs.includes(href) || globalLoadedURLs.includes(href))
        continue

      if (child.getAttribute('rel') === 'stylesheet' && href) {
        styles.push({
          isGlobal,
          url: href,
          value: '',
        })
        if (isGlobal)
          globalLoadedURLs.push(href)

        else
          app.appLoadedURLs.push(href)
      }
    }
    else {
      const result = extractScriptsAndStyles(child, app)
      scripts.push(...result.scripts)
      styles.push(...result.styles)
    }
  }
  return { scripts, styles }
}

const head = document.head
function loadScripts(scripts: Source[]) {
  if (!scripts.length)
    return []
  return scripts.map((item) => {
    const type = item.type || 'text/javascript'

    if (item.isGlobal) {
      const script = createElement('script', {
        type,
        global: item.isGlobal,
      })

      if (item.url)
        script.setAttribute('src', item.url)

      else
        script.textContent = item.value

      head.appendChild(script)
      // eslint-disable-next-line array-callback-return
      return
    }

    if (item.url)
      return loadSourceText(item.url)
    return Promise.resolve(item.value)
  }).filter(Boolean)
}

export function executeScripts(scripts: string[], app: Application) {
  // eslint-disable-next-line no-useless-catch
  try {
    scripts.forEach((code) => {
      const wrapCode = `
        (function (proxyWindow) {
          with(proxyWindow) {
            (function (window){${code}\n}).call(proxyWindow, proxyWindow)
          }
        })(this)
      `
      // eslint-disable-next-line no-new-func
      new Function(wrapCode).call(app.sandBox?.proxyWindow)
    })
  }
  catch (e) {
    throw e
  }
}

function loadStyles(styles: Source[]) {
  if (!styles.length)
    return []

  return styles.map((item) => {
    if (item.isGlobal) {
      if (item.url) {
        const link = createElement('link', {
          global: item.isGlobal,
          rel: 'stylesheet',
          href: item.url,
        })
        head.appendChild(link)
      }
      else {
        const style = createElement('style', {
          global: item.isGlobal,
          type: 'text/css',
          textContent: item.value,
        })
        head.appendChild(style)
      }
    }

    if (item.url)
      return loadSourceText(item.url)
    return Promise.resolve(item.value)
  }).filter(Boolean)
}
