/* eslint-disable */
import path from 'path'
import fse from 'fs-extra'

const files = ['README.md']

Promise.all(files.map(file => copyFile(file)))
  .then(() => createPackageFile())
  .catch(e => {
    throw e
  })

function copyFile(file) {
  const buildPath = resolveBuildPath(file)
  return new Promise(resolve => {
    fse.copy(file, buildPath, err => {
      if (err) throw err
      resolve()
    })
  })
    .then(() => console.log(`Copied ${file} to ${buildPath}`))
    .catch(e => {
      throw e
    })
}

function resolveBuildPath(file) {
  let filePath
  if (file.split(path.sep).indexOf('src') > -1) {
    filePath = path.relative('src', file)
  } else {
    filePath = file
  }
  return path.resolve(__dirname, '../es/', filePath)
}

function createPackageFile() {
  return new Promise(resolve => {
    fse.readFile(
      path.resolve(__dirname, '../package.json'),
      'utf8',
      (err, data) => {
        if (err) {
          throw err
        }

        resolve(data)
      }
    )
  })
    .then(data => JSON.parse(data))
    .then(packageData => {
      const overrides = {
        main: './index.js'
      }

      return new Promise(resolve => {
        const buildPath = path.resolve(__dirname, '../es/package.json')
        const data = JSON.stringify({ ...packageData, ...overrides }, null, 2)
        fse.writeFile(buildPath, data, err => {
          if (err) throw err
          console.log(`Created package.json in ${buildPath}`)
          resolve()
        })
      })
    })
    .catch(e => {
      throw e
    })
}
