import { describe, test, expect, beforeEach, mock } from 'bun:test'
import EventEmitter from 'node:events'
import { Bus } from '../../../../../src/modules/app/infrastructure/bus'
import type { Event } from '../../../../../src/modules/app/contracts'

describe('Bus', () => {
  let emitter: EventEmitter
  let bus: Bus

  beforeEach(() => {
    emitter = new EventEmitter()
    bus = new Bus(emitter)
  })

  describe('dispatch()', () => {
    test('should emit the event on the emitter', async () => {
      const listener = mock(() => {})
      emitter.on('Test.Event', listener)

      const event: Event = { name: 'Test.Event', payload: { id: 1 } }
      await bus.dispatch(event)

      expect(listener).toHaveBeenCalledWith(event)
    })

    test('should emit event without payload', async () => {
      const listener = mock(() => {})
      emitter.on('Test.NoPayload', listener)

      const event: Event = { name: 'Test.NoPayload' }
      await bus.dispatch(event)

      expect(listener).toHaveBeenCalledWith(event)
    })
  })

  describe('listen()', () => {
    test('should register a listener and receive dispatched events', async () => {
      const listener = mock(() => {})
      await bus.listen('Order.Placed', listener)

      const event: Event = { name: 'Order.Placed', payload: { orderId: 1 } }
      await bus.dispatch(event)

      expect(listener).toHaveBeenCalledWith(event)
    })

    test('should return an unsubscribe function that removes the listener', async () => {
      const listener = mock(() => {})
      const unsubscribe = await bus.listen('Order.Paid', listener)

      unsubscribe()

      await bus.dispatch({ name: 'Order.Paid' })
      expect(listener).not.toHaveBeenCalled()
    })
  })
})
