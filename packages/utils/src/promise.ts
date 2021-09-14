export function createSinglePromise<T>(fn: () => Promise<T>): () => Promise<T> {
  let _promise: Promise<T>

  function wrapper() {
    if (!_promise) {
      _promise = fn()
    }
    return _promise
  }

  return wrapper
}

export function createDefer<T = any>() {
  let resolve = (val: T) => {}
  let reject = () => {}
  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve
    reject = _reject
  })

  return {
    promise,
    resolve,
    reject
  }
}
