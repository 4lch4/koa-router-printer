import Router from '@koa/router'
import Koa, { ParameterizedContext } from 'koa'
import Printer from '../' // Importing the koa-router-printer module.

const app = new Koa()
const router = new Router({
  prefix: '/api/v1'
})

router.get('/health/liveness', (ctx: ParameterizedContext) => {
  ctx.body = 'OK'
  ctx.status = 200
})

router.get('/health/liveness', (ctx: ParameterizedContext) => {
  ctx.body = 'OK'
  ctx.status = 200
})

app.use(router.routes())
app.use(router.allowedMethods())

Printer(app, {
  displayHead: false,
  displayPrefix: true
})
