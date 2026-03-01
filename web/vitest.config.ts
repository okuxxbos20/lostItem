import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: ['test/**/*.test.ts'],
    setupFiles: ['test/cleanup.ts'],
    env: {
      DATABASE_URL:
        'postgresql://postgres:postgres@localhost:5555/lostitem_test',
      S3_ENDPOINT: 'http://localhost:9002',
      S3_BUCKET: 'lostitem-test',
      S3_ACCESS_KEY: 'minioadmin',
      S3_SECRET_KEY: 'minio-admin-pass1',
      S3_REGION: 'ap-northeast-1',
    },
  },
})
