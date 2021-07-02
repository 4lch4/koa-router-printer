import Table from 'cli-table3'
import Koa from 'koa'
import { AppOpts, IRouter, IStack, PathInfo } from './interfaces'

const AppDefaults: AppOpts = {
  displayHead: false,
  displayPrefix: true
}

export class Processor {
  private opts: AppOpts
  private app: Koa

  constructor(app: Koa, opts?: AppOpts) {
    this.opts = opts || AppDefaults
    this.app = app
  }

  private getRouteMethods(route: IStack) {
    if (this.opts.displayHead) return route.methods
    else return route.methods.filter(val => val !== 'HEAD')
  }

  getRoutesInfo(middleware: IRouter) {
    const { prefix } = middleware.opts
    const routesInfo: PathInfo[] = []

    for (const member of middleware.stack) {
      if (this.opts.displayPrefix) {
        routesInfo.push({
          path: member.path,
          methods: this.getRouteMethods(member)
        })
      } else {
        routesInfo.push({
          path: member.path.substring(prefix.length),
          methods: this.getRouteMethods(member)

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

function printRoutes(app: Koa, opts?: AppOpts) {
  const processor = new Processor(app, opts)
  const middleware = processor.getRouterMiddleware()
  if (middleware) {
    const routes = processor.getRoutesInfo(middleware)
    const table = new Table({
      head: ['Path', 'Method(s)'],
      colAligns: ['left', 'center']
    })

    for (const { methods, path } of routes) {
      table.push([path, methods.join(' -- ')])
    }

    console.log(`\n${table.toString()}\n`)
  } else {
    console.log(
      'No router middleware was located. Make sure this function is called _after_ you add your routes.'
    )
  }
}

export default printRoutes
