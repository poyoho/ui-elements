export function debounce<T extends (...args: any[]) => void> (handle: T, delay = 300): T {
  let prevTimer: number | null = null
  return ((...args: any[]) => {
    if (prevTimer) {
      window.clearTimeout(prevTimer)
    }
    prevTimer = window.setTimeout(() => {
      handle(...args)
      prevTimer = null
    }, delay)
  }) as any
}
