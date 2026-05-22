export type ReimStatusKey = 'draft' | 'processing' | 'approved' | 'completed' | 'voided' | 'unknown'

interface ReimStatusDefinition {
  code: string
  name: string
  key: ReimStatusKey
}

export const REIM_STATUS = {
  DRAFT: { code: '0', name: '草稿', key: 'draft' },
  PROCESSING: { code: '10', name: '审批中', key: 'processing' },
  APPROVED: { code: '20', name: '审批通过', key: 'approved' },
  COMPLETED: { code: '1', name: '已完成', key: 'completed' },
  VOIDED: { code: '2', name: '已作废', key: 'voided' },
} as const satisfies Record<string, ReimStatusDefinition>

export const REIM_TYPE = {
  code: 'TRAVEL_REIMBURSEMENT',
  name: '差旅费用报销单',
} as const

const KNOWN_STATUS_LIST = Object.values(REIM_STATUS)

const STATUS_NAME_ALIASES: Record<string, ReimStatusKey> = {
  草稿: 'draft',
  审批中: 'processing',
  审批通过: 'approved',
  已完成: 'completed',
  已作废: 'voided',
}

export function getReimStatusKey(statusCode?: string | null, statusName?: string | null): ReimStatusKey {
  const byCode = KNOWN_STATUS_LIST.find((item) => item.code === statusCode)
  if (byCode) return byCode.key

  if (statusName) return STATUS_NAME_ALIASES[statusName] || 'unknown'

  return 'unknown'
}

export function getReimStatusLabel(statusCode?: string | null, statusName?: string | null) {
  if (statusName) return statusName

  const status = KNOWN_STATUS_LIST.find((item) => item.code === statusCode)
  return status?.name || '-'
}

export function canEditReimBill(statusCode?: string | null, statusName?: string | null) {
  return getReimStatusKey(statusCode, statusName) === 'draft'
}

export function isReadonlyReimBill(statusCode?: string | null, statusName?: string | null) {
  return !canEditReimBill(statusCode, statusName)
}

export function getReimStatusClass(statusCode?: string | null, statusName?: string | null) {
  return `status-text--${getReimStatusKey(statusCode, statusName)}`
}
