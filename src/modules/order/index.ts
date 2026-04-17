import { bus } from "../app";
import { OrderEventName } from "./contracts";
import { OrderApiController } from "./presentation/order-api-controller";
import { OrderRepository } from "./infrastructure/order-repository";
import { OrderService } from "./application/order-service";

export const orderRepository = new OrderRepository()
export const orderService = new OrderService(bus, orderRepository)
export const orderApiController = new OrderApiController(orderService, orderRepository)

for (const eventName of [OrderEventName.Placed, OrderEventName.ItemPushed, OrderEventName.Paid]) {
  bus.listen(eventName, event => console.dir(event, { depth: 10 }))
}
