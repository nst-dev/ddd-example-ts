import type { BusInterface } from "../../app/contracts";
import type { OrderAggregateInterface, OrderItem, OrderProperties, OrderRepositoryInterface, OrderServiceInterface } from "../contracts";
import { OrderAggregate } from "../domain/order-aggregate";

export class OrderService implements OrderServiceInterface {
  constructor( 
    protected bus: BusInterface,
    protected repo: OrderRepositoryInterface
  ) {}

  async create(items: OrderItem[]) {
    const cmd = OrderAggregate.create(items)
    const order = await this.repo.create(cmd.set as OrderProperties)
    cmd.dispatch.payload = {...cmd.dispatch.payload, order: order.get()}
    this.bus.dispatch(cmd.dispatch)

    return order
  }

  async pushItem(order: OrderAggregateInterface, item: OrderItem) {
    if (!order.canPay()) {
      throw new Error(`Not allowed to push item to order #${order.getId()}`)
    }

    const cmd = order.pushItem(item)
    await this.repo.update(order, cmd)
    this.bus.dispatch(cmd.dispatch)
  }

  async pay(order: OrderAggregateInterface) {
    if (!order.canPay()) {
      throw new Error(`Not allowed to pay for order #${order.getId()}`)
    }

    const cmd = order.pay()
    await this.repo.update(order, cmd)
    this.bus.dispatch(cmd.dispatch)
  }
}