import type { OrderAggregateInterface, OrderAggregateCommand, OrderProperties, OrderRepositoryInterface } from "../contracts";
import { OrderAggregate } from "../domain/order-aggregate";

export class OrderRepository implements OrderRepositoryInterface {
  constructor(
    protected orders: Record<number, OrderProperties> = {}, 
    protected lastId: number = 0
  ) {}

  async list() {
    let orders = []
    for (const id in this.orders) {
      orders.push({id: Number(id), ...this.orders[id]})
    }

    return orders
  }

  async find(id: number) {
    return this.orders[id] ? new OrderAggregate(id, this.orders[id]) : undefined
  }

  async create(order: OrderProperties) {
    this.lastId++
    this.orders[this.lastId] = order

    return new OrderAggregate(this.lastId, order)
  }

  async update(order: OrderAggregateInterface, command: OrderAggregateCommand) {
    const id = order.getId()

    if (command.set) {
      this.orders[id] = {...this.orders[id], ...command.set}
    }

    if (command.increment?.amount) {
      this.orders[id].amount += command.increment.amount
    }

    if (command.push?.items) {
      this.orders[id]?.items.push(...command.push.items)
    }
  }
}