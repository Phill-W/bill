import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { REIM_STATUS, canEditReimBill, getReimStatusKey } from '@/constants/reimStatus'
import { useReimBillStore } from '@/stores/reimBillStore'

describe('reimbursement status helpers', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('maps known statuses to canonical status keys', () => {
    expect(getReimStatusKey(REIM_STATUS.DRAFT.code, REIM_STATUS.DRAFT.name)).toBe('draft')
    expect(getReimStatusKey('10', '审批中')).toBe('processing')
    expect(getReimStatusKey('20', '审批通过')).toBe('approved')
    expect(getReimStatusKey(REIM_STATUS.COMPLETED.code, REIM_STATUS.COMPLETED.name)).toBe('completed')
    expect(getReimStatusKey(REIM_STATUS.VOIDED.code, REIM_STATUS.VOIDED.name)).toBe('voided')
  })

  it('treats only draft bills as editable', () => {
    expect(canEditReimBill(REIM_STATUS.DRAFT.code, REIM_STATUS.DRAFT.name)).toBe(true)
    expect(canEditReimBill('10', '审批中')).toBe(false)
    expect(canEditReimBill('20', '审批通过')).toBe(false)
    expect(canEditReimBill(REIM_STATUS.COMPLETED.code, REIM_STATUS.COMPLETED.name)).toBe(false)
    expect(canEditReimBill(REIM_STATUS.VOIDED.code, REIM_STATUS.VOIDED.name)).toBe(false)
  })

  it('initializes create-mode bills as editable drafts in the store', () => {
    const store = useReimBillStore()

    store.initCreate()

    expect(store.main.statusCode).toBe(REIM_STATUS.DRAFT.code)
    expect(store.main.statusName).toBe(REIM_STATUS.DRAFT.name)
    expect(store.isReadonly).toBe(false)
  })

  it('keeps loaded non-draft details read-only in the store', () => {
    const store = useReimBillStore()

    store.applyDetail({
      main: {
        submitDate: '2026-04-23',
        reimbursementTitle: '审批中的报销单',
        reimburserId: 'employee-1',
        reimburserNo: '0001',
        reimburserName: '徐年年',
        reimDepartmentId: 'department-1',
        reimDepartmentNo: '072001',
        reimDepartmentName: '财务部',
        reimCompanyId: 'company-1',
        reimCompanyNo: '0407',
        reimCompanyName: '初始仪财务',
        businessTypeId: 'business-1',
        businessTypeNo: '10010010101',
        businessTypeName: '项目出差',
        businessTripReason: '审批流验证',
        subsidyTotal: 0,
        mealAllowance: 0,
        transportationAllowance: 0,
        phoneAllowance: 0,
        allocationTotal: 0,
        statusCode: '10',
        statusName: '审批中',
      },
      itineraries: [],
      subsidies: [],
      subsidyCalendars: [],
      allocations: [],
    })

    expect(store.isReadonly).toBe(true)
  })
})
