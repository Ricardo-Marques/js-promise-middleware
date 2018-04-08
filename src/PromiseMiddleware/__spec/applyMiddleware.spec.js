import Promise from 'promise'
import PromiseMiddleware from '../index'

describe('applyMiddleware', () => {
  const fetcher = () => new Promise(() => {})

  let MyWrappedFetcher
  beforeAll(() => {
    MyWrappedFetcher = new PromiseMiddleware(fetcher)
  })

  describe('applyOnRequestMiddleware', () => {
    it('adds onRequestMiddleware', () => {
      const middleware = () => {}
      MyWrappedFetcher.applyOnRequestMiddleware(middleware)
      expect(MyWrappedFetcher._middleware.onRequest).toEqual([middleware])
    })
  })

  describe('applyOnSuccessMiddleware', () => {
    it('adds onSuccessMiddleware', () => {
      const middleware = () => {}
      MyWrappedFetcher.applyOnSuccessMiddleware(middleware)
      expect(MyWrappedFetcher._middleware.onSuccess).toEqual([middleware])
    })
  })

  describe('applyOnErrorMiddleware', () => {
    it('adds onErrorMiddleware', () => {
      const middleware = () => {}
      MyWrappedFetcher.applyOnErrorMiddleware(middleware)
      expect(MyWrappedFetcher._middleware.onError).toEqual([middleware])
    })
  })
})
