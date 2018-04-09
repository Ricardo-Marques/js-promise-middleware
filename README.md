# js-promise-middleware
A middleware wrapper for promises that simplifies side effect management.

[![CircleCI](https://img.shields.io/circleci/project/github/Ricardo-Marques/js-promise-middleware.svg)](https://circleci.com/gh/ricardo-marques/js-promise-middleware) [![Coverage Status](https://img.shields.io/coveralls/github/Ricardo-Marques/js-promise-middleware.svg)](https://coveralls.io/github/Ricardo-Marques/js-promise-middleware?branch=master)

## The problem

You have a reactive application and are too lazy to learn how to use [observables](http://reactivex.io/rxjs/)?

## Example

### Import it
```javascript
import PromiseMiddleware from 'js-promise-middleware'
// unless you are building a basic app, you should be using your own middleware, not this
// check out the code used to build this simple middleware in src/middleware
import { cache, dedupe } from 'js-promise-middleware/middleware'
```

### Declare your fetcher
```javascript
// create a simple fetchUser function that returns a promise that resolves with the user
const fetchUser = id => fetch(`/users/${id}`).then(res => res.json())

// wrap that fetcher with promise middleware
const UserFetcher = new PromiseMiddleware(fetchUser)

// tell the cache how to get the entity's id based on the arguments the fetch request is given
const idGetter = (...args) => args[0]

// cache requests using a normalized state tree
cache(idGetter)(UserFetcher)

// dedupe requests to the same user
dedupe(idGetter)(UserFetcher)

// because cache and dedupe are composable, you can also compose middlewares
compose(
  cache,
  dedupe
)(UserFetcher)

export default UserFetcher
```

### Use it
```javascript
import UserFetcher from 'fetchers/User'
// every time the UserFetcher successfully resolves, fire this callback
// args will be an array of the arguments provided when we call "execute" and res will be whatever the promise
// originally given to the PromiseMiddleware resolved with
UserFetcher.applyOnSuccessMiddleware(({ res, args }) => onUserFetchSuccess(res, idGetter(...args)))

function onUserFetchSuccess (user, id) {
  console.log(`Got the user with the id ${id}!`, user)
}

UserFetcher.execute(1)
UserFetcher.execute(1) // does not call the server because we are deduping requests to the same user
UserFetcher.execute(2)

// ...sometime later
UserFetcher.execute(2) // does not call the server because we applied a cache to this fetcher
```

## Publishing

To publish this as an npm package, use `yarn publish-package` rather than the usual `yarn publish`.
This runs a custom npm script that builds the js-promise-middleware, moves the package.json file to the `es` directory and publishes from there.
It allows consumers of this npm package to use your dependency by writing
`import someModule from 'js-promise-middleware/someModule'`
rather than
`import someModule from 'js-promise-middleware/es/someModule'`
