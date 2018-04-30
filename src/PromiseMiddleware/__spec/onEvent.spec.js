import sinon, { assert } from 'sinon'

import PromiseMiddleware from '../index'

describe('onEvent', () => {
  const sandbox = sinon.sandbox.create()
  const fetcher = () => new Promise(() => {})
  let MyWrappedFetcher

  beforeAll(() => {
    MyWrappedFetcher = new PromiseMiddleware(fetcher)
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('_callRequestMiddleware', () => {
    it('runs onRequest middleware passing in the event properties', () => {
      sandbox.spy(MyWrappedFetcher, '_callMiddleware')

      const middleware = () => {}
      MyWrappedFetcher._middleware.onRequest = [middleware]

      const event = {}
      MyWrappedFetcher._callRequestMiddleware(event)

      assert.calledOnce(MyWrappedFetcher._callMiddleware)
      assert.calledWith(
        MyWrappedFetcher._callMiddleware,
        [middleware],
        event
      )
    })
  })

  describe('_callSuccessMiddleware', () => {
    it('runs onSuccess middleware passing in the event properties', () => {
      sandbox.spy(MyWrappedFetcher, '_callMiddleware')

      const middleware = () => {}
      MyWrappedFetcher._middleware.onSuccess = [middleware]

      const event = {}
      MyWrappedFetcher._callSuccessMiddleware(event)

      assert.calledOnce(MyWrappedFetcher._callMiddleware)
      assert.calledWith(
        MyWrappedFetcher._callMiddleware,
        [middleware],
        event
      )
    })
  })

  describe('_callErrorMiddleware', () => {
    it('runs onError middleware passing in the event properties', () => {
      sandbox.spy(MyWrappedFetcher, '_callMiddleware')

      const middleware = () => {}
      MyWrappedFetcher._middleware.onError = [middleware]

      const event = {}
      MyWrappedFetcher._callErrorMiddleware(event)

      assert.calledOnce(MyWrappedFetcher._callMiddleware)
      assert.calledWith(
        MyWrappedFetcher._callMiddleware,
        [middleware],
        event
      )
    })
  })
})
