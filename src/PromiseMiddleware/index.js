// @flow
type EventProperties = {|
  onRequest: {| args: Array<*>, setResponse: (*) => void, setError: (*) => void |},
  onSuccess: {| args: Array<*>, res: * |},
  onError: {| args: Array<*>, err: * |}
|}

type MiddlewareTypes = {|
  onRequest: (eventProperties: $PropertyType<EventProperties, 'onRequest'>, stop: Stop) => void,
  onSuccess: (eventProperties: $PropertyType<EventProperties, 'onSuccess'>, stop: Stop) => void,
  onError: (eventProperties: $PropertyType<EventProperties, 'onError'>, stop: Stop) => void,
|}

type Stop = () => void

type ActionMiddleware = {
  onRequest?: ?Array<$PropertyType<MiddlewareTypes, 'onRequest'>>,
  onSuccess?: ?Array<$PropertyType<MiddlewareTypes, 'onSuccess'>>,
  onError?: ?Array<$PropertyType<MiddlewareTypes, 'onError'>>
}

type Action = (*) => Promise<*>

export default class PromiseMiddleware<T: Action> {
  _action: T
  _middleware: ActionMiddleware

  constructor (action: T) {
    this._action = action
    this._middleware = {}
  }

  execute (...args: Array<*>) {
    let hardCodedResponse = undefined
    const setResponse = res => hardCodedResponse = res

    let hardCodedError = undefined
    const setError = err => hardCodedError = err

    const requestMiddlewareResult = this._onRequest({ args, setResponse, setError })

    // if any of the onRequest middleware asked to stop
    if (requestMiddlewareResult.wasStopped) {
      return
    }

    // if any of the onRequest middleware called setResponse we call on sucess middleware
    if (hardCodedResponse !== undefined) {
      this._onSuccess({ args, res: hardCodedResponse })
      return
    }

    // if any of the onRequest middleware called setError we call on error middleware
    if (hardCodedError !== undefined) {
      this._onError({ args, err: hardCodedError })
      return
    }

    // otherwise execute the action and either call onSuccess or onError middleware
    // if any of those middleware call stop, no further middleware will be executed
    this._action(...args)
      .then(
        res => {
          this._onSuccess({ args, res })
        },
        err => {
          this._onError({ args, err })
        }
      )
  }

  applyOnRequestMiddleware (middleware: $PropertyType<MiddlewareTypes, 'onRequest'>) {
    this._middleware.onRequest = this._middleware.onRequest || []
    this._middleware.onRequest.push(middleware)
  }

  applyOnSuccessMiddleware (middleware: $PropertyType<MiddlewareTypes, 'onSuccess'>) {
    this._middleware.onSuccess = this._middleware.onSuccess || []
    this._middleware.onSuccess.push(middleware)
  }

  applyOnErrorMiddleware (middleware: $PropertyType<MiddlewareTypes, 'onError'>) {
    this._middleware.onError = this._middleware.onError || []
    this._middleware.onError.push(middleware)
  }

  _onRequest (eventProperties: $PropertyType<EventProperties, 'onRequest'>) {
    return this._callMiddleware(this._middleware.onRequest, eventProperties)
  }

  _onSuccess (eventProperties: $PropertyType<EventProperties, 'onSuccess'>) {
    return this._callMiddleware(this._middleware.onSuccess, eventProperties)
  }

  _onError (eventProperties: $PropertyType<EventProperties, 'onError'>) {
    return this._callMiddleware(this._middleware.onError, eventProperties)
  }

  _callMiddleware (middleware: ?Array<*>, eventProperties: *) {
    if (middleware == null || middleware.length === 0) {
      return { finished: true }
    }

    const [ thisMiddleware, ...restMiddleware ] = middleware

    let wasStopped = false
    const stop = () => {
      wasStopped = true
    }

    thisMiddleware(eventProperties, stop)

    if (wasStopped) {
      return { wasStopped: true }
    } else if (restMiddleware.length === 0) {
      return { finished: true }
    } else {
      return this._callMiddleware(restMiddleware, eventProperties)
    }
  }
}
