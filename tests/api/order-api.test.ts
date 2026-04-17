import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'bun:test'
import { createServer } from '../../src/api'

let server: ReturnType<typeof Bun.serve>
let base: string

beforeAll(() => {
  server = createServer()
  base = `http://localhost:${server.port}`
})

afterAll(() => {
  server.stop()
})

function post(path: string, body: object) {
  return fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('API: Health', () => {
  test('GET / returns OK', async () => {
    const res = await fetch(`${base}/`)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ message: 'OK' })
  })

  test('unknown route returns 404', async () => {
    const res = await fetch(`${base}/unknown`)
    expect(res.status).toBe(404)
  })
})

describe('API: Order', () => {
  const items = [{ sku_id: 'item-1', price: 100, quantity: 2 }]

  test('create an order', async () => {
    const res = await post('/order/create', { items })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.order.status).toBe('Placed')
    expect(body.order.items).toHaveLength(1)
    expect(body.order.amount).toBe(200)
  })

  test('list orders', async () => {
    await post('/order/create', { items })
    const res = await fetch(`${base}/order/list`)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.orders.length).toBeGreaterThanOrEqual(1)
  })

  test('push item to order', async () => {
    const createRes = await post('/order/create', { items })
    const { order } = await createRes.json()

    const res = await post('/order/push-item', {
      order_id: order.id,
      item: { sku_id: 'item-2', price: 50, quantity: 1 },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.order.items).toHaveLength(2)
    expect(body.order.amount).toBe(250)
  })

  test('pay an order', async () => {
    const createRes = await post('/order/create', { items })
    const { order } = await createRes.json()

    const res = await post('/order/pay', { order_id: order.id })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.order.status).toBe('Paid')
  })

  test('pay an already paid order returns error', async () => {
    const createRes = await post('/order/create', { items })
    const { order } = await createRes.json()

    await post('/order/pay', { order_id: order.id })
    const res = await post('/order/pay', { order_id: order.id })

    expect(res.status).toBe(400)
  })

  test('push item to a paid order returns error', async () => {
    const createRes = await post('/order/create', { items })
    const { order } = await createRes.json()

    await post('/order/pay', { order_id: order.id })
    const res = await post('/order/push-item', {
      order_id: order.id,
      item: { sku_id: 'item-3', price: 30, quantity: 1 },
    })

    expect(res.status).toBe(400)
  })
})
