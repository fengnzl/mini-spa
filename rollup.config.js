import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";
import dts from "rollup-plugin-dts";

export default defineConfig([
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.mjs",
      format: "es",
      sourcemap: true,
      name: "MiniSingleSPA",
    },
    plugins: [
      typescript({
        rootDir: process.cwd(),
      }),
    ],
  },
  {
    input: "src/index.ts",
    output: [{
      file: "dist/index.d.ts",
      format: "es"
    }],
    plugins: [dts()],
  }
])

