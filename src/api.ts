import { orderApiController } from './modules/order';

export const apiHandler = async (req: Request) => {
  const url = new URL(req.url);

  switch (url.pathname) {
    case '/':
      return Response.json({ message: 'OK' })

    case '/order/list':
      return orderApiController.list(req)

    case '/order/create':
      return orderApiController.create(req)

    case '/order/push-item':
      return orderApiController.pushItem(req)

    case '/order/pay':
      return orderApiController.pay(req)

    default:
      return Response.json({ error: 404 }, { status: 404 })
  }
}

export function createServer(port = 3000) {
  return Bun.serve({
    port,
    fetch: apiHandler,
    error(error) {
      console.error(error)
      return Response.json({ error: error.message }, { status: 400 })
    },
  })
}
