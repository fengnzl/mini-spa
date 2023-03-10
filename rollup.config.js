import typescript from "@rollup/plugin-typescript";
import { watch, defineConfig } from "rollup";

export default defineConfig({
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

