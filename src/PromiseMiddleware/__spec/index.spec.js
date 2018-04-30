import PromiseMiddleware from '../index'

describe('PromiseMiddlware', () => {
  const fetcher = () => new Promise(() => {})

  let MyWrappedFetcher
  beforeAll(() => {
    MyWrappedFetcher = new PromiseMiddleware(fetcher)
  })

  describe('on construct', () => {
    it('stores the given action', () => {
      expect(MyWrappedFetcher._action).toEqual(fetcher)
    })

    it('initializes an empty middleware cache', () => {
      expect(MyWrappedFetcher._middleware).toEqual({
        onRequest: [],
        onSuccess: [],
        onError: []
      })
    })
  })
})
