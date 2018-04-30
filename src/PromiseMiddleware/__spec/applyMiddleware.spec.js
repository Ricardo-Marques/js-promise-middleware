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
  })

  describe('onSuccess', () => {
    it('adds onSuccess middleware', () => {
      const middleware = () => {}
      MyWrappedFetcher.onSuccess(middleware)
      expect(MyWrappedFetcher._middleware.onSuccess).toEqual([middleware])
    })
  })

  describe('onError', () => {
    it('adds onError middleware', () => {
      const middleware = () => {}
      MyWrappedFetcher.onError(middleware)
      expect(MyWrappedFetcher._middleware.onError).toEqual([middleware])
    })
  })
})
