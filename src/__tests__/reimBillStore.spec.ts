import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useReimBillStore } from '@/stores/reimBillStore'
import type { ReimBillDetailDTO } from '@/types/reimBill'

function createDetail(): ReimBillDetailDTO {
  return {
    main: {
      id: 'bill-1',
      reimNo: 'BX202605240001',
      submitDate: '2026-05-24',
      reimbursementTitle: '杭州出差报销',
      reimburserId: 'u001',
      reimburserNo: 'EMP001',
      reimburserName: '张三',
      reimDepartmentId: 'd001',
      reimDepartmentNo: 'DEP001',
      reimDepartmentName: '研发部',
      reimCompanyId: 'c001',
      reimCompanyNo: 'COM001',
      reimCompanyName: '示例公司',
      businessTypeId: 'bt001',
      businessTypeNo: 'BT001',
      businessTypeName: '差旅',
      businessTripReason: '项目沟通',
      subsidyTotal: 0,
      mealAllowance: 0,
      transportationAllowance: 0,
      phoneAllowance: 0,
      allocationTotal: 0,
      statusCode: '0',
      statusName: '草稿',
      remarks: '',
    },
    itineraries: [
      {
        id: 'server-itinerary-1',
        clientItineraryId: '',
        travelerId: 'u002',
        travelerNo: 'EMP002',
        travelerName: '李四',
        departureDate: '2026-05-21',
        arrivalDate: '2026-05-21',
        itineraryDays: 1,
        departureCity: '武汉',
        departureCityNo: '420100',
        departureCityType: '2',
        arrivingCity: '上海',
        arrivingCityNo: '310100',
        arrivingCityType: '1',
        itineraryRoute: '武汉-上海',
        itineraryInstructions: '客户拜访',
        sortNo: 1,
      },
    ],
    subsidies: [
      {
        id: 'server-subsidy-1',
        clientSubsidyId: '',
        itineraryId: 'server-itinerary-1',
        clientItineraryId: '',
        travelerId: 'u002',
        travelerNo: 'EMP002',
        travelerName: '李四',
        departureDate: '2026-05-21',
        arrivalDate: '2026-05-21',
        subsidyDays: 1,
        departureCity: '武汉',
        departureCityNo: '420100',
        arrivingCity: '上海',
        arrivingCityNo: '310100',
        arrivingCityType: '1',
        subsidyCity: '上海',
        subsidyCityNo: '310100',
        subsidyCityType: '1',
        itineraryRoute: '武汉-上海',
        applicationAmount: 0,
        subsidyAmount: 0,
        mealAllowance: 0,
        transportationAllowance: 0,
        phoneAllowance: 0,
        businessTypeId: 'bt001',
        businessTypeNo: 'BT001',
        businessTypeName: '差旅',
        sortNo: 1,
      },
    ],
    subsidyCalendars: [
      {
        id: 'server-calendar-1',
        clientItineraryId: '',
        clientSubsidyId: '',
        itineraryId: 'server-itinerary-1',
        subsidyId: 'server-subsidy-1',
        travelDate: '2026-05-21',
        travelDateWeek: '周三',
        subsidizedCities: '上海',
        subsidizedCityNumber: '310100',
        subsidizedCityType: '1',
        standardMealExpensesAmount: 100,
        standardTrafficAmount: 40,
        standardCommunicationAmount: 40,
        mealSelected: '0',
        trafficSelected: '0',
        communicationSelected: '0',
        mealExpensesAmount: 0,
        trafficAmount: 0,
        communicationAmount: 0,
        dailyStandardAmount: 0,
        dailyActualAmount: 0,
        remark: '',
        sortNo: 1,
      },
    ],
    allocations: [],
  }
}

describe('reimBillStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('normalizes server detail ids into stable client relation ids', () => {
    const store = useReimBillStore()

    store.applyDetail(createDetail())

    expect(store.itineraries[0]?.clientItineraryId).toBe('server-itinerary-1')
    expect(store.subsidies[0]?.clientSubsidyId).toBe('server-subsidy-1')
    expect(store.subsidies[0]?.clientItineraryId).toBe('server-itinerary-1')
    expect(store.subsidyCalendars[0]?.clientItineraryId).toBe('server-itinerary-1')
    expect(store.subsidyCalendars[0]?.clientSubsidyId).toBe('server-subsidy-1')
    expect(store.hasUnsavedChanges).toBe(false)
  })

  it('updates an existing saved draft itinerary locally without duplicating it and can discard changes', () => {
    const store = useReimBillStore()

    store.applyDetail(createDetail())
    const existing = store.itineraries[0]

    store.addOrUpdateItinerary({
      ...existing!,
      itineraryInstructions: '更新后的客户拜访',
    })

    expect(store.itineraries).toHaveLength(1)
    expect(store.itineraries[0]?.itineraryInstructions).toBe('更新后的客户拜访')
    expect(store.hasUnsavedChanges).toBe(true)

    store.discardUnsavedChanges()

    expect(store.itineraries).toHaveLength(1)
    expect(store.itineraries[0]?.itineraryInstructions).toBe('客户拜访')
    expect(store.hasUnsavedChanges).toBe(false)
  })
})
