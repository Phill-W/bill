export const REIM_STATUS = {
  DRAFT: { code: '0', name: '草稿' },
  COMPLETED: { code: '1', name: '已完成' },
  VOIDED: { code: '2', name: '已作废' },
} as const

export const REIM_TYPE = {
  code: 'TRAVEL_REIMBURSEMENT',
  name: '差旅费用报销单',
} as const
