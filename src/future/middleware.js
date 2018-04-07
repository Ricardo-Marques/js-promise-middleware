
// middleware
const cache = ({ idGetter }) => (fetcherWithMiddleware) => {
  const fetcherCache = {}
  const cacheCallbackQueue = {}

  const getCachedValue = id => fetcherCache[id]
  const setCachedValue = (id, value) => fetcherCache[id] = value

  const onRequest = ({ setResponse, args }, stop, next) => {
    const id = idGetter(...args)
    const cachedValue = getCachedValue(id)

    if (cachedValue != null) {
      // if I have the response cached, resolve the fetch
      setResponse(cachedValue)
    } else if (cacheCallbackQueue[id] == null) {
      // if I don't have it cached and don't have a cacheCallbackQueue, intialize it
      cacheCallbackQueue[id] = []
    } else {
      // if I have a queue that means there's an ongoing call to get this particular entity
      // stop this action and push the resolver to the queue
      console.log('waiting for cache')
      stop()
      cacheCallbackQueue[id].push(() => {
        console.log('cache done', getCachedValue(id))
        next()
      })
    }
  }

  const onSuccess = ({ args, res }) => {
    const id = idGetter(...args)

    if (getCachedValue(id) !== res) {
      setCachedValue(id, res)
    }

    if (cacheCallbackQueue[id] != null && cacheCallbackQueue[id].length > 0) {
      cacheCallbackQueue[id].forEach(cb => cb())
    }

    if (cacheCallbackQueue[id] != null) {
      delete cacheCallbackQueue[id]
    }
  }

  fetcherWithMiddleware.applyMiddleware('onRequest', onRequest)
  fetcherWithMiddleware.applyMiddleware('onSuccess', onSuccess)

  return fetcherWithMiddleware
}

const logger = (fetcherWithMiddleware) => {

  fetcherWithMiddleware.applyMiddleware('onSuccess', (eventProperties) => {
    console.log('success!', eventProperties)
  })

  return fetcherWithMiddleware
}


const getUserById = (id) =>
  fetch(`https://jsonplaceholder.typicode.com/users/${id}`)
    .then(response => response.json())


const UserFetcher = new FetcherWithMiddleware(getUserById)
UserFetcher = compose(
  cache({ idGetter: (...args) => args[0] }),
  logger
)(UserFetcher)

UserFetcher.fetch(2)
UserFetcher.fetch(3)
UserFetcher.fetch(4)
UserFetcher.fetch(4)
