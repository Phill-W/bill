import { canEditReimBill } from '@/constants/reimStatus'
import type { ReimBillListItem } from '@/types/reimBill'

export interface ReimBillMenuAction {
  key: 'delete' | 'push' | 'copy'
  label: string
  disabled?: boolean
}

export function canEditListRow(row: ReimBillListItem) {
  return canEditReimBill(row.statusCode, row.statusName)
}

export function getReimBillMenuActions(): ReimBillMenuAction[] {
  return [
    { key: 'delete', label: '删除' },
    { key: 'push', label: '手工推送', disabled: true },
    { key: 'copy', label: '复制' },
  ]
}
