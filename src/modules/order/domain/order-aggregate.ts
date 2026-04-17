import type { OrderAggregateCommand, OrderAggregateInterface, OrderItem, OrderProperties } from "../contracts";
import { OrderStatus, OrderEventName } from "../contracts";

export class OrderAggregate implements OrderAggregateInterface {
  constructor(
    readonly id: number,
    readonly properties: OrderProperties
  ) { }

  getId() {
    return this.id
  }

  get() {
    return { id: this.id, ...this.properties }
  }

  static create(items: OrderItem[]): OrderAggregateCommand {
    const order: OrderProperties = {
      items,
      amount: items.reduce((amount, item) => amount + item.price * item.quantity, 0),
      status: OrderStatus.Placed,
    }

    return {
      set: order,
      dispatch: { name: OrderEventName.Placed, payload: { order } }
    }
  }

  pushItem(item: OrderItem): OrderAggregateCommand {
    return {
      push: { items: [item] },
      increment: { amount: item.price * item.quantity },
      dispatch: { name: OrderEventName.ItemPushed, payload: { id: this.id, item } }
    }
  }

  canPay(): boolean {
    return this.properties.status === OrderStatus.Placed
  }

  pay(): OrderAggregateCommand {
    return {
      set: { status: OrderStatus.Paid },
      dispatch: { name: OrderEventName.Paid, payload: { id: this.id } }
    }
  }
}