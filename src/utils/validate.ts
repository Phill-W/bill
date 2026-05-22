import dayjs from 'dayjs'

import type { ReimBillSubmitDTO } from '@/types/reimBill'
import { hasOverlappedItinerary } from '@/utils/itinerary'
import { addMoney, moneyEquals } from '@/utils/money'

function required(value: unknown) {
  return value !== null && value !== undefined && String(value).trim() !== ''
}

export function validateSubmit(payload: ReimBillSubmitDTO) {
  const errors: string[] = []
  const { main, itineraries, subsidyCalendars, allocations } = payload

  if (!required(main.reimbursementTitle)) errors.push('请填写报销标题')
  if (main.reimbursementTitle?.length > 500) errors.push('报销标题不能超过500字')
  if (!required(main.reimburserId)) errors.push('请选择报销人')
  if (!required(main.reimDepartmentId)) errors.push('请选择报销部门')
  if (!required(main.reimCompanyId)) errors.push('请选择费用归属公司')
  if (!required(main.businessTypeId)) errors.push('请选择业务类型')
  if (!required(main.businessTripReason)) errors.push('请填写出差事由')
  if (main.businessTripReason?.length > 500) errors.push('出差事由不能超过500字')
  if ((main.remarks || '').length > 1000) errors.push('备注不能超过1000字')
  if (itineraries.length === 0) errors.push('请至少补录一条行程')

  itineraries.forEach((item) => {
    if (!required(item.travelerId)) errors.push('行程出行人不能为空')
    if (!required(item.departureCityNo) || !required(item.arrivingCityNo)) errors.push('行程城市不能为空')
    if (!required(item.departureDate) || !required(item.arrivalDate)) errors.push('行程日期不能为空')
    if (dayjs(item.arrivalDate).isBefore(dayjs(item.departureDate), 'day')) {
      errors.push('到达日期不能早于出发日期')
    }
    if (dayjs(item.arrivalDate).isAfter(dayjs(), 'day')) errors.push('到达日期不能晚于当前日期')
    if (!required(item.itineraryInstructions)) errors.push('请填写行程说明')
    if (item.itineraryInstructions?.length > 500) errors.push('行程说明不能超过500字')
    if (hasOverlappedItinerary(itineraries, item)) errors.push('同一出行人存在重复行程日期')
  })

  subsidyCalendars.forEach((item) => {
    if (item.mealSelected === '0' && item.mealExpensesAmount !== 0) errors.push('未选中餐费时金额必须为0')
    if (item.trafficSelected === '0' && item.trafficAmount !== 0) errors.push('未选中交通时金额必须为0')
    if (item.communicationSelected === '0' && item.communicationAmount !== 0) {
      errors.push('未选中通讯时金额必须为0')
    }
    if (item.mealExpensesAmount > item.standardMealExpensesAmount) errors.push('餐费金额不能大于标准金额')
    if (item.trafficAmount > item.standardTrafficAmount) errors.push('交通金额不能大于标准金额')
    if (item.communicationAmount > item.standardCommunicationAmount) errors.push('通讯金额不能大于标准金额')
  })

  if (allocations.length === 0) errors.push('请至少填写一条分摊信息')
  allocations.forEach((item) => {
    if (!required(item.reimCompanyId)) errors.push('分摊费用归属公司不能为空')
    if (item.allocationRatio === null || item.allocationRatio === undefined) errors.push('分摊比例不能为空')
    if (item.allocationAmount === null || item.allocationAmount === undefined) errors.push('分摊金额不能为空')
  })

  const ratioTotal = allocations.reduce((sum, item) => sum + Number(item.allocationRatio || 0), 0)
  const amountTotal = addMoney(allocations.map((item) => item.allocationAmount || 0))
  if (allocations.length > 0 && Math.abs(ratioTotal - 1) > 0.000001) {
    errors.push('分摊比例合计必须为100%')
  }
  if (allocations.length > 0 && !moneyEquals(amountTotal, main.subsidyTotal)) {
    errors.push('分摊金额合计必须等于补助总金额')
  }

  return Array.from(new Set(errors))
}
