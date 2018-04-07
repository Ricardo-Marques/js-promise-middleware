import Promise from 'promise'
import PromiseMiddleware from './index'
import sinon, { assert, match }  from 'sinon'

describe('PromiseMiddlware', () => {
  const sandbox = sinon.sandbox.create()

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
      expect(MyWrappedFetcher._middleware).toEqual({})
    })
  })

  describe('public methods', () => {
    describe('execute', () => {
      afterEach(() => {
        sandbox.restore()
      })

      it('calls _onRequest, giving the arguments, a setResponse and a setError function', () => {
        sandbox.spy(MyWrappedFetcher, '_onRequest')
        let args = []
        MyWrappedFetcher.execute(...args)
        assert.calledOnce(MyWrappedFetcher._onRequest)
        assert.calledWith(MyWrappedFetcher._onRequest, match({ args }))
      })

      describe('if setResponse is called', () => {
        const response = {}
        let args = []
        beforeEach(() => {
          sandbox.stub(MyWrappedFetcher, '_onRequest').callsFake(({ setResponse }) => {
            setResponse(response)
            return {}
          })
        })

        afterEach(() => {
          sandbox.restore()
        })

        it('calls _onSuccess with the arguments and the provided response', () => {
          sandbox.spy(MyWrappedFetcher, '_onSuccess')

          MyWrappedFetcher.execute(...args)

          assert.calledOnce(MyWrappedFetcher._onSuccess)
          assert.calledWith(MyWrappedFetcher._onSuccess, {
            args,
            res: response
          })
        })

        it('does not execute the action', () => {
          sandbox.spy(MyWrappedFetcher, '_action')

          MyWrappedFetcher.execute(...args)

          assert.notCalled(MyWrappedFetcher._action)
        })
      })

      describe('if setError is called', () => {
        const error = {}
        let args = []
        beforeEach(() => {
          sandbox.stub(MyWrappedFetcher, '_onRequest').callsFake(({ setError }) => {
            setError(error)
            return {}
          })
        })

        afterEach(() => {
          sandbox.restore()
        })

        it('calls _onError with the arguments and the provided error', () => {
          sandbox.spy(MyWrappedFetcher, '_onError')

          MyWrappedFetcher.execute(...args)

          assert.calledOnce(MyWrappedFetcher._onError)
          assert.calledWith(MyWrappedFetcher._onError, {
            args,
            err: error
          })
        })

        it('does not execute the action', () => {
          sandbox.spy(MyWrappedFetcher, '_action')

          MyWrappedFetcher.execute(...args)

          assert.notCalled(MyWrappedFetcher._action)
        })
      })

      describe('if _onRequest returns { wasStopped: true }', () => {
        let args = []
        beforeEach(() => {
          sandbox.stub(MyWrappedFetcher, '_onRequest').returns({ wasStopped: true })
        })

        afterEach(() => {
          sandbox.restore()
        })

        it('does not call _onSuccess', () => {
          sandbox.spy(MyWrappedFetcher, '_onSuccess')
          MyWrappedFetcher.execute(...args)
          assert.notCalled(MyWrappedFetcher._onSuccess)
        })

        it('does not call _onError', () => {
          sandbox.spy(MyWrappedFetcher, '_onError')
          MyWrappedFetcher.execute(...args)
          assert.notCalled(MyWrappedFetcher._onError)
        })

        it('does not call _action', () => {
          sandbox.spy(MyWrappedFetcher, '_action')
          MyWrappedFetcher.execute(...args)
          assert.notCalled(MyWrappedFetcher._action)
        })
      })
    })
  })
})
