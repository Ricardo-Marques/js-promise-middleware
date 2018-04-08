import Promise from 'promise'
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

  describe('onRequest', () => {
    it('runs onRequest middlware passing in the event properties', () => {
      sandbox.spy(MyWrappedFetcher, '_callMiddleware')

      const middleware = () => {}
      MyWrappedFetcher._middleware.onRequest = [middleware]

      const eventProperties = {}
      MyWrappedFetcher._onRequest(eventProperties)

      assert.calledOnce(MyWrappedFetcher._callMiddleware)
      assert.calledWith(MyWrappedFetcher._callMiddleware, [middleware], eventProperties)
    })
  })

  describe('onSuccess', () => {
    it('runs onSuccess middlware passing in the event properties', () => {
      sandbox.spy(MyWrappedFetcher, '_callMiddleware')

      const middleware = () => {}
      MyWrappedFetcher._middleware.onSuccess = [middleware]

      const eventProperties = {}
      MyWrappedFetcher._onSuccess(eventProperties)

      assert.calledOnce(MyWrappedFetcher._callMiddleware)
      assert.calledWith(MyWrappedFetcher._callMiddleware, [middleware], eventProperties)
    })
  })

  describe('onError', () => {
    it('runs onError middlware passing in the event properties', () => {
      sandbox.spy(MyWrappedFetcher, '_callMiddleware')

      const middleware = () => {}
      MyWrappedFetcher._middleware.onError = [middleware]

      const eventProperties = {}
      MyWrappedFetcher._onError(eventProperties)

      assert.calledOnce(MyWrappedFetcher._callMiddleware)
      assert.calledWith(MyWrappedFetcher._callMiddleware, [middleware], eventProperties)
    })
  })
})
