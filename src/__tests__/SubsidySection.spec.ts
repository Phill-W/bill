import { beforeEach, describe, expect, it } from 'vitest'
import ElementPlus from 'element-plus'
import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'

import { useReimBillStore } from '@/stores/reimBillStore'
import type { ReimSubsidyDTO } from '@/types/reimBill'
import SubsidySection from '@/views/ReimBillDetail/components/SubsidySection.vue'

function createSubsidy(overrides: Partial<ReimSubsidyDTO> = {}): ReimSubsidyDTO {
  return {
    id: null,
    clientSubsidyId: `subsidy-${overrides.sortNo ?? 1}`,
    itineraryId: null,
    clientItineraryId: `itinerary-${overrides.sortNo ?? 1}`,
    travelerId: overrides.travelerId ?? 'traveler-1',
    travelerNo: overrides.travelerNo ?? 'EMP001',
    travelerName: overrides.travelerName ?? '徐年年',
    departureDate: '2026-04-13',
    arrivalDate: '2026-04-17',
    subsidyDays: overrides.subsidyDays ?? 5,
    departureCity: '北京',
    departureCityNo: '010',
    arrivingCity: '北京',
    arrivingCityNo: '010',
    arrivingCityType: '1',
    subsidyCity: '北京',
    subsidyCityNo: '010',
    subsidyCityType: '1',
    itineraryRoute: '北京-北京',
    applicationAmount: overrides.applicationAmount ?? 0,
    subsidyAmount: overrides.subsidyAmount ?? 0,
    mealAllowance: 0,
    transportationAllowance: 0,
    phoneAllowance: 0,
    businessTypeId: 'business-1',
    businessTypeNo: 'BT001',
    businessTypeName: '出差',
    sortNo: overrides.sortNo ?? 1,
  }
}

describe('SubsidySection', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('shows the warning bar without rendering el-empty when subsidies are missing', () => {
    const store = useReimBillStore()
    store.initCreate()

    const wrapper = mount(SubsidySection, {
      global: {
        plugins: [ElementPlus],
      },
    })

    expect(wrapper.text()).toContain('0.00（0人:0天）')
    expect(wrapper.find('.subsidy-tip').exists()).toBe(true)
    expect(wrapper.find('.subsidy-tip').text()).toContain('请根据实际出差日期选择补助')
    expect(wrapper.findComponent({ name: 'ElEmpty' }).exists()).toBe(false)
    expect(wrapper.find('table').exists()).toBe(false)
  })

  it('renders dynamic traveler summary and title-inline warning when subsidies exist', () => {
    const store = useReimBillStore()
    store.initCreate()
    store.main.subsidyTotal = 120
    store.subsidies = [
      createSubsidy({ travelerId: 'traveler-1', travelerNo: 'EMP001', travelerName: '徐年年', subsidyDays: 2, sortNo: 1 }),
      createSubsidy({ travelerId: 'traveler-1', travelerNo: 'EMP001', travelerName: '徐年年', subsidyDays: 3, sortNo: 2 }),
      createSubsidy({ travelerId: 'traveler-2', travelerNo: 'EMP002', travelerName: '李四', subsidyDays: 1, sortNo: 3 }),
    ]

    const wrapper = mount(SubsidySection, {
      global: {
        plugins: [ElementPlus],
      },
    })

    expect(wrapper.text()).toContain('120.00（共2人:6天）')
    expect(wrapper.find('.subsidy-header-tip').exists()).toBe(true)
    expect(wrapper.find('.subsidy-header-tip').text()).toContain('⚠️')
    expect(wrapper.find('.subsidy-header-tip__text').text()).toContain('请根据实际出差日期选择补助')
    expect(wrapper.find('.subsidy-tip').exists()).toBe(false)
    expect(wrapper.find('table').exists()).toBe(true)
  })
})
