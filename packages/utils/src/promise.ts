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
