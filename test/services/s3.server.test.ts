import { describe, expect, it } from 'vitest'

import { s3, S3_BUCKET } from '#app/services/s3.server'

describe('S3 client', () => {
  it('S3_BUCKETがテスト用の値になっている', () => {
    expect(S3_BUCKET).toBe('lostitem-test')
  })

  it('S3クライアントが初期化されている', () => {
    expect(s3).toBeDefined()
  })
})
