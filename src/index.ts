import Table from 'cli-table3'
import Koa from 'koa'
import { IRouter, PathInfo } from './interfaces'

export interface IAppOpts {
  displayPrefix: true
}

class Processor {
  private opts: IAppOpts
  private app: Koa

  constructor(app: Koa, opts?: IAppOpts) {
    this.opts = opts || { displayPrefix: true }
    this.app = app
  }

  getRoutesInfo(middleware: IRouter) {
    const { prefix } = middleware.opts
    const routesInfo: PathInfo[] = []

    for (const member of middleware.stack) {
      if (this.opts.displayPrefix) {
        routesInfo.push({
          path: member.path,
          methods: member.methods
        })
      } else {
        routesInfo.push({
          path: member.path.substring(prefix.length),
          methods: member.methods
        })
      }
    }

    return routesInfo
  }

  getRouterMiddleware(): IRouter | undefined {
    for (const mw of this.app.middleware) {
      // @ts-ignore if using the @koa/router package, this will be present on at
      // least one piece of middleware.
      if (mw.router) return mw.router
    }

    return undefined
  }
}

function printRoutes(app: Koa, opts?: IAppOpts) {
  const processor = new Processor(app, opts)
  const middleware = processor.getRouterMiddleware()
  if (middleware) {
    const routes = processor.getRoutesInfo(middleware)
    const table = new Table({
      head: ['Path', 'Method(s)']
    })

    for (const { methods, path } of routes) {
      table.push([path, methods.join('-- ')])
    }

    console.log(table.toString())
  } else {
    console.log(
      'No router middleware was located. Make sure this function is called _after_ you add your routes.'
    )
  }
}

export default printRoutes
