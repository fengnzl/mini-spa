// https://eslint.org/docs/latest/extend/custom-formatters
module.exports = function (results, context) {
  const rootPath = process.cwd()
  const WARNING = 1
  const formatterResults = results.map(item => {
    if (!item.messages.length) {
      return false
    }
    const { filePath, messages } = item
    return {
      path: filePath.replace(rootPath, ''),
      errorInfo: messages.map(msg => {
        const { line, endLine, severity, message } = msg
        return {
          message,
          start: line,
          end: endLine,
          type: severity === WARNING ? 'warning' : 'error'
        }
      })
    }
  }).filter(Boolean)
  return JSON.stringify(formatterResults, null, 2)
};