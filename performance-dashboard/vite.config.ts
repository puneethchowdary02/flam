import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'chart-components': [
            './src/components/charts/LineChart.vue',
            './src/components/charts/BarChart.vue',
            './src/components/charts/ScatterPlot.vue',
            './src/components/charts/Heatmap.vue'
          ]
        }
      }
    }
  }
})