// @flow
export type Action = (*) => Promise<*>

// extract arguments from a function type
/* eslint-disable-line no-unused-vars */
type Arguments_<A, F: (...args: A) => any> = A
export type Arguments<F> = Arguments_<*, F>

export type RequestEvent<A, RT, ET> = {|
  args: A,
  res: RT => void,
  rej: ET => void
|}
export type SuccessEvent<A, RT> = {| args: A, res: RT |}
export type ErrorEvent<A, ET> = {| args: A, err: ET |}

export type RequestMiddleware<A, RT, ET> = (
  RequestEvent<A, RT, ET>,
  Stop
) => void
export type SuccessMiddleware<A, RT> = (SuccessEvent<A, RT>, Stop) => void
export type ErrorMiddleware<A, ET> = (ErrorEvent<A, ET>, Stop) => void

export type ActionMiddleware<A, RT, ET> = {|
  onRequest?: ?(RequestMiddleware<A, RT, ET>[]),
  onSuccess?: ?(SuccessMiddleware<A, RT>[]),
  onError?: ?(ErrorMiddleware<A, ET>[])
|}

export type Stop = () => void

export type MiddlewareResult = {|
  finished: boolean,
  canceled: boolean
|}

/**
 * T is the action type (a function that accepts some args and returns a promise)
 * RT is the resolve type of the Promise
 * ET is the error type of the promise
 */
export interface IPromiseMiddleware<T: Action, RT: *, ET: *> {
  -_action: T;
  -_middleware: ActionMiddleware<Arguments<T>, RT, ET>;
  +request: (Arguments<T>) => void;
  +onRequest: (RequestMiddleware<Arguments<T>, RT, ET>) => void;
  +onSuccess: (SuccessMiddleware<Arguments<T>, RT>) => void;
  +onError: (ErrorMiddleware<Arguments<T>, ET>) => void;
  +_callRequestMiddleware: (
    RequestEvent<Arguments<T>, RT, ET>
  ) => MiddlewareResult;
  +_callSuccessMiddleware: (SuccessEvent<Arguments<T>, RT>) => MiddlewareResult;
  +_callErrorMiddleware: (ErrorEvent<Arguments<T>, ET>) => MiddlewareResult;
}
