import type { OrderRepositoryInterface, OrderServiceInterface } from "../contracts"

export class OrderApiController {
  constructor(
    protected service: OrderServiceInterface,
    protected repo: OrderRepositoryInterface
  ) { }

  async list(req: Request) {
    const orders = await this.repo.list()

    return Response.json({ orders })
  }

  async create(req: Request) {
    const { items } = await req.json()
    const order = await this.service.create(items)

    return Response.json({ order: order.get() })
  }

  async pushItem(req: Request) {
    const { order_id, item } = await req.json()
    const order = await this.findOrder(order_id)
    await this.service.pushItem(order, item)

    return Response.json({ order: (await this.repo.find(order_id))?.get() })
  }

  async pay(req: Request) {
    const { order_id } = await req.json()
    const order = await this.findOrder(order_id)
    await this.service.pay(order)

    return Response.json({ order: (await this.repo.find(order_id))?.get() })
  }

  protected async findOrder(id: number) {
    const order = await this.repo.find(id)

    if (!order) {
      throw new Error(`The order #${id} not found`)
    }

    return order
  }
}