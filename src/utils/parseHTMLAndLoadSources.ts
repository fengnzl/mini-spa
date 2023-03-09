import type { Application } from '../types'

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
    console.log(html)
  })
}

export async function loadSourceText(url: string) {
  const res = (await fetch(url)).text()
  return res
}
