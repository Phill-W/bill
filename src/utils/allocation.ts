import type { ReimAllocationDTO } from '@/types/reimBill'
import { addMoney, toMoney, toRatio } from '@/utils/money'

export function recalcFirstAllocation(allocations: ReimAllocationDTO[], total: number) {
  if (allocations.length === 0) return
  const first = allocations[0]
  if (!first) return
  const others = allocations.slice(1)
  const otherRatioTotal = others.reduce((sum, item) => sum + Number(item.allocationRatio || 0), 0)
  const otherAmountTotal = addMoney(others.map((item) => item.allocationAmount || 0))

  allocations.forEach((item, index) => {
    item.isFirstRow = index === 0 ? '1' : '0'
    item.sortNo = index + 1
  })

  first.allocationRatio = toRatio(1 - otherRatioTotal)
  first.allocationAmount = toMoney(total - otherAmountTotal)
}

export function recalcAllocationAmount(row: ReimAllocationDTO, total: number) {
  row.allocationAmount = toMoney(total * Number(row.allocationRatio || 0))
}

export function splitAllocationsEvenly(allocations: ReimAllocationDTO[], total: number) {
  if (allocations.length === 0) return
  const ratio = toRatio(1 / allocations.length)
  const amount = toMoney(total / allocations.length)

  allocations.forEach((item, index) => {
    item.allocationRatio = ratio
    item.allocationAmount = amount
    item.isFirstRow = index === 0 ? '1' : '0'
    item.sortNo = index + 1
  })
  recalcFirstAllocation(allocations, total)
}
