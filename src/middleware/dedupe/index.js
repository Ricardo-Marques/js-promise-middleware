// @flow
import type { IPromiseMiddleware } from '../../PromiseMiddleware/_types'

type IdGetter = (args: *) => string | number

/**
 * dedupes requests of the same entity
 */
const dedupe = (idGetter: IdGetter) => (
  fetcher: IPromiseMiddleware<*, *, *>
) => {
  let underwayFetches = {}

  const onRequest = ({ args }, { stop }) => {
    const id = idGetter(...args)
    if (underwayFetches[id]) {
      stop()
    }

    underwayFetches[id] = true
  }

  const onSuccess = ({ args }) => {
    const id = idGetter(...args)

    if (underwayFetches[id]) {
      delete underwayFetches[id]
    }
  }

  fetcher.onRequest(onRequest)
  fetcher.onSuccess(onSuccess)

  return fetcher
}

export default dedupe
