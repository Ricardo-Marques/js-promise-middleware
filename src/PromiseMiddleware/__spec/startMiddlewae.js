// @flow
import sinon, { assert } from 'sinon'

import PromiseMiddleware from '../index'

describe('startMiddleware', () => {
  const sandbox = sinon.sandbox.create()
  const fetcher = () => new Promise(() => {})
  let MyWrappedFetcher

  beforeAll(() => {
    MyWrappedFetcher = new PromiseMiddleware(fetcher)
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('_startRequestMiddleware', () => {
    it('runs onRequest middleware passing in the event properties', () => {
      sandbox.spy(MyWrappedFetcher, '_callMiddleware')

      const middleware = () => {}
      MyWrappedFetcher._middleware.onRequest = [middleware]

      const event = {
        type: 'REQUEST',
        args: []
      }
      MyWrappedFetcher._startRequestMiddleware(event)

      assert.calledOnce(MyWrappedFetcher._callRequestMiddleware)
      assert.calledWith(
        MyWrappedFetcher._callRequestMiddleware,
        [middleware],
        event
      )
    })
  })

  describe('_startSuccessMiddleware', () => {
    it('runs onSuccess middleware passing in the event properties', () => {
      sandbox.spy(MyWrappedFetcher, '_callMiddleware')

      const middleware = () => {}
      MyWrappedFetcher._middleware.onSuccess = [middleware]

      const event = {
        type: 'SUCCESS',
        args: [],
        res: {}
      }
      MyWrappedFetcher._startSuccessMiddleware(event)

      assert.calledOnce(MyWrappedFetcher._callSuccessMiddleware)
      assert.calledWith(
        MyWrappedFetcher._callSuccessMiddleware,
        [middleware],
        event
      )
    })
  })

  describe('_startErrorMiddleware', () => {
    it('runs onError middleware passing in the event properties', () => {
      sandbox.spy(MyWrappedFetcher, '_callMiddleware')

      const middleware = () => {}
      MyWrappedFetcher._middleware.onError = [middleware]

      const event = {
        type: 'ERROR',
        args: [],
        err: {}
      }
      MyWrappedFetcher._startErrorMiddleware(event)

      assert.calledOnce(MyWrappedFetcher._callErrorMiddleware)
      assert.calledWith(
        MyWrappedFetcher._callErrorMiddleware,
        [middleware],
        event
      )
    })
  })
})
