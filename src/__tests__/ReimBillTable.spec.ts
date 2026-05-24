import { describe, expect, it } from 'vitest'
import ElementPlus from 'element-plus'
import { mount } from '@vue/test-utils'

import {
  canEditListRow,
  getReimBillMenuActions,
} from '@/constants/reimBillListActions'
import { getReimStatusClass } from '@/constants/reimStatus'
import type { ReimBillListItem } from '@/types/reimBill'
import ReimBillTable from '@/views/ReimBillList/ReimBillTable.vue'

function createRow(
  id: string,
  statusCode: string,
  statusName: string,
  reimbursementTitle = `娴嬭瘯鍗曟嵁-${id}`,
): ReimBillListItem {
  return {
    id,
    reimNo: `RCBX202605${id.padStart(4, '0')}`,
    statusCode,
    statusName,
    reimTypeCode: 'TRAVEL_REIMBURSEMENT',
    reimTypeName: '宸梾璐圭敤鎶ラ攢鍗?',
    reimburserId: 'employee-1',
    reimburserNo: '74541',
    reimburserName: '寰愬勾骞?',
    reimDepartmentId: 'department-1',
    reimDepartmentNo: '072001',
    reimDepartmentName: '瀹㈡埛鎴愬姛浜嬩笟閮?',
    reimCompanyId: 'company-1',
    reimCompanyNo: '0407',
    reimCompanyName: '鑳滄剰绉戞妧鍖椾含鍒嗗叕鍙?',
    businessTypeId: 'business-1',
    businessTypeNo: '10010010101',
    businessTypeName: '鏃ュ父鍔炲叕',
    reimbursementTitle,
    businessTripReason: '瀹㈡埛椤圭洰鐜板満鏀寔',
    subsidyTotal: 0,
    creationTime: '2026-05-22',
  }
}

describe('ReimBillTable', () => {
  it('renders with the bill list table shell and blue status class logic', () => {
    const wrapper = mount(ReimBillTable, {
      props: {
        data: [createRow('1', '0', '鑽夌'), createRow('2', '10', '瀹℃壒涓?')],
        loading: false,
      },
      global: {
        plugins: [ElementPlus],
      },
    })

    expect(getReimStatusClass('0', '鑽夌')).toContain('status-text--blue')
    expect(getReimStatusClass('10', '瀹℃壒涓?')).toContain('status-text--blue')

    const html = wrapper.html()
    expect(html).toContain('bill-list-table')
    expect(html).not.toContain('label="鎿嶄綔" width="112" align="center" fixed')
  })

  it('treats only draft rows as editable in the marker action', () => {
    expect(canEditListRow(createRow('1', '0', '鑽夌'))).toBe(true)
    expect(canEditListRow(createRow('2', '10', '瀹℃壒涓?'))).toBe(false)
    expect(canEditListRow(createRow('3', '20', '瀹℃壒閫氳繃'))).toBe(false)
    expect(canEditListRow(createRow('4', '1', '宸插畬鎴?'))).toBe(false)
    expect(canEditListRow(createRow('5', '2', '宸蹭綔搴?'))).toBe(false)
  })

  it('keeps more-menu actions aligned with the backend list operations', () => {
    const draftActions = getReimBillMenuActions().map((item) => item.label)
    const processingActions = getReimBillMenuActions().map((item) => item.label)
    const pushAction = getReimBillMenuActions().find((item) => item.key === 'push')

    expect(draftActions).toEqual(['删除', '手工推送', '复制'])
    expect(processingActions).toEqual(['删除', '手工推送', '复制'])
    expect(pushAction?.disabled).toBe(true)
  })

  it('renders the provided empty description when no rows are available', () => {
    const wrapper = mount(ReimBillTable, {
      props: {
        data: [],
        loading: false,
        emptyDescription: '暂无报销单',
      },
      global: {
        plugins: [ElementPlus],
      },
    })

    expect(wrapper.text()).toContain('暂无报销单')
  })
})
