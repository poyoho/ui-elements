type ArrayRecord<T> = {
  [P in keyof T]: Array<T[P]>
}

export class EventListen<EventMap extends Record<string, (...args: any[]) => any>> {
  private map: ArrayRecord<EventMap> = {} as ArrayRecord<EventMap>

  subscribe<K extends keyof EventMap> (event: K, cb: EventMap[K]) {
    if (this.map[event]) {
      this.map[event].push(cb)
    } else {
      this.map[event] = [cb]
    }
  }

  unsubscribe<K extends keyof EventMap> (event: K) {
    delete this.map[event]
  }

  protected emit<K extends keyof EventMap> (event: K, ...args: Parameters<EventMap[K]>) {
    this.map[event] && this.map[event].forEach(fn => fn(...args))
  }
}
