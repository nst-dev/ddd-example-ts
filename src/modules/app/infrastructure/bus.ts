import EventEmitter from 'node:events';
import type { Event, BusInterface } from "../contracts";

export class Bus implements BusInterface {
  constructor(readonly emitter: EventEmitter) {}

  async dispatch(event: Event) {
    this.emitter.emit(event.name, event)
  }

  async listen(name: string, listener: (event: Event) => void) {
    this.emitter.on(name, listener)
    return () => this.emitter.off(name, listener)
  }
}