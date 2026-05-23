import { canEditReimBill } from '@/constants/reimStatus'
import type { ReimBillListItem } from '@/types/reimBill'

export interface ReimBillMenuAction {
  key: 'detail' | 'edit' | 'void' | 'copy' | 'push'
  label: string
  disabled?: boolean
}

export function canEditListRow(row: ReimBillListItem) {
  return canEditReimBill(row.statusCode, row.statusName)
}

export function getReimBillMenuActions(row: ReimBillListItem): ReimBillMenuAction[] {
  if (canEditListRow(row)) {
    return [
      { key: 'detail', label: '查看' },
      { key: 'edit', label: '编辑' },
      { key: 'void', label: '作废' },
      { key: 'copy', label: '复制' },
      { key: 'push', label: '手工推送', disabled: true },
    ]
  }

  return [
    { key: 'detail', label: '查看' },
    { key: 'copy', label: '复制' },
    { key: 'push', label: '手工推送', disabled: true },
  ]
}
