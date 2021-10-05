import chalk from 'chalk'
import Table from 'cli-table3'
import Koa from 'koa'
import { AppOpts, IRouter, IStack, PathInfo } from './interfaces'

const AppDefaults: AppOpts = {
  displayHead: false,
  displayPrefix: true,
  colors: true,
  delimiter: ' -- '
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

  colorMethods(methods: string[]): string[] {
    const coloredMethods: string[] = []

    for (const method of methods) {
      switch (method) {
        case 'GET':
          coloredMethods.push(chalk.green(method))
          break

        case 'POST':
        case 'PUT':
        case 'PATCH':
          coloredMethods.push(chalk.yellow(method))
          break

        case 'DELETE':
          coloredMethods.push(chalk.red(method))
          break

        default:
          coloredMethods.push(method)
      }
    }

    return coloredMethods
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

  getRouterMiddleware(): IRouter[] {
    const routerMiddleware = []
    for (const mw of this.app.middleware) {
      // @ts-ignore if using the @koa/router package with at least one route,
      // this will be present on at least one piece of middleware.
      if (mw.router) routerMiddleware.push(mw.router)
    }

    return routerMiddleware
  }

  getRouteRow({ methods, path }: PathInfo): string[] {
    return [
      path,
      this.opts.colors
        ? this.colorMethods(methods).join(this.opts.delimiter)
        : methods.join(this.opts.delimiter)
    ]
  }
}

export function printRoutes(app: Koa, opts: AppOpts = AppDefaults) {
  const processor = new Processor(app, opts)
  const middlewareArray = processor.getRouterMiddleware()
  if (middlewareArray.length > 0) {
    const table = new Table({
      head: ['Path', 'Method(s)'],
      colAligns: ['left', 'center']
    })

    for (const middleware of middlewareArray) {
      const routes = processor.getRoutesInfo(middleware)

      for (const route of routes) table.push(processor.getRouteRow(route))
    }

    console.log(`\n${table.toString()}\n`)
  } else {
    console.log(
      'No router middleware was located. Make sure this function is called _after_ you add your routes.'
    )
  }
}

export default printRoutes
