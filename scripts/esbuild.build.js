// @ts-check

import { sharedEsbuildConfig } from './esbuild.config.js'
import esbuild from 'esbuild'
import process from 'process'

const config = sharedEsbuildConfig

const prod = process.argv[2] === 'production'

const context = await esbuild.context({
  ...config,
  ...{ sourcemap: prod ? false : 'inline', outfile: 'main.js' },
})

if (prod) {
  await context.rebuild()
  process.exit(0)
} else {
  await context.watch()
}
