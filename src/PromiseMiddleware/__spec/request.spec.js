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

  it('calls _startRequestMiddleware, giving the arguments', () => {
    let args = []
    sandbox
      .stub(MyWrappedFetcher, '_startRequestMiddleware')
      .callsFake(({ args }) => {
        expect(args).toEqual(args)
        return {}
      })
    MyWrappedFetcher.request(...args)
    assert.calledOnce(MyWrappedFetcher._startRequestMiddleware)
  })

  describe('if _startRequestMiddleware returns { stopped: true }', () => {
    let args = []
    beforeEach(() => {
      sandbox
        .stub(MyWrappedFetcher, '_startRequestMiddleware')
        .returns({ stopped: true })
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('does not call _startSuccessMiddleware', () => {
      sandbox.spy(MyWrappedFetcher, '_startSuccessMiddleware')
      MyWrappedFetcher.request(...args)
      assert.notCalled(MyWrappedFetcher._startSuccessMiddleware)
    })

    it('does not call _startErrorMiddleware', () => {
      sandbox.spy(MyWrappedFetcher, '_startErrorMiddleware')
      MyWrappedFetcher.request(...args)
      assert.notCalled(MyWrappedFetcher._startErrorMiddleware)
    })

    it('does not call _action', () => {
      sandbox.spy(MyWrappedFetcher, '_action')
      MyWrappedFetcher.request(...args)
      assert.notCalled(MyWrappedFetcher._action)
    })
  })

  describe('if _startRequestMiddleware returns { data: * }', () => {
    const data = {}
    let args = []
    beforeEach(() => {
      sandbox
        .stub(MyWrappedFetcher, '_startRequestMiddleware')
        .returns({ data })
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('calls _startSuccessMiddleware with that data set as the response', () => {
      sandbox.spy(MyWrappedFetcher, '_startSuccessMiddleware')
      MyWrappedFetcher.request(...args)
      assert.calledWith(MyWrappedFetcher._startSuccessMiddleware, {
        type: 'SUCCESS',
        args,
        res: data
      })
    })

    it('does not call _startErrorMiddleware', () => {
      sandbox.spy(MyWrappedFetcher, '_startErrorMiddleware')
      MyWrappedFetcher.request(...args)
      assert.notCalled(MyWrappedFetcher._startErrorMiddleware)
    })

    it('does not call _action', () => {
      sandbox.spy(MyWrappedFetcher, '_action')
      MyWrappedFetcher.request(...args)
      assert.notCalled(MyWrappedFetcher._action)
    })
  })

  describe('if _startRequestMiddleware returns { error: * }', () => {
    const error = {}
    let args = []
    beforeEach(() => {
      sandbox
        .stub(MyWrappedFetcher, '_startRequestMiddleware')
        .returns({ error })
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('calls _startErrorMiddleware with that error set as the err', () => {
      sandbox.spy(MyWrappedFetcher, '_startErrorMiddleware')
      MyWrappedFetcher.request(...args)
      assert.calledWith(MyWrappedFetcher._startErrorMiddleware, {
        type: 'ERROR',
        args,
        err: error
      })
    })

    it('does not call _startSuccessMiddlewareMiddleware', () => {
      sandbox.spy(MyWrappedFetcher, '_startSuccessMiddleware')
      MyWrappedFetcher.request(...args)
      assert.notCalled(MyWrappedFetcher._startSuccessMiddleware)
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
      it('calls _startSuccessMiddleware with the arguments and the response', done => {
        const response = {}
        const MyWrappedFetcher = new PromiseMiddleware(
          () =>
            new Promise(res => {
              res(response)
              setTimeout(() => {
                try {
                  assert.calledOnce(MyWrappedFetcher._startSuccessMiddleware)
                  assert.calledWith(MyWrappedFetcher._startSuccessMiddleware, {
                    type: 'SUCCESS',
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

        sandbox.spy(MyWrappedFetcher, '_startSuccessMiddleware')
        sandbox.stub(MyWrappedFetcher, '_startRequestMiddleware').returns({})
        MyWrappedFetcher.request(...args)
      })
    })

    describe('if it fails', () => {
      it('calls _startErrorMiddleware with the arguments and the error', done => {
        const error = {}
        const MyWrappedFetcher = new PromiseMiddleware(
          () =>
            new Promise((res, rej) => {
              rej(error)
              setTimeout(() => {
                try {
                  assert.calledOnce(MyWrappedFetcher._startErrorMiddleware)
                  assert.calledWith(MyWrappedFetcher._startErrorMiddleware, {
                    type: 'ERROR',
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

        sandbox.spy(MyWrappedFetcher, '_startErrorMiddleware')
        sandbox.stub(MyWrappedFetcher, '_startRequestMiddleware').returns({})
        MyWrappedFetcher.request(...args)
      })
    })
  })
})
