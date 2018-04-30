import sinon, { assert } from 'sinon'

import PromiseMiddleware from '../index'

describe('callmiddleware', () => {
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
    expect(MyWrappedFetcher._callMiddleware([])).toEqual({
      finished: true,
      stopped: false
    })
  })

  it('calls the first middleware, giving the event, stop, next and error callbacks', () => {
    const event = {}
    const middleware = [
      sandbox.stub().callsFake((event, { stop, next, error }) => {
        expect(event).toEqual(event)
        expect(stop).toBeInstanceOf(Function)
        expect(next).toBeInstanceOf(Function)
        expect(error).toBeInstanceOf(Function)
      })
    ]

    MyWrappedFetcher._callMiddleware(middleware, event)
    assert.calledOnce(middleware[0])
  })

  describe('stop', () => {
    it('stops middleware execution if any of the middleware call "stop"', () => {
      const middlewareThatWillBeCalled = [sandbox.spy(), sandbox.spy()]
      const middlewareThatWillNotBeCalled = [sandbox.spy(), sandbox.spy()]
      const middlewareThatStopsExecution = (event, { stop }) => {
        stop()
      }

      const middleware = [
        ...middlewareThatWillBeCalled,
        middlewareThatStopsExecution,
        ...middlewareThatWillNotBeCalled
      ]

      MyWrappedFetcher._callMiddleware(middleware, {})

      middlewareThatWillBeCalled.forEach(middleware => {
        assert.calledOnce(middleware)
      })

      middlewareThatWillNotBeCalled.forEach(middleware => {
        assert.notCalled(middleware)
      })
    })

    it('returns a stopped status if any middleware call "stop"', () => {
      const middlewareThatStopsExecution = (event, { stop }) => {
        stop()
      }

      const result = MyWrappedFetcher._callMiddleware(
        [middlewareThatStopsExecution],
        {}
      )
      expect(result).toEqual({ stopped: true, finished: false })
    })
  })

  describe('next', () => {})
})
