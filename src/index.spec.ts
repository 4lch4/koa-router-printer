import { expect } from 'chai'
import Koa from 'koa'
import 'mocha'
import Package, { Processor } from './index'

describe('Module export', () => {
  it('Should export a Processor class...', () => {
    const processor = new Processor(new Koa())
    expect(processor).exist
  })

  it('Should export a default function that requires routes', () => {
    expect(Package(new Koa())).to.throw
  })
})
