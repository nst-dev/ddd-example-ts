import { describe, test, expect, beforeEach } from 'bun:test'
import { OrderRepository } from '../../../../../src/modules/order/infrastructure/order-repository'
import type { OrderItem } from '../../../../../src/modules/order/contracts'

const item1: OrderItem = { sku_id: 'aaa', price: 10, quantity: 2 }
const item2: OrderItem = { sku_id: 'bbb', price: 20, quantity: 1 }

describe('OrderRepository', () => {
  let repo: OrderRepository

  beforeEach(() => {
    repo = new OrderRepository()
  })

  describe('create()', () => {
    test('should create and return an OrderAggregate', async () => {
      const order = await repo.create({ items: [item1], amount: 20, status: 'Placed' })
      expect(order.getId()).toBe(1)
      expect(order.get().items).toEqual([item1])
    })

    test('should auto-increment id', async () => {
      const o1 = await repo.create({ items: [item1], amount: 20, status: 'Placed' })
      const o2 = await repo.create({ items: [item2], amount: 20, status: 'Placed' })
      expect(o1.getId()).toBe(1)
      expect(o2.getId()).toBe(2)
    })
  })

  describe('find()', () => {
    test('should return an OrderAggregate for existing id', async () => {
      await repo.create({ items: [item1], amount: 20, status: 'Placed' })
      const found = await repo.find(1)
      expect(found).toBeDefined()
      expect(found?.getId()).toBe(1)
    })

    test('should return undefined for missing id', async () => {
      const found = await repo.find(99)
      expect(found).toBeUndefined()
    })
  })

  describe('list()', () => {
    test('should return empty array when no orders', async () => {
      expect(await repo.list()).toEqual([])
    })

    test('should return all orders as plain objects with id', async () => {
      await repo.create({ items: [item1], amount: 20, status: 'Placed' })
      await repo.create({ items: [item2], amount: 20, status: 'Placed' })
      const list = await repo.list() as Array<{ id: number }>
      expect(list).toHaveLength(2)
      expect(list[0].id).toBe(1)
      expect(list[1].id).toBe(2)
    })
  })

  describe('update()', () => {
    test('should update properties via set command', async () => {
      const order = await repo.create({ items: [item1], amount: 20, status: 'Placed' })
      await repo.update(order, { set: { status: 'Paid' }, dispatch: { name: 'Order.Paid' } })
      expect((await repo.find(1))?.get().status).toBe('Paid')
    })

    test('should increment amount', async () => {
      const order = await repo.create({ items: [item1], amount: 20, status: 'Placed' })
      await repo.update(order, { increment: { amount: 15 }, dispatch: { name: 'Order.ItemPushed' } })
      expect((await repo.find(1))?.get().amount).toBe(35)
    })

    test('should push new items', async () => {
      const order = await repo.create({ items: [item1], amount: 20, status: 'Placed' })
      await repo.update(order, { push: { items: [item2] }, dispatch: { name: 'Order.ItemPushed' } })
      expect((await repo.find(1))?.get().items).toHaveLength(2)
      expect((await repo.find(1))?.get().items[1]).toEqual(item2)
    })
  })
})
