export function debounce<T extends (...args: any[]) => void> (handle: T, delay = 300): T {
  let prevTimer: number | null = null

  return function (this: any, ...args: any[]) {
    if (prevTimer) {
      window.clearTimeout(prevTimer)
    }
    prevTimer = window.setTimeout(() => {
      handle.apply(this, args)
      prevTimer = null
    }, delay)
  } as any
}
