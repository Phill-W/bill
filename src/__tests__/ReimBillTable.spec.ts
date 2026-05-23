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
  reimbursementTitle = `测试单据-${id}`,
): ReimBillListItem {
  return {
    id,
    reimNo: `RCBX202605${id.padStart(4, '0')}`,
    statusCode,
    statusName,
    reimTypeCode: 'TRAVEL_REIMBURSEMENT',
    reimTypeName: '差旅费用报销单',
    reimburserId: 'employee-1',
    reimburserNo: '74541',
    reimburserName: '徐年年',
    reimDepartmentId: 'department-1',
    reimDepartmentNo: '072001',
    reimDepartmentName: '客户成功事业部',
    reimCompanyId: 'company-1',
    reimCompanyNo: '0407',
    reimCompanyName: '胜意科技北京分公司',
    businessTypeId: 'business-1',
    businessTypeNo: '10010010101',
    businessTypeName: '日常办公',
    reimbursementTitle,
    businessTripReason: '客户项目现场支持',
    subsidyTotal: 0,
    creationTime: '2026-05-22',
  }
}

describe('ReimBillTable', () => {
  it('renders with the bill list table shell and blue status class logic', () => {
    const wrapper = mount(ReimBillTable, {
      props: {
        data: [createRow('1', '0', '草稿'), createRow('2', '10', '审批中')],
        loading: false,
      },
      global: {
        plugins: [ElementPlus],
      },
    })

    expect(getReimStatusClass('0', '草稿')).toContain('status-text--blue')
    expect(getReimStatusClass('10', '审批中')).toContain('status-text--blue')

    const html = wrapper.html()
    expect(html).toContain('bill-list-table')
    expect(html).not.toContain('label="操作" width="112" align="center" fixed')
  })

  it('treats only draft rows as editable in the marker action', () => {
    expect(canEditListRow(createRow('1', '0', '草稿'))).toBe(true)
    expect(canEditListRow(createRow('2', '10', '审批中'))).toBe(false)
    expect(canEditListRow(createRow('3', '20', '审批通过'))).toBe(false)
    expect(canEditListRow(createRow('4', '1', '已完成'))).toBe(false)
    expect(canEditListRow(createRow('5', '2', '已作废'))).toBe(false)
  })

  it('splits more-menu actions by draft and non-draft states', () => {
    const draftActions = getReimBillMenuActions(createRow('1', '0', '草稿')).map((item) => item.label)
    const processingActions = getReimBillMenuActions(createRow('2', '10', '审批中')).map((item) => item.label)

    expect(draftActions).toEqual(['查看', '编辑', '作废', '复制', '手工推送'])
    expect(processingActions).toEqual(['查看', '复制', '手工推送'])
  })
})
