// @flow
import type {
  IPromiseMiddleware,
  Action,
  Arguments,
  QueuedMiddlware,
  RequestMiddleware,
  SuccessMiddleware,
  ErrorMiddleware,
  RequestEvent,
  SuccessEvent,
  ErrorEvent,
  MiddlewareResult
} from './_types'

export default class PromiseMiddleware<T: Action, RT, ET>
  implements IPromiseMiddleware<T, RT, ET> {
  _action: T
  _middleware: QueuedMiddlware<Arguments<T>, RT, ET>

  constructor(action: T) {
    this._action = action
    this._middleware = {
      onRequest: [],
      onSuccess: [],
      onError: []
    }
  }

  request(...args: Arguments<T>) {
    const requestMiddlewareResult = this._startRequestMiddleware({
      type: 'REQUEST',
      args
    })

    // if any of the onRequest middleware asked to stop
    if (requestMiddlewareResult.stopped) {
      return
    }

    // if any of the onRequest middleware called next with some data we call on sucess middleware
    if (requestMiddlewareResult.data != null) {
      this._startSuccessMiddleware({
        type: 'SUCCESS',
        args,
        res: requestMiddlewareResult.data
      })
      return
    }

    // if any of the onRequest middleware called setError we call on error middleware
    if (requestMiddlewareResult.error != null) {
      this._startErrorMiddleware({
        type: 'ERROR',
        args,
        err: requestMiddlewareResult.error
      })
      return
    }

    // otherwise execute the action and either call onSuccess or onError middleware
    // if any of those middleware call stop, no further middleware will be executed
    this._action(...args).then(
      (res: RT) => {
        // in any of the onSuccess middleware, calling next with data will call the next middleware
        // with that data instead of the data given here
        this._startSuccessMiddleware({ type: 'SUCCESS', args, res })
      },
      (err: ET) => {
        // in any of the onError middleware, calling error with an error will call the next middleware
        // with that error, instead of the error given here
        this._startErrorMiddleware({ type: 'ERROR', args, err })
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

  _startRequestMiddleware(
    event: RequestEvent<Arguments<T>>
  ): MiddlewareResult<RT, ET> {
    return this._callRequestMiddleware(this._middleware.onRequest, event)
  }

  _startSuccessMiddleware(
    event: SuccessEvent<Arguments<T>, RT>
  ): MiddlewareResult<RT, ET> {
    return this._callSuccessMiddleware(this._middleware.onSuccess, event)
  }

  _startErrorMiddleware(
    event: ErrorEvent<Arguments<T>, ET>
  ): MiddlewareResult<RT, ET> {
    return this._callErrorMiddleware(this._middleware.onError, event)
  }

  _callRequestMiddleware(
    middleware: Array<RequestMiddleware<Arguments<T>, RT, ET>>,
    event: RequestEvent<Arguments<T>>
  ): MiddlewareResult<RT, ET> {
    if (middleware.length === 0) {
      return { finished: true, stopped: false }
    }

    const [firstMiddleware, ...restMiddleware] = middleware

    let stopped = false
    const stop = () => {
      stopped = true
    }

    let parsedData: ?RT = null
    let next = (data: RT) => {
      parsedData = data
    }

    let thrownError: ?ET = null
    let error = (error: ET) => {
      thrownError = error
    }

    firstMiddleware(event, { stop, next, error })

    if (stopped) {
      return { finished: false, stopped: true }
    }

    if (parsedData != null) {
      return { data: parsedData, finished: false, stopped: false }
    }

    if (thrownError != null) {
      return { error: thrownError, finished: false, stopped: false }
    }

    return this._callRequestMiddleware(restMiddleware, event)
  }

  _callSuccessMiddleware(
    middleware: Array<SuccessMiddleware<Arguments<T>, RT, ET>>,
    event: SuccessEvent<Arguments<T>, RT>
  ): MiddlewareResult<RT, ET> {
    if (middleware.length === 0) {
      return { finished: true, stopped: false }
    }

    const [firstMiddleware, ...restMiddleware] = middleware

    let stopped = false
    const stop = () => {
      stopped = true
    }

    let parsedData: ?RT = null
    let next = (data: RT) => {
      parsedData = data
    }

    let thrownError: ?ET = null
    let error = (error: ET) => {
      thrownError = error
    }

    firstMiddleware(event, { stop, next, error })

    if (stopped) {
      return { finished: false, stopped: true }
    }

    if (parsedData != null) {
      event.res = parsedData
      return this._callSuccessMiddleware(restMiddleware, event)
    }

    if (thrownError != null) {
      return this._startErrorMiddleware({
        type: 'ERROR',
        args: event.args,
        err: thrownError
      })
    }

    return this._callSuccessMiddleware(restMiddleware, event)
  }

  _callErrorMiddleware(
    middleware: Array<ErrorMiddleware<Arguments<T>, RT, ET>>,
    event: ErrorEvent<Arguments<T>, ET>
  ): MiddlewareResult<RT, ET> {
    if (middleware.length === 0) {
      return { finished: true, stopped: false }
    }

    const [firstMiddleware, ...restMiddleware] = middleware

    let stopped = false
    const stop = () => {
      stopped = true
    }

    let parsedData: ?RT = null
    let next = (data: RT) => {
      parsedData = data
    }

    let thrownError: ?ET = null
    let error = (error: ET) => {
      thrownError = error
    }

    firstMiddleware(event, { stop, next, error })

    if (stopped) {
      return { finished: false, stopped: true }
    }

    if (parsedData != null) {
      return this._startSuccessMiddleware({
        type: 'SUCCESS',
        args: event.args,
        res: parsedData
      })
    }

    if (thrownError != null) {
      event.err = thrownError
      return this._callErrorMiddleware(restMiddleware, event)
    }

    return this._callErrorMiddleware(restMiddleware, event)
  }
}
