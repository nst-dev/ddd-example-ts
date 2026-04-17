import { describe, test, expect, beforeEach, mock } from 'bun:test'
import { OrderApiController } from '../../../../../src/modules/order/presentation/order-api-controller'
import { OrderAggregate } from '../../../../../src/modules/order/domain/order-aggregate'
import type { OrderRepositoryInterface, OrderServiceInterface, OrderItem } from '../../../../../src/modules/order/contracts'

const item1: OrderItem = { sku_id: 'aaa', price: 10, quantity: 2 }
const item2: OrderItem = { sku_id: 'bbb', price: 20, quantity: 1 }

const makePlacedOrder = (id = 1) =>
  new OrderAggregate(id, { items: [item1], amount: 20, status: 'Placed' })

const makeRequest = (body: unknown) =>
  new Request('http://localhost', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })

describe('OrderApiController', () => {
  let service: OrderServiceInterface
  let repo: OrderRepositoryInterface
  let controller: OrderApiController

  beforeEach(() => {
    service = {
      create: mock(() => Promise.resolve(makePlacedOrder())),
      pushItem: mock(() => Promise.resolve()),
      pay: mock(() => Promise.resolve()),
    }
    repo = {
      list: mock(() => Promise.resolve([{ id: 1, items: [item1], amount: 20, status: 'Placed' as const }])),
      find: mock((id: number) => Promise.resolve(id === 1 ? makePlacedOrder() : undefined)),
      create: mock((props) => Promise.resolve(new OrderAggregate(1, props))),
      update: mock(() => Promise.resolve()),
    }
    controller = new OrderApiController(service, repo)
  })

  describe('list()', () => {
    test('should return orders as JSON', async () => {
      const res = await controller.list(new Request('http://localhost'))
      const body = await res.json()
      expect(body.orders).toHaveLength(1)
      expect(body.orders[0].id).toBe(1)
    })
  })

  describe('create()', () => {
    test('should call service.create() with items and return order', async () => {
      const req = makeRequest({ items: [item1] })
      const res = await controller.create(req)
      const body = await res.json()
      expect(service.create).toHaveBeenCalledWith([item1])
      expect(body.order.id).toBe(1)
    })
  })

  describe('pushItem()', () => {
    test('should call service.pushItem() with the correct order and item', async () => {
      const req = makeRequest({ order_id: 1, item: item2 })
      await controller.pushItem(req)
      expect(service.pushItem).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }), item2)
    })

    test('should throw when order is not found', async () => {
      const req = makeRequest({ order_id: 99, item: item2 })
      expect(controller.pushItem(req)).rejects.toThrow('The order #99 not found')
    })
  })

  describe('pay()', () => {
    test('should call service.pay() with the correct order', async () => {
      const req = makeRequest({ order_id: 1 })
      await controller.pay(req)
      expect(service.pay).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }))
    })

    test('should throw when order is not found', async () => {
      const req = makeRequest({ order_id: 99 })
      expect(controller.pay(req)).rejects.toThrow('The order #99 not found')
    })
  })
})
