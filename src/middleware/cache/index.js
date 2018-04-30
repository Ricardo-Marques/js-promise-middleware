// @flow
import type { IPromiseMiddleware } from '../../PromiseMiddleware/_types'

type IdGetter = (...args: mixed[]) => string | number

/**
 * will immediately resolve an execute request if it has a cached value for the requested entity
 * instead of reaching out to the server again
 */
const cache = (idGetter: IdGetter) => (
  fetcher: IPromiseMiddleware<*, *, *>
) => {
  const fetcherCache = {}

  const getCachedValue = id => fetcherCache[id]
  const setCachedValue = (id, value) => (fetcherCache[id] = value)

  const onRequest = ({ res, args }) => {
    const id = idGetter(...args)
    const cachedValue = getCachedValue(id)

    if (cachedValue != null) {
      // if I have the response cached, resolve the fetch
      res(cachedValue)
    }
  }

  const onSuccess = ({ args, res }) => {
    const id = idGetter(...args)

    if (getCachedValue(id) == null) {
      setCachedValue(id, res)
    }
  }

  fetcher.onRequest(onRequest)
  fetcher.onSuccess(onSuccess)

  return fetcher
}

export default cache
