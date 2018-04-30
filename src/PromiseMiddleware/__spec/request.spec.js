import sinon, { assert } from 'sinon'

import PromiseMiddleware from '../index'

describe('request', () => {
  let MyWrappedFetcher
  const sandbox = sinon.sandbox.create()

  const fetcher = () => new Promise(() => {})

  beforeAll(() => {
    MyWrappedFetcher = new PromiseMiddleware(fetcher)
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('calls _callRequestMiddleware, giving the arguments', () => {
    let args = []
    sandbox
      .stub(MyWrappedFetcher, '_callRequestMiddleware')
      .callsFake(({ args }) => {
        expect(args).toEqual(args)
        return {}
      })
    MyWrappedFetcher.request(...args)
    assert.calledOnce(MyWrappedFetcher._callRequestMiddleware)
  })

  describe('if _callRequestMiddleware returns { stopped: true }', () => {
    let args = []
    beforeEach(() => {
      sandbox
        .stub(MyWrappedFetcher, '_callRequestMiddleware')
        .returns({ stopped: true })
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('does not call _callSuccessMiddleware', () => {
      sandbox.spy(MyWrappedFetcher, '_callSuccessMiddleware')
      MyWrappedFetcher.request(...args)
      assert.notCalled(MyWrappedFetcher._callSuccessMiddleware)
    })

    it('does not call _callErrorMiddleware', () => {
      sandbox.spy(MyWrappedFetcher, '_callErrorMiddleware')
      MyWrappedFetcher.request(...args)
      assert.notCalled(MyWrappedFetcher._callErrorMiddleware)
    })

    it('does not call _action', () => {
      sandbox.spy(MyWrappedFetcher, '_action')
      MyWrappedFetcher.request(...args)
      assert.notCalled(MyWrappedFetcher._action)
    })
  })

  describe('if _callRequestMiddleware returns { data: * }', () => {
    const data = {}
    let args = []
    beforeEach(() => {
      sandbox.stub(MyWrappedFetcher, '_callRequestMiddleware').returns({ data })
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('calls _callSuccessMiddleware with that data set as the response', () => {
      sandbox.spy(MyWrappedFetcher, '_callSuccessMiddleware')
      MyWrappedFetcher.request(...args)
      assert.calledWith(MyWrappedFetcher._callSuccessMiddleware, {
        args,
        res: data
      })
    })

    it('does not call _callErrorMiddleware', () => {
      sandbox.spy(MyWrappedFetcher, '_callErrorMiddleware')
      MyWrappedFetcher.request(...args)
      assert.notCalled(MyWrappedFetcher._callErrorMiddleware)
    })

    it('does not call _action', () => {
      sandbox.spy(MyWrappedFetcher, '_action')
      MyWrappedFetcher.request(...args)
      assert.notCalled(MyWrappedFetcher._action)
    })
  })

  describe('otherwise the wrapped action gets called', () => {
    let args = []

    afterEach(() => {
      sandbox.restore()
    })

    describe('if it resolves', () => {
      it('calls _callSuccessMiddleware with the arguments and the response', done => {
        const response = {}
        const MyWrappedFetcher = new PromiseMiddleware(
          () =>
            new Promise(res => {
              res(response)
              setTimeout(() => {
                try {
                  assert.calledOnce(MyWrappedFetcher._callSuccessMiddleware)
                  assert.calledWith(MyWrappedFetcher._callSuccessMiddleware, {
                    args,
                    res: response
                  })
                  done()
                } catch (e) {
                  done(e)
                }
              })
            })
        )

        sandbox.spy(MyWrappedFetcher, '_callSuccessMiddleware')
        sandbox.stub(MyWrappedFetcher, '_callRequestMiddleware').returns({})
        MyWrappedFetcher.request(...args)
      })
    })

    describe('if it fails', () => {
      it('calls _callErrorMiddleware with the arguments and the error', done => {
        const error = {}
        const MyWrappedFetcher = new PromiseMiddleware(
          () =>
            new Promise((res, rej) => {
              rej(error)
              setTimeout(() => {
                try {
                  assert.calledOnce(MyWrappedFetcher._callErrorMiddleware)
                  assert.calledWith(MyWrappedFetcher._callErrorMiddleware, {
                    args,
                    err: error
                  })
                  done()
                } catch (e) {
                  done(e)
                }
              })
            })
        )

        sandbox.spy(MyWrappedFetcher, '_callErrorMiddleware')
        sandbox.stub(MyWrappedFetcher, '_callRequestMiddleware').returns({})
        MyWrappedFetcher.request(...args)
      })
    })
  })
})
