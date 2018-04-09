// @flow
import PromiseMiddleware from '../../PromiseMiddleware'

type IdGetter = (ags: Array<*>) => string | number

/**
 * dedupes requests of the same entity
 */
const dedupe = (idGetter: IdGetter) => (fetcher: $Supertype<PromiseMiddleware<*>>) => {
  let underwayFetches = {}

  const onRequest = ({ args }, stop) => {
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

  fetcher.applyOnRequestMiddleware(onRequest)
  fetcher.applyOnSuccessMiddleware(onSuccess)

  return fetcher
}

export default dedupe
