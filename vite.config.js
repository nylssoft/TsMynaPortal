import { resolve } from 'path'
import { readFileSync } from 'fs'
import { createHash } from 'crypto'
import pkg from './package.json'

const workerSource = readFileSync(resolve(__dirname, 'src/service-worker.js'), 'utf8')
const offlinePage = readFileSync(resolve(__dirname, 'src/public/offline.html'))

export default {
  plugins: [{
    name: 'portal-service-worker',
    apply: 'build',
    generateBundle(_options, bundle) {
      const hash = createHash('sha256').update(workerSource).update(offlinePage)
      for (const name of ['index.html', 'password-backup.html', 'public/manifest.webmanifest', 'public/icons/icon-192.png', 'public/icons/icon-512.png', 'public/icons/icon-maskable-512.png']) {
        hash.update(readFileSync(resolve(__dirname, 'src', name)))
      }
      Object.keys(bundle).sort().forEach(name => {
        const item = bundle[name]
        hash.update(name).update(item.type === 'chunk' ? item.code : item.source)
      })
      this.emitFile({ type: 'asset', fileName: 'service-worker.js', source: workerSource.replace('__PWA_BUILD_ID__', hash.digest('hex').slice(0, 16)) })
    },
  }],
  root: resolve(__dirname, 'src'),
  base: '',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        portal: resolve(__dirname, 'src', 'index.html'),
        passwordBackup: resolve(__dirname, 'src', 'password-backup.html'),
      },
    },
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
    __APP_VERSION__: JSON.stringify(pkg.version),
    __PWA_ENABLED__: JSON.stringify(process.env.NODE_ENV === 'production')
  }
}