# js-promise-middleware
A middleware wrapper for promises that simplifies side effect management.

## Attention

To publish this as an npm package, use `yarn publish-package` rather than the usual `yarn publish`.
This runs a custom npm script that builds the project, moves the package.json file to the `es` directory and publishes from there.
It allows consumers of this npm package to use your dependency by writing
`import someModule from 'js-promise-middleware/someModule'`
rather than
`import someModule from 'js-promise-middleware/es/someModule'`
