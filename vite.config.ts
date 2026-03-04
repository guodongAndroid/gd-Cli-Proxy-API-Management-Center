import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { existsSync, renameSync } from 'fs'
import { viteSingleFile } from 'vite-plugin-singlefile'

function renameHtmlOutputPlugin(targetFileName = 'management.html') {
  let outDir = 'dist'

  return {
    name: 'rename-html-output',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir
    },
    closeBundle() {
      const indexHtmlPath = resolve(process.cwd(), outDir, 'index.html')
      const targetHtmlPath = resolve(process.cwd(), outDir, targetFileName)

      if (existsSync(indexHtmlPath)) {
        renameSync(indexHtmlPath, targetHtmlPath)
      }
    }
  }
}

export default defineConfig(({ command, mode }) => {
  // Default build target is single-file unless explicitly using split mode.
  const singleFile = command === 'build' && mode !== 'split'

  return {
    plugins: [vue(), singleFile ? viteSingleFile() : null, renameHtmlOutputPlugin()].filter(Boolean),
    build: {
      ...(singleFile
        ? {
            cssCodeSplit: false,
            assetsInlineLimit: 100000000
          }
        : {}),
      rollupOptions: {
        ...(singleFile
          ? {
              output: {
                inlineDynamicImports: true
              }
            }
          : {})
      }
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    server: {
      port: 5174,
      proxy: {
        '/v0': {
          target: 'http://localhost:8317',
          changeOrigin: true
        }
      }
    }
  }
})
