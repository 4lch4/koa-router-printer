export interface IRouter {
  opts: Opts
  methods: string[]
  params: Params
  stack: IStack[]
}

export interface IStack {
  opts: string
  name?: any
  methods: string[]
  paramNames: any[]
  stack: string
  path: string
  regexp: string
}

interface Params {
  [key: string]: any
}

interface Opts {
  prefix: string
}
