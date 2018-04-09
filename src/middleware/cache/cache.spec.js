import Promise from 'promise'
import PromiseMiddleware from '../../PromiseMiddleware'

import cache from './index'

describe('cache', () => {
  let iterator = 0
  const fetchIterator = () => new Promise(res => {
    iterator++
    res(iterator)
  })


  const IteratorFetcher = cache(id => id)(new PromiseMiddleware(fetchIterator))

  it('caches values based on an idGetter', (done) => {
    let hasVerifiedCachedValue = false
    IteratorFetcher.applyOnSuccessMiddleware(({ res }) => {
      if (!hasVerifiedCachedValue) {
        hasVerifiedCachedValue = true
        IteratorFetcher.execute(1)
      } else {
        try {
          // the second time we get a success, the iterator should've gone up
          // it didn't because we cache the value using our middleware
          // preventing non-necessary http requests
          expect(res).toEqual(1)
          expect(iterator).toEqual(1)
          done()
        } catch (e) {
          done(e)
        }
      }
    })

    IteratorFetcher.execute(1)
  })
})
