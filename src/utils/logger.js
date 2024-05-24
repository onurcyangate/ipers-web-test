const _logger = (fn = 'log') => {
  if (import.meta.env.DEV || fn === 'error') {
    return Function.prototype.bind.call(console[fn], console)
  }
  return () => {}
}

export const consoleLog = _logger()
export const consoleDebug = _logger('debug')
export const consoleWarning = _logger('warn')
export const consoleError = _logger('error')
