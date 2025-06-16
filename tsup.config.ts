// import { defineConfig } from "tsup";

// export default defineConfig({
//   entry: ["src/index.ts"],
//   format: ["cjs", "esm"], // Build for commonJS and ESmodules
//   dts: true, // Generate declaration file (.d.ts)
//   tsconfig: './tsconfig.json',
//   splitting: false,
//   sourcemap: true,
//   clean: true
// });

import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  tsconfig: "./tsconfig.json",
  splitting: false, // okay since it's a lib
  sourcemap: false,
  minify: true,     // compress code, removes whitespace & comments
  treeshake: true,  // remove dead code
  clean: true,
  skipNodeModulesBundle: true, // ✅ don’t bundle external deps
  external: ["zod", "joi", "yup", "moment", "pino", "pino-pretty"], // if peer or runtime only
});
