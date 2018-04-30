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

      const eventProperties = {}
      MyWrappedFetcher._callRequestMiddleware(eventProperties)

      assert.calledOnce(MyWrappedFetcher._callMiddleware)
      assert.calledWith(
        MyWrappedFetcher._callMiddleware,
        [middleware],
        eventProperties
      )
    })
  })

  describe('_callSuccessMiddleware', () => {
    it('runs onSuccess middleware passing in the event properties', () => {
      sandbox.spy(MyWrappedFetcher, '_callMiddleware')

      const middleware = () => {}
      MyWrappedFetcher._middleware.onSuccess = [middleware]

      const eventProperties = {}
      MyWrappedFetcher._callSuccessMiddleware(eventProperties)

      assert.calledOnce(MyWrappedFetcher._callMiddleware)
      assert.calledWith(
        MyWrappedFetcher._callMiddleware,
        [middleware],
        eventProperties
      )
    })
  })

  describe('_callErrorMiddleware', () => {
    it('runs onError middleware passing in the event properties', () => {
      sandbox.spy(MyWrappedFetcher, '_callMiddleware')

      const middleware = () => {}
      MyWrappedFetcher._middleware.onError = [middleware]

      const eventProperties = {}
      MyWrappedFetcher._callErrorMiddleware(eventProperties)

      assert.calledOnce(MyWrappedFetcher._callMiddleware)
      assert.calledWith(
        MyWrappedFetcher._callMiddleware,
        [middleware],
        eventProperties
      )
    })
  })
})
