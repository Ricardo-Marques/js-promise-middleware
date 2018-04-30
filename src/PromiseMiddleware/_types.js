// @flow
export type Action = (*) => Promise<*>

// extract arguments from a function type
/* eslint-disable-line no-unused-vars */
type Arguments_<A, F: (...args: A) => any> = A
export type Arguments<F> = Arguments_<*, F>

export type Event<A, RT, ET> =
  | RequestEvent<A>
  | SuccessEvent<A, RT>
  | ErrorEvent<A, ET>

export type RequestEvent<A> = {| args: A |}
export type SuccessEvent<A, RT> = {| args: A, res: RT |}
export type ErrorEvent<A, ET> = {| args: A, err: ET |}

export type Stop = () => void

export type Next<RT> = RT => void

export type Error<ET> = ER => void

export type EventCallbacks<A, RT, ET> = {|
  stop: Stop,
  next: Next<RT>,
  error: Error<ET>
|}

export type RequestMiddleware<A, RT, ET> = (
  RequestEvent<A>,
  EventCallbacks<A, RT, ET>
) => void
export type SuccessMiddleware<A, RT, ET> = (
  SuccessEvent<A, RT>,
  EventCallbacks<A, RT, ET>
) => void
export type ErrorMiddleware<A, RT, ET> = (
  ErrorEvent<A, ET>,
  EventCallbacks<A, RT, ET>
) => void

export type ActionMiddleware<A, RT, ET> = {|
  onRequest: RequestMiddleware<A, RT, ET>[],
  onSuccess: SuccessMiddleware<A, RT, ET>[],
  onError: ErrorMiddleware<A, RT, ET>[]
|}

export type Unsubscribe = () => void

export type MiddlewareResult<RT, ET> = {|
  finished: boolean,
  stopped: boolean,
  data?: RT,
  error?: ET
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
  +onRequest: (RequestMiddleware<Arguments<T>, RT, ET>) => Unsubscribe;
  +onSuccess: (SuccessMiddleware<Arguments<T>, RT>) => Unsubscribe;
  +onError: (ErrorMiddleware<Arguments<T>, ET>) => Unsubscribe;
  +_callRequestMiddleware: (
    RequestEvent<Arguments<T>, RT, ET>
  ) => MiddlewareResult;
  +_callSuccessMiddleware: (SuccessEvent<Arguments<T>, RT>) => MiddlewareResult;
  +_callErrorMiddleware: (ErrorEvent<Arguments<T>, ET>) => MiddlewareResult;
}
