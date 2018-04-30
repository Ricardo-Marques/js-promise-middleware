// @flow
import type {
  IPromiseMiddleware,
  Action,
  Arguments,
  ActionMiddleware,
  RequestMiddleware,
  SuccessMiddleware,
  ErrorMiddleware,
  Event,
  RequestEvent,
  SuccessEvent,
  ErrorEvent,
  MiddlewareResult
} from './_types'

export default class PromiseMiddleware<T: Action, RT, ET>
  implements IPromiseMiddleware<T, RT, ET> {
  _action: T
  _middleware: ActionMiddleware<Arguments<T>, RT, ET>

  constructor(action: T) {
    this._action = action
    this._middleware = {
      onRequest: [],
      onSuccess: [],
      onError: []
    }
  }

  request(...args: Arguments<T>) {
    const requestMiddlewareResult = this._callRequestMiddleware({ args })

    // if any of the onRequest middleware asked to stop
    if (requestMiddlewareResult.stopped) {
      return
    }

    // if any of the onRequest middleware called next with some data we call on sucess middleware
    if (requestMiddlewareResult.data != null) {
      this._callSuccessMiddleware({
        args,
        res: requestMiddlewareResult.data
      })
      return
    }

    // if any of the onRequest middleware called setError we call on error middleware
    if (requestMiddlewareResult.error != null) {
      this._callErrorMiddleware({ args, err: requestMiddlewareResult.error })
      return
    }

    // otherwise execute the action and either call onSuccess or onError middleware
    // if any of those middleware call stop, no further middleware will be executed
    this._action(...args).then(
      res => {
        // in any of the onSuccess middleware, calling next with data will call the next middleware
        // with that data instead of the data given here
        this._callSuccessMiddleware({ args, res })
      },
      err => {
        // in any of the onError middleware, calling error with an error will call the next middleware
        // with that error, instead of the error given here
        this._callErrorMiddleware({ args, err })
      }
    )
  }

  onRequest(middleware: RequestMiddleware<Arguments<T>, RT, ET>) {
    this._middleware.onRequest.push(middleware)
    return () => {
      this._middleware.onRequest.splice(
        this._middleware.onRequest.indexOf(middleware),
        1
      )
    }
  }

  onSuccess(middleware: SuccessMiddleware<Arguments<T>, RT, ET>) {
    this._middleware.onSuccess.push(middleware)
    return () => {
      this._middleware.onSuccess.splice(
        this._middleware.onSuccess.indexOf(middleware),
        1
      )
    }
  }

  onError(middleware: ErrorMiddleware<Arguments<T>, RT, ET>) {
    this._middleware.onError.push(middleware)
    return () => {
      this._middleware.onError.splice(
        this._middleware.onError.indexOf(middleware),
        1
      )
    }
  }

  _callRequestMiddleware(event: RequestEvent<Arguments<T>>) {
    return this._callMiddleware(this._middleware.onRequest, event)
  }

  _callSuccessMiddleware(event: SuccessEvent<Arguments<T>, RT>) {
    return this._callMiddleware(this._middleware.onSuccess, event)
  }

  _callErrorMiddleware(event: ErrorEvent<Arguments<T>, ET>) {
    return this._callMiddleware(this._middleware.onError, event)
  }

  _callMiddleware(middleware: Array<*>, event: *): MiddlewareResult<RT, ET> {
    if (middleware.length === 0) {
      return { finished: true, stopped: false }
    }

    const [thisMiddleware, ...restMiddleware] = middleware

    let stopped = false
    const stop = () => {
      stopped = true
    }

    let parsedData = null
    let next = (data: RT) => {
      parsedData = data
    }

    let thrownError = null
    let error = (error: ET) => {
      thrownError = error
    }

    if (event.err != null) {
      thisMiddleware(event, { stop, error })
    } else if (event.res != null) {
      thisMiddleware(event, { stop, next })
    } else {
      thisMiddleware(event, { stop, next, error })
    }

    if (stopped) {
      return { finished: false, stopped: true }
    }

    if (parsedData != null) {
      // was already in success middelware
      if (event.res != null) {
        event.res = parsedData
      } else {
        return { data: parsedData, finished: false, stopped: false }
      }
    }

    if (thrownError != null) {
      // was already in error middelware
      if (event.err != null) {
        event.err = thrownError
      } else {
        return { error: thrownError, finished: false, stopped: false }
      }
    }

    if (restMiddleware.length === 0) {
      return { finished: true, stopped: false }
    }

    return this._callMiddleware(restMiddleware, event)
  }
}
