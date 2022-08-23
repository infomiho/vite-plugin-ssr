/*
 * We create a file `dist/server/package.json` to support ESM users.
 * Otherwise, following error is thrown:
 *   Must use import to load ES Module: dist/server/pageFiles.js
 *   require() of ES modules is not supported.
 *   require() of dist/server/pageFiles.js from node_modules/vite-plugin-ssr/dist/cjs/node/page-files/setup.js is an ES module file as it is a .js file whose nearest parent package.json contains "type": "module" which defines all .js files in that package scope as ES modules.
 * Reproduction: https://github.com/brillout/vite-plugin-ssr-server-import-syntax
 */

export { packageJsonFile }

import type { Plugin, ResolvedConfig } from 'vite'
import { isSSR_config, rollupIsEsm } from '../utils'

function packageJsonFile(): Plugin {
  let config: ResolvedConfig
  return {
    name: 'vite-plugin-ssr:packageJsonFile',
    apply: 'build',
    configResolved(config_) {
      config = config_
    },
    generateBundle(options, bundle) {
      if (!isSSR_config(config)) return
      const isEsm = rollupIsEsm(options)
      const fileName = 'package.json'
      if (bundle[fileName]) return // E.g. already generated by Telefunc / vite-plugin-ssr
      this.emitFile({
        fileName,
        type: 'asset',
        source: getPackageJsonContent(isEsm)
      })
    }
  } as Plugin
}

function getPackageJsonContent(isEsm: boolean): string {
  if (isEsm) {
    return `{ "type": "module" }`
  } else {
    return `{ "type": "commonjs" }`
  }
}