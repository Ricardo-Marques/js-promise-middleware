# js-promise-middleware
A middleware wrapper for promises that simplifies side effect management.

[![CircleCI](https://img.shields.io/circleci/project/github/Ricardo-Marques/js-promise-middleware.svg)](https://circleci.com/gh/ricardo-marques/js-promise-middleware) [![Coverage Status](https://img.shields.io/coveralls/github/Ricardo-Marques/js-promise-middleware.svg)](https://coveralls.io/github/Ricardo-Marques/js-promise-middleware?branch=master)

## Attention

To publish this as an npm package, use `yarn publish-package` rather than the usual `yarn publish`.
This runs a custom npm script that builds the js-promise-middleware, moves the package.json file to the `es` directory and publishes from there.
It allows consumers of this npm package to use your dependency by writing
`import someModule from 'js-promise-middleware/someModule'`
rather than
`import someModule from 'js-promise-middleware/es/someModule'`
