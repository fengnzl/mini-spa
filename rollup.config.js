import typescript from "@rollup/plugin-typescript";
import { watch, defineConfig } from "rollup";

const result = defineConfig({
  input: 'src/index.ts',
  output: {
    file: 'dist/index.mjs',
    format: 'es',
    sourcemap: true,
    name: 'MiniSingleSPA',
  },
  plugins: [
    typescript(),
  ],
})

const watcher = watch(result);
console.log('rollup is watching for file change...')

watcher.on('event', (event) => {
  switch (event.code) {
    case 'START':
      console.log('rollup is rebuilding...')
      break
    case 'ERROR':
    case 'FATAL':
      console.log('error in rebuilding.')
      break
    case 'END':
      console.log('rebuild done.')
  }
})

export default result
