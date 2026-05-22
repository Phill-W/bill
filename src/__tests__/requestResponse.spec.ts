import { describe, expect, it } from 'vitest'

import { getApiErrorMessage, isApiSuccess } from '@/utils/request'

describe('request response helpers', () => {
  it('treats numeric code 200 as success', () => {
    expect(isApiSuccess({ code: 200 })).toBe(true)
    expect(isApiSuccess({ code: 500 })).toBe(false)
  })

  it('prefers the first field error message before the top-level message', () => {
    expect(
      getApiErrorMessage({
        code: 500,
        message: '提交数据校验失败',
        data: null,
        errors: [{ field: 'main.reimbursementTitle', message: '请填写报销标题' }],
      }),
    ).toBe('请填写报销标题')
  })
})
