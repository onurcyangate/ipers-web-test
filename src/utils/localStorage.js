const STORAGE_NAME = 'app_storage'
const _storage = window.sessionStorage
const _listeners = {}
const _data = _storage.getItem(STORAGE_NAME)
  ? JSON.parse(_storage.getItem(STORAGE_NAME))
  : {}

const _flush = (key, newValue) => {
  _storage.setItem(STORAGE_NAME, JSON.stringify(_data))

  if (_listeners[key]) {
    _listeners[key].forEach((fn) => {
      fn(newValue)
    })
  }
}

const listen = (key, fn) => {
  _listeners[key] = _listeners[key] || []
  _listeners[key].push(fn)
}

const getItem = (key) => _data[key]

const setItem = (key, value) => {
  _data[key] = value
  _flush(key, value)
}

const removeItem = (key) => {
  delete _data[key]
  _flush(key)
}

const removeItems = (keys) => {
  if (Array.isArray(keys)) {
    keys.forEach((key) => {
      delete _data[key]
    })
    _flush()
  }
}

export default {
  getItem,
  setItem,
  removeItem,
  removeItems,
  listen
}
