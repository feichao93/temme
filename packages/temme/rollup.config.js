import typescript from 'rollup-plugin-typescript2'
import pegjs from 'rollup-plugin-pegjs'
import replace from 'rollup-plugin-replace'
import pkg from './package.json'

function config(output) {
  return {
    input: 'src/index.ts',
    output,
    external: ['invariant', 'cheerio'],
    plugins: [
      pegjs(),
      typescript(),
      replace({
        TEMME_VERSION: JSON.stringify(pkg.version),
      }),
    ],
  }
}

export default [
  config({
    format: 'es',
    file: 'dist/temme.mjs',
  }),
  config({
    format: 'cjs',
    exports: 'named',
    file: 'dist/temme.js',
  }),
]
