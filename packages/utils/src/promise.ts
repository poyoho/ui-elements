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

export function tryPromise<T> (promise: () => Promise<T>, times: number, delay?: number): Promise<T> {
  return promise().catch(err => {
      times--
      console.log("[retry promise]", err, times)
      if (times === 0) {
        return err
      }
      return new Promise((resolveRetry) => {
        if (delay) {
          setTimeout(() => {
            resolveRetry(tryPromise(promise, times, delay))
          }, delay)
        } else {
          resolveRetry(tryPromise(promise, times, delay))
        }
      })
    })
}
