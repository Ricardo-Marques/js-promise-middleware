// @flow
import PromiseMiddleware from '../index'

describe('callMiddleware', () => {
  const fetcher = () => new Promise(() => {})

  let MyWrappedFetcher
  beforeAll(() => {
    MyWrappedFetcher = new PromiseMiddleware(fetcher)
  })

  describe('_callRequestMiddleware', () => {
    const event = { type: 'REQUEST', args: [] }
    it('returns a finished state if no middleware is given', () => {
      expect(MyWrappedFetcher._callRequestMiddleware([], event)).toEqual({
        finished: true,
        stopped: false
      })
    })

    it('calls the first middleware given with the event, stop, next and error callbacks', () => {
      const middleware = [
        (e, { stop, next, error }) => {
          expect(e).toEqual(event)
          expect(stop).toBeInstanceOf(Function)
          expect(next).toBeInstanceOf(Function)
          expect(error).toBeInstanceOf(Function)
        }
      ]
      MyWrappedFetcher._callRequestMiddleware([], event)
    })

    describe('if stop is called', () => {
      const middleware = [
        (e, { stop }) => {
          stop()
        }
      ]

      it('returns a stopped state', () => {
        expect(
          MyWrappedFetcher._callRequestMiddleware(middleware, event)
        ).toEqual({
          stopped: true,
          finished: false
        })
      })
    })

    describe('if next is called with data', () => {
      const data = {}
      const middleware = [
        (e, { next }) => {
          next(data)
        }
      ]

      it('returns a state with data', () => {
        expect(
          MyWrappedFetcher._callRequestMiddleware(middleware, event)
        ).toEqual({
          data,
          stopped: false,
          finished: false
        })
      })
    })

    describe('if error is called with an error', () => {
      const err = {}
      const middleware = [
        (e, { error }) => {
          error(err)
        }
      ]

      it('returns a state with an error', () => {
        expect(
          MyWrappedFetcher._callRequestMiddleware(middleware, event)
        ).toEqual({
          error: err,
          stopped: false,
          finished: false
        })
      })
    })

    describe('if no callbacks are called', () => {
      it('returns the result _callRequestMiddleware with the rest of the middleware', () => {
        const secondMiddleware = () => {}
        const middleware = [() => {}, secondMiddleware]
        expect(
          MyWrappedFetcher._callRequestMiddleware(middleware, event)
        ).toEqual(
          MyWrappedFetcher._callRequestMiddleware([secondMiddleware], event)
        )
      })
    })
  })

  describe('_callSuccessMiddleware', () => {
    const res = {}
    const event = { type: 'SUCCESS', args: [], res }
    it('returns a finished state if no middleware is given', () => {
      expect(MyWrappedFetcher._callSuccessMiddleware([], event)).toEqual({
        finished: true,
        stopped: false
      })
    })

    it('calls the first middleware given with the event, stop, next and error callbacks', () => {
      const middleware = [
        (e, { stop, next, error }) => {
          expect(e).toEqual(event)
          expect(stop).toBeInstanceOf(Function)
          expect(next).toBeInstanceOf(Function)
          expect(error).toBeInstanceOf(Function)
        }
      ]
      MyWrappedFetcher._callSuccessMiddleware([], event)
    })

    describe('if stop is called', () => {
      const middleware = [
        (e, { stop }) => {
          stop()
        }
      ]

      it('returns a stopped state', () => {
        expect(
          MyWrappedFetcher._callSuccessMiddleware(middleware, event)
        ).toEqual({
          stopped: true,
          finished: false
        })
      })
    })

    describe('if next is called with data', () => {
      const newData = {}
      const middleware = [
        (e, { next }) => {
          next(newData)
        }
      ]

      it('returns the result of continuing middleware execution with the new data', () => {
        expect(
          MyWrappedFetcher._callSuccessMiddleware(middleware, event)
        ).toEqual(
          MyWrappedFetcher._callSuccessMiddleware(middleware, {
            ...event,
            res: newData
          })
        )
      })
    })

    describe('if error is called with an error', () => {
      const err = {}
      const middleware = [
        (e, { error }) => {
          error(err)
        }
      ]

      it('returns the result of executing error middleware execution with the error', () => {
        expect(
          MyWrappedFetcher._callSuccessMiddleware(middleware, event)
        ).toEqual(
          MyWrappedFetcher._startErrorMiddleware({
            type: 'ERROR',
            args: [],
            err
          })
        )
      })
    })

    describe('if no callbacks are called', () => {
      it('returns the result _callSuccessMiddleware with the rest of the middleware', () => {
        const secondMiddleware = () => {}
        const middleware = [() => {}, secondMiddleware]
        expect(
          MyWrappedFetcher._callSuccessMiddleware(middleware, event)
        ).toEqual(
          MyWrappedFetcher._callSuccessMiddleware([secondMiddleware], event)
        )
      })
    })
  })

  describe('_callErrorMiddleware', () => {
    const err = {}
    const event = { type: 'ERROR', args: [], err }
    it('returns a finished state if no middleware is given', () => {
      expect(MyWrappedFetcher._callErrorMiddleware([], event)).toEqual({
        finished: true,
        stopped: false
      })
    })

    it('calls the first middleware given with the event, stop, next and error callbacks', () => {
      const middleware = [
        (e, { stop, next, error }) => {
          expect(e).toEqual(event)
          expect(stop).toBeInstanceOf(Function)
          expect(next).toBeInstanceOf(Function)
          expect(error).toBeInstanceOf(Function)
        }
      ]
      MyWrappedFetcher._callErrorMiddleware([], event)
    })

    describe('if stop is called', () => {
      const middleware = [
        (e, { stop }) => {
          stop()
        }
      ]

      it('returns a stopped state', () => {
        expect(
          MyWrappedFetcher._callErrorMiddleware(middleware, event)
        ).toEqual({
          stopped: true,
          finished: false
        })
      })
    })

    describe('if next is called with data', () => {
      const newData = {}
      const middleware = [
        (e, { next }) => {
          next(newData)
        }
      ]

      it('returns the result of executing success middleware execution with the data', () => {
        expect(
          MyWrappedFetcher._callErrorMiddleware(middleware, event)
        ).toEqual(
          MyWrappedFetcher._startSuccessMiddleware({
            type: 'SUCCESS',
            args: [],
            res: newData
          })
        )
      })
    })

    describe('if error is called with an error', () => {
      const err = {}
      const middleware = [
        (e, { error }) => {
          error(err)
        }
      ]

      it('returns the result of continuing middleware execution with the new error', () => {
        expect(
          MyWrappedFetcher._callErrorMiddleware(middleware, event)
        ).toEqual(
          MyWrappedFetcher._callErrorMiddleware(middleware, {
            ...event,
            err
          })
        )
      })
    })

    describe('if no callbacks are called', () => {
      it('returns the result _callErrorMiddleware with the rest of the middleware', () => {
        const secondMiddleware = () => {}
        const middleware = [() => {}, secondMiddleware]
        expect(
          MyWrappedFetcher._callErrorMiddleware(middleware, event)
        ).toEqual(
          MyWrappedFetcher._callErrorMiddleware([secondMiddleware], event)
        )
      })
    })
  })
})
