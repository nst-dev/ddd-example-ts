
export type Order = {id: number} & OrderProperties

export type OrderProperties = {
  items: OrderItem[],
  amount: number,
  status: 'Placed' | 'Paid' | 'Completed',
}

export type OrderItem = {
  sku_id: string,
  price: number,
  quantity: number,
}

export type OrderEvent = {
  name: 'Order.Placed' | 'Order.ItemPushed' | 'Order.Paid'
  payload?: Record<string, any>
}

export type OrderAggregateCommand = {
  set?: Partial<OrderProperties>,
  increment?: Pick<OrderProperties, 'amount'>,
  push?: Pick<OrderProperties, 'items'>,
  dispatch: OrderEvent,
}

export interface OrderAggregateInterface {
  getId(): number,
  get(): Order,
  pushItem(item: OrderItem): OrderAggregateCommand,
  canPay(): boolean,
  pay(): OrderAggregateCommand,
}

export interface OrderRepositoryInterface {
  list(): Promise<Order[]>
  find(id: number): Promise<OrderAggregateInterface|undefined>,
  create(input: OrderProperties): Promise<OrderAggregateInterface>,
  update(order: OrderAggregateInterface, command: OrderAggregateCommand): Promise<void>,
}

export interface OrderServiceInterface {
  create(items: OrderItem[]): Promise<OrderAggregateInterface>,
  pushItem(order: OrderAggregateInterface, item: OrderItem): Promise<void>,
  pay(order: OrderAggregateInterface): Promise<void>,
}
