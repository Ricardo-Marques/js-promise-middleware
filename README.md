# js-promise-middleware
A middleware wrapper for promises that simplifies side effect management.

[![CircleCI](https://circleci.com/gh/Ricardo-Marques/js-promise-middleware.svg?style=shield&circle-token=517dfd482b2e7d6825bfba3b417e70569eccce18)](https://circleci.com/gh/ricardo-marques/js-promise-middleware) [![Coverage Status](https://coveralls.io/repos/github/Ricardo-Marques/js-promise-middleware/badge.svg?branch=master)](https://coveralls.io/github/Ricardo-Marques/js-promise-middleware?branch=master)

## Attention

To publish this as an npm package, use `yarn publish-package` rather than the usual `yarn publish`.
This runs a custom npm script that builds the js-promise-middleware, moves the package.json file to the `es` directory and publishes from there.
It allows consumers of this npm package to use your dependency by writing
`import someModule from 'js-promise-middleware/someModule'`
rather than
`import someModule from 'js-promise-middleware/es/someModule'`
