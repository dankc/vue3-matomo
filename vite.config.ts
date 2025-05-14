/// <reference types="vitest/config" />
import { resolve } from 'path';
import { rm } from 'fs/promises';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import { rollup } from 'rollup';
import rollupDts from 'rollup-plugin-dts';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src/'),
    },
  },
  build: {
    emptyOutDir: true,
    minify: true,
    outDir: './dist/',
    target: 'esnext',
    lib: {
      entry: resolve(__dirname, './src/index.ts'),
      formats: ['es', 'cjs'],
      fileName(format, entryName) {
        return `${entryName}.${format}.js`;
      },
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: { vue: 'Vue' },
        dir: './dist/',
        exports: 'named',
      },
    },
  },
  plugins: [
    vue(),
    dts({
      copyDtsFiles: true,
      exclude: ['node_modules', 'dist'],
      include: ['src/**/*.ts'],
      insertTypesEntry: true,
      outDir: './dist/',
      rollupTypes: false,
    }),
    {
      name: 'postbuild-dts',
      async closeBundle() {
        // Use rollup-plugin-dts to bundle the declarations into a single file
        const bundle = await rollup({
          input: resolve(__dirname, './dist/index.d.ts'),
          plugins: [rollupDts()],
          external: ['vue', 'vue-router'],
        });
        await bundle.write({
          file: resolve(__dirname, './dist/index.d.ts'),
          format: 'es',
        });
        await bundle.close();

        // Clean up unnecessary .d.ts files
        await rm(resolve(__dirname, './dist/utils.d.ts'), { force: true });
        await rm(resolve(__dirname, './dist/types'), { recursive: true, force: true });
      },
    },
  ].filter(Boolean),
  test: {
    environment: 'node',
    typecheck: {
      checker: 'tsc',
      enabled: true,
      tsconfig: './tsconfig.spec.json',
    },
    include: ['spec/*.spec.ts'],
    exclude: ['node_modules', 'dist', 'src'],
  },
});
