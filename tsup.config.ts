import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  tsconfig: './tsconfig.json',
  splitting: false, // okay since it's a lib
  sourcemap: false,
  minify: true, // compress code, removes whitespace & comments
  treeshake: true, // remove dead code
  clean: true,
  skipNodeModulesBundle: true, // ✅ don’t bundle external deps
  external: ['zod', 'joi', 'yup', 'pino', 'pino-pretty'], // if peer or runtime only
});
