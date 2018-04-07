import Promise from 'promise'
import PromiseMiddleware from './index'
import sinon, { assert }  from 'sinon'

describe('PromiseMiddlware', () => {
  const sandbox = sinon.sandbox.create()

  const fetcher = () => new Promise(() => {})
  let MyWrappedFetcher

  beforeAll(() => {
    MyWrappedFetcher = new PromiseMiddleware(fetcher)
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('on construct', () => {
    it('stores the given action', () => {
      expect(MyWrappedFetcher._action).toEqual(fetcher)
    })
  })

  describe('public methods', () => {
    afterEach(() => {
      sandbox.restore()
    })

    describe('execute', () => {
      it('calls _onRequest, giving the arguments, a setResponse and a setError function', () => {
        sandbox.spy(MyWrappedFetcher, '_onRequest')
        let args = [1, 'foo', 'bar', 'please']
        MyWrappedFetcher.execute(...args)
        assert.calledOnce(MyWrappedFetcher._onRequest)
        assert.calledWith(MyWrappedFetcher._onRequest, {
          args,
          setResponse: function setResponse () {},
          setError: function setError () {}
        })
      })
    })
  })
})
