import Promise from 'promise'
import sinon, { assert } from 'sinon'

import PromiseMiddleware from '../index'

describe('execute', () => {
  let MyWrappedFetcher
  const sandbox = sinon.sandbox.create()

  const fetcher = () => new Promise(() => {})

  beforeAll(() => {
    MyWrappedFetcher = new PromiseMiddleware(fetcher)
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('calls _onRequest, giving the arguments, a res and a rej function', () => {
    let args = []
    sandbox.stub(MyWrappedFetcher, '_onRequest').callsFake(({ args, res, rej }) => {
      expect(args).toEqual(args)
      expect(res).toBeInstanceOf(Function)
      expect(rej).toBeInstanceOf(Function)
      return {}
    })
    MyWrappedFetcher.execute(...args)
    assert.calledOnce(MyWrappedFetcher._onRequest)
  })

  describe('if res is called', () => {
    const response = {}
    let args = []
    beforeEach(() => {
      sandbox.stub(MyWrappedFetcher, '_onRequest').callsFake(({ res }) => {
        res(response)
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

  describe('if rej is called', () => {
    const error = {}
    let args = []
    beforeEach(() => {
      sandbox.stub(MyWrappedFetcher, '_onRequest').callsFake(({ rej }) => {
        rej(error)
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

  describe('if the action gets called', () => {
    let args = []

    afterEach(() => {
      sandbox.restore()
    })

    describe('if it resolves', () => {
      it('calls _onSuccess with the arguments and the response', (done) => {
        const response = {}
        const MyWrappedFetcher = new PromiseMiddleware(() => new Promise(res => {
          res(response)
          setTimeout(() => {
            try {
              assert.calledOnce(MyWrappedFetcher._onSuccess)
              assert.calledWith(MyWrappedFetcher._onSuccess, {
                args,
                res: response
              })
              done()
            } catch (e) {
              done(e)
            }
          })
        }))

        sandbox.spy(MyWrappedFetcher, '_onSuccess')
        sandbox.stub(MyWrappedFetcher, '_onRequest').returns({})
        MyWrappedFetcher.execute(...args)
      })
    })

    describe('if it fails', () => {
      it('calls _onError with the arguments and the error', (done) => {
        const error = {}
        const MyWrappedFetcher = new PromiseMiddleware(() => new Promise((res, rej) => {
          rej(error)
          setTimeout(() => {
            try {
              assert.calledOnce(MyWrappedFetcher._onError)
              assert.calledWith(MyWrappedFetcher._onError, {
                args,
                err: error
              })
              done()
            } catch (e) {
              done(e)
            }
          })
        }))

        sandbox.spy(MyWrappedFetcher, '_onError')
        sandbox.stub(MyWrappedFetcher, '_onRequest').returns({})
        MyWrappedFetcher.execute(...args)
      })
    })
  })
})
