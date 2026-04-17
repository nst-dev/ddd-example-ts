
export type Event = {
  name: string
  payload?: Record<string, any>
}

export interface BusInterface {
  dispatch(event: Event): Promise<void>
  listen(name: string, listener: (event: Event) => void): Promise<() => void>
}
