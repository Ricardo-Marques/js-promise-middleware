// @flow
import PromiseMiddleware from '../../PromiseMiddleware'

import dedupe from './index'

describe('dedupe', () => {
  let iterator = 0
  const fetchIterator = () =>
    new Promise(res => {
      iterator++
      res(iterator)
    })

  const IteratorFetcher = dedupe(id => id)(new PromiseMiddleware(fetchIterator))

  beforeEach(() => {
    iterator = 0
  })

  it('dedupes requests based on an idGetter', (done: (e?: *) => void) => {
    IteratorFetcher.request(1)
    IteratorFetcher.request(1)
    IteratorFetcher.request(2)

    setTimeout(() => {
      try {
        expect(iterator).toEqual(2)
        done()
      } catch (e) {
        done(e)
      }
    })
  })

  it('allows following requests to execute the promise', (done: (
    e?: *
  ) => void) => {
    IteratorFetcher.request(3)

    setTimeout(() => {
      IteratorFetcher.request(3)
      setTimeout(() => {
        try {
          expect(iterator).toEqual(2)
          done()
        } catch (e) {
          done(e)
        }
      })
    })
  })
})
