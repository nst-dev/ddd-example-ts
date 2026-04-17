import { describe, test, expect } from 'bun:test'
import { OrderAggregate } from '../../../../../src/modules/order/domain/order-aggregate'
import { OrderStatus, OrderEventName } from '../../../../../src/modules/order/contracts'
import type { OrderItem } from '../../../../../src/modules/order/contracts'

const item1: OrderItem = { sku_id: 'aaa', price: 10, quantity: 2 }
const item2: OrderItem = { sku_id: 'bbb', price: 20, quantity: 1 }

describe('OrderAggregate', () => {
  describe('create()', () => {
    test('should calculate amount from items', () => {
      const cmd = OrderAggregate.create([item1, item2])
      expect(cmd.set?.amount).toBe(40) // 10*2 + 20*1
    })

    test('should set status to Placed', () => {
      const cmd = OrderAggregate.create([item1])
      expect(cmd.set?.status).toBe(OrderStatus.Placed)
    })

    test('should dispatch Order.Placed event', () => {
      const cmd = OrderAggregate.create([item1])
      expect(cmd.dispatch.name).toBe(OrderEventName.Placed)
      expect(cmd.dispatch.payload?.order.items).toEqual([item1])
    })
  })

  describe('get()', () => {
    test('should return merged id and properties', () => {
      const order = new OrderAggregate(1, { items: [item1], amount: 20, status: OrderStatus.Placed })
      expect(order.get()).toEqual({ id: 1, items: [item1], amount: 20, status: OrderStatus.Placed })
    })
  })

  describe('getId()', () => {
    test('should return the correct id', () => {
      const order = new OrderAggregate(42, { items: [], amount: 0, status: OrderStatus.Placed })
      expect(order.getId()).toBe(42)
    })
  })

  describe('canPay()', () => {
    test('should return true when status is Placed', () => {
      const order = new OrderAggregate(1, { items: [], amount: 0, status: OrderStatus.Placed })
      expect(order.canPay()).toBe(true)
    })

    test('should return false when status is Paid', () => {
      const order = new OrderAggregate(1, { items: [], amount: 0, status: OrderStatus.Paid })
      expect(order.canPay()).toBe(false)
    })

    test('should return false when status is Completed', () => {
      const order = new OrderAggregate(1, { items: [], amount: 0, status: OrderStatus.Completed })
      expect(order.canPay()).toBe(false)
    })
  })

  describe('pushItem()', () => {
    test('should return push command with the item', () => {
      const order = new OrderAggregate(1, { items: [item1], amount: 20, status: OrderStatus.Placed })
      const cmd = order.pushItem(item2)
      expect(cmd.push?.items).toEqual([item2])
    })

    test('should return increment amount by item price * quantity', () => {
      const order = new OrderAggregate(1, { items: [item1], amount: 20, status: OrderStatus.Placed })
      const cmd = order.pushItem(item2)
      expect(cmd.increment?.amount).toBe(20) // 20*1
    })

    test('should dispatch Order.ItemPushed event', () => {
      const order = new OrderAggregate(1, { items: [item1], amount: 20, status: OrderStatus.Placed })
      const cmd = order.pushItem(item2)
      expect(cmd.dispatch.name).toBe(OrderEventName.ItemPushed)
      expect(cmd.dispatch.payload?.id).toBe(1)
      expect(cmd.dispatch.payload?.item).toEqual(item2)
    })
  })

  describe('pay()', () => {
    test('should return set command with status Paid', () => {
      const order = new OrderAggregate(1, { items: [item1], amount: 20, status: OrderStatus.Placed })
      const cmd = order.pay()
      expect(cmd.set?.status).toBe(OrderStatus.Paid)
    })

    test('should dispatch Order.Paid event', () => {
      const order = new OrderAggregate(1, { items: [item1], amount: 20, status: OrderStatus.Placed })
      const cmd = order.pay()
      expect(cmd.dispatch.name).toBe(OrderEventName.Paid)
      expect(cmd.dispatch.payload?.id).toBe(1)
    })
  })
})
