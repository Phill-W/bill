import { describe, expect, it } from 'vitest'

import { recalcFirstAllocation } from '@/utils/allocation'
import { calcDays, listDates } from '@/utils/date'
import { hasOverlappedItinerary } from '@/utils/itinerary'
import {
  buildCalendarsByItinerary,
  buildSubsidyByItinerary,
  recalcCalendarRow,
  summarizeCalendarsToSubsidy,
} from '@/utils/subsidy'
import { validateSubmit } from '@/utils/validate'
import type {
  ReimAllocationDTO,
  ReimItineraryDTO,
  ReimMainDTO,
  ReimSubsidyDTO,
  SubsidyCalendarDTO,
} from '@/types/reimBill'

const baseMain: ReimMainDTO = {
  submitDate: '2026-04-23',
  reimbursementTitle: '项目出差',
  reimburserId: '13AB3A3F72409002',
  reimburserNo: '74541',
  reimburserName: '徐年年',
  reimDepartmentId: '13AB8D7B52A9B002',
  reimDepartmentNo: '072001',
  reimDepartmentName: '客户成功事业部',
  reimCompanyId: '1C54557F1782E000',
  reimCompanyNo: '0407',
  reimCompanyName: '胜意科技北京分公司',
  businessTypeId: '1B5FEB7DD4396000',
  businessTypeNo: '10010010101',
  businessTypeName: '项目出差',
  businessTripReason: '客户现场支持',
  subsidyTotal: 0,
  mealAllowance: 0,
  transportationAllowance: 0,
  phoneAllowance: 0,
  allocationTotal: 0,
  remarks: '',
}

const baseItinerary: ReimItineraryDTO = {
  clientItineraryId: 'iti-1',
  travelerId: '13AB3A3F72409002',
  travelerNo: '74541',
  travelerName: '徐年年',
  departureDate: '2026-04-13',
  arrivalDate: '2026-04-17',
  itineraryDays: 5,
  departureCity: '武汉',
  departureCityNo: '10458',
  departureCityType: '2',
  arrivingCity: '北京',
  arrivingCityNo: '10119',
  arrivingCityType: '1',
  itineraryRoute: '武汉-北京',
  itineraryInstructions: '客户现场支持',
  sortNo: 1,
}

describe('date helpers', () => {
  it('calculates inclusive trip days and date list', () => {
    expect(calcDays('2026-04-13', '2026-04-17')).toBe(5)
    expect(listDates('2026-04-13', '2026-04-15')).toEqual([
      '2026-04-13',
      '2026-04-14',
      '2026-04-15',
    ])
  })
})

describe('itinerary validation helpers', () => {
  it('detects overlapped date ranges for the same traveler only', () => {
    const existing: ReimItineraryDTO[] = [baseItinerary]
    expect(
      hasOverlappedItinerary(existing, {
        ...baseItinerary,
        clientItineraryId: 'iti-2',
        departureDate: '2026-04-15',
        arrivalDate: '2026-04-18',
      }),
    ).toBe(true)
    expect(
      hasOverlappedItinerary(existing, {
        ...baseItinerary,
        clientItineraryId: 'iti-2',
        travelerId: 'other',
        departureDate: '2026-04-15',
        arrivalDate: '2026-04-18',
      }),
    ).toBe(false)
  })
})

describe('subsidy helpers', () => {
  it('builds default unselected calendars from itinerary dates', () => {
    const subsidy = buildSubsidyByItinerary(baseItinerary, baseMain)
    const calendars = buildCalendarsByItinerary(baseItinerary, subsidy)

    expect(subsidy.subsidyAmount).toBe(0)
    expect(calendars).toHaveLength(5)
    expect(calendars[0]).toMatchObject({
      travelDate: '2026-04-13',
      subsidizedCities: '北京',
      standardMealExpensesAmount: 100,
      standardTrafficAmount: 40,
      standardCommunicationAmount: 40,
      mealSelected: '0',
      trafficSelected: '0',
      communicationSelected: '0',
      dailyStandardAmount: 0,
      dailyActualAmount: 0,
    })
  })

  it('recalculates selected calendar rows and writes totals back to subsidy', () => {
    const subsidy: ReimSubsidyDTO = buildSubsidyByItinerary(baseItinerary, baseMain)
    const calendars: SubsidyCalendarDTO[] = buildCalendarsByItinerary(baseItinerary, subsidy)
    const first = calendars[0]!

    first.mealSelected = '1'
    first.trafficSelected = '1'
    first.mealExpensesAmount = first.standardMealExpensesAmount
    first.trafficAmount = first.standardTrafficAmount
    recalcCalendarRow(first)
    summarizeCalendarsToSubsidy(subsidy, calendars)

    expect(first.dailyStandardAmount).toBe(140)
    expect(first.dailyActualAmount).toBe(140)
    expect(subsidy.applicationAmount).toBe(140)
    expect(subsidy.subsidyAmount).toBe(140)
    expect(subsidy.mealAllowance).toBe(100)
    expect(subsidy.transportationAllowance).toBe(40)
  })

  it('ignores unselected allowance amounts when summarizing calendars', () => {
    const subsidy: ReimSubsidyDTO = buildSubsidyByItinerary(baseItinerary, baseMain)
    const calendars: SubsidyCalendarDTO[] = buildCalendarsByItinerary(baseItinerary, subsidy)
    const first = calendars[0]!

    first.mealSelected = '0'
    first.mealExpensesAmount = first.standardMealExpensesAmount
    first.trafficSelected = '1'
    first.trafficAmount = first.standardTrafficAmount
    recalcCalendarRow(first)
    summarizeCalendarsToSubsidy(subsidy, calendars)

    expect(first.dailyStandardAmount).toBe(40)
    expect(first.dailyActualAmount).toBe(40)
    expect(subsidy.mealAllowance).toBe(0)
    expect(subsidy.transportationAllowance).toBe(40)
    expect(subsidy.subsidyAmount).toBe(40)
  })
})

describe('allocation helpers', () => {
  it('uses the first allocation row as the rounding fallback', () => {
    const allocations: ReimAllocationDTO[] = [
      {
        reimCompanyId: '1C54557F1782E000',
        reimCompanyNo: '0407',
        reimCompanyName: '胜意科技北京分公司',
        projectId: null,
        projectNo: null,
        projectName: null,
        allocationRatio: 1,
        allocationAmount: 1000,
        isFirstRow: '1',
        sortNo: 1,
      },
      {
        reimCompanyId: '19218A262C976000',
        reimCompanyNo: '0408',
        reimCompanyName: '胜意科技上海分公司',
        projectId: null,
        projectNo: null,
        projectName: null,
        allocationRatio: 0.3333,
        allocationAmount: 333.33,
        isFirstRow: '0',
        sortNo: 2,
      },
    ]

    recalcFirstAllocation(allocations, 1000)

    expect(allocations[0]!.allocationRatio).toBe(0.6667)
    expect(allocations[0]!.allocationAmount).toBe(666.67)
  })
})

describe('submit validation', () => {
  it('rejects missing required data before submit', () => {
    const errors = validateSubmit({
      main: { ...baseMain, reimbursementTitle: '' },
      itineraries: [],
      subsidies: [],
      subsidyCalendars: [],
      allocations: [],
    })

    expect(errors[0]).toBe('请填写报销标题')
  })
})
