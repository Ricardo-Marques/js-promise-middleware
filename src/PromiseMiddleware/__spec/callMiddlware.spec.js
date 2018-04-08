import Promise from 'promise'
import sinon, { assert } from 'sinon'

import PromiseMiddleware from '../index'


describe('callMiddlware', () => {
  const sandbox = sinon.sandbox.create()
  const fetcher = () => new Promise(() => {})
  let MyWrappedFetcher

  beforeAll(() => {
    MyWrappedFetcher = new PromiseMiddleware(fetcher)
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('returns a finished state object if no middleware is given', () => {
    expect(MyWrappedFetcher._callMiddleware([])).toEqual({ finished: true })
  })

  it('calls the first middleware, giving the eventProperties and a "stop" cb', () => {
    const eventProperties = {}
    const middleware = [sandbox.stub().callsFake((eventProperties, stop) => {
        expect(eventProperties).toEqual(eventProperties)
        expect(stop).toBeInstanceOf(Function)
    })]

    MyWrappedFetcher._callMiddleware(middleware, eventProperties)
    assert.calledOnce(middleware[0])
  })

  it('stops middleware execution if any of the middleware call "stop"', () => {
    const middlewareThatWillBeCalled = [sandbox.spy(), sandbox.spy()]
    const middlewareThatWillNotBeCalled = [sandbox.spy(), sandbox.spy()]
    const middlewareThatStopsExecution = (eventProperties, stop) => {
      stop()
    }

    const middleware = [...middlewareThatWillBeCalled, middlewareThatStopsExecution, ...middlewareThatWillNotBeCalled]

    MyWrappedFetcher._callMiddleware(middleware)

    middlewareThatWillBeCalled.forEach(middleware => {
      assert.calledOnce(middleware)
    })

    middlewareThatWillNotBeCalled.forEach(middleware => {
      assert.notCalled(middleware)
    })
  })

  it('returns a stopped status if any middlware call "stop"', () => {
    const middlewareThatStopsExecution = (eventProperties, stop) => {
      stop()
    }

    const result = MyWrappedFetcher._callMiddleware([middlewareThatStopsExecution])
    expect(result).toEqual({ wasStopped: true })
  })
})
