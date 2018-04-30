// @flow
import type {
  IPromiseMiddleware,
  Action,
  Arguments,
  ActionMiddleware,
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
    let hardCodedResponse = undefined
    const res = (response: RT): void => {
      hardCodedResponse = response
    }

    let hardCodedError = undefined
    const rej = (error: ET): void => {
      hardCodedError = error
    }

    const requestMiddlewareResult = this._callRequestMiddleware({
      args,
      res,
      rej
    })

    // if any of the onRequest middleware asked to stop
    if (requestMiddlewareResult.canceled) {
      return
    }

    // if any of the onRequest middleware called setResponse we call on sucess middleware
    if (hardCodedResponse !== undefined) {
      this._callSuccessMiddleware({ args, res: hardCodedResponse })
      return
    }

    // if any of the onRequest middleware called setError we call on error middleware
    if (hardCodedError !== undefined) {
      this._callErrorMiddleware({ args, err: hardCodedError })
      return
    }

    // otherwise execute the action and either call onSuccess or onError middleware
    // if any of those middleware call stop, no further middleware will be executed
    this._action(...args).then(
      res => {
        this._callSuccessMiddleware({ args, res })
      },
      err => {
        this._callErrorMiddleware({ args, err })
      }
    )
  }

  onRequest(middleware: RequestMiddleware<Arguments<T>, RT, ET>) {
    this._middleware.onRequest = this._middleware.onRequest || []
    this._middleware.onRequest.push(middleware)
    return () =>
      this._middleware.onRequest.splice(
        this._middleware.onRequest.indexOf(middleware),
        1
      )
  }

  onSuccess(middleware: SuccessMiddleware<Arguments<T>, RT>) {
    this._middleware.onSuccess = this._middleware.onSuccess || []
    this._middleware.onSuccess.push(middleware)
    return () =>
      this._middleware.onSuccess.splice(
        this._middleware.onSuccess.indexOf(middleware),
        1
      )
  }

  onError(middleware: ErrorMiddleware<Arguments<T>, ET>) {
    this._middleware.onError = this._middleware.onError || []
    this._middleware.onError.push(middleware)
    return () =>
      this._middleware.onError.splice(
        this._middleware.onError.indexOf(middleware),
        1
      )
  }

  _callRequestMiddleware(event: RequestEvent<Arguments<T>, RT, ET>) {
    return this._callMiddleware(this._middleware.onRequest, event)
  }

  _callSuccessMiddleware(event: SuccessEvent<Arguments<T>, RT>) {
    return this._callMiddleware(this._middleware.onSuccess, event)
  }

  _callErrorMiddleware(event: ErrorEvent<Arguments<T>, ET>) {
    return this._callMiddleware(this._middleware.onError, event)
  }

  _callMiddleware(middleware: Array<*>, event: *): MiddlewareResult {
    if (middleware.length === 0) {
      return { finished: true, canceled: false }
    }

    const [thisMiddleware, ...restMiddleware] = middleware

    let canceled = false
    const stop = () => {
      canceled = true
    }

    thisMiddleware(event, stop)

    if (canceled) {
      return { canceled: true, finished: false }
    } else if (restMiddleware.length === 0) {
      return { finished: true, canceled: false }
    } else {
      return this._callMiddleware(restMiddleware, event)
    }
  }
}
