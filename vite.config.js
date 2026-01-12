import { resolve } from 'path'
import pkg from './package.json'

export default {
  root: resolve(__dirname, 'src'),
  base: '',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    port: 8080,
    proxy: {
      '/api': 'http://localhost:5000',
      '/locale/de.json': 'http://localhost:5000',
      '/locale/en.json': 'http://localhost:5000',
      '/images/profiles/': 'http://localhost:5000'
    },
  },
  // Optional: Silence Sass deprecation warnings. See note below.
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: [
          'import',
          'mixed-decls',
          'color-functions',
          'global-builtin',
        ],
      },
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version)
  }
}