// @flow
import PromiseMiddleware from '../index'

describe('applyMiddleware', () => {
  const fetcher = () => new Promise(() => {})

  let MyWrappedFetcher
  beforeAll(() => {
    MyWrappedFetcher = new PromiseMiddleware(fetcher)
  })

  describe('onRequest', () => {
    it('adds onRequest middleware', () => {
      const middleware = () => {}
      MyWrappedFetcher.onRequest(middleware)
      expect(MyWrappedFetcher._middleware.onRequest).toEqual([middleware])
    })

    it('returns an cb to unsubscribe the middleware', () => {
      const middleware = () => {}
      MyWrappedFetcher._middleware.onRequest = []
      const unsubscribe = MyWrappedFetcher.onRequest(middleware)
      unsubscribe()
      expect(MyWrappedFetcher._middleware.onRequest).toEqual([])
    })
  })

  describe('onSuccess', () => {
    it('adds onSuccess middleware', () => {
      const middleware = () => {}
      MyWrappedFetcher.onSuccess(middleware)
      expect(MyWrappedFetcher._middleware.onSuccess).toEqual([middleware])
    })

    it('returns an cb to unsubscribe the middleware', () => {
      const middleware = () => {}
      MyWrappedFetcher._middleware.onSuccess = []
      const unsubscribe = MyWrappedFetcher.onSuccess(middleware)
      unsubscribe()
      expect(MyWrappedFetcher._middleware.onSuccess).toEqual([])
    })
  })

  describe('onError', () => {
    it('adds onError middleware', () => {
      const middleware = () => {}
      MyWrappedFetcher.onError(middleware)
      expect(MyWrappedFetcher._middleware.onError).toEqual([middleware])
    })

    it('returns an cb to unsubscribe the middleware', () => {
      const middleware = () => {}
      MyWrappedFetcher._middleware.onError = []
      const unsubscribe = MyWrappedFetcher.onError(middleware)
      unsubscribe()
      expect(MyWrappedFetcher._middleware.onError).toEqual([])
    })
  })
})
