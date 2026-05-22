import dayjs from 'dayjs'
import { defineStore } from 'pinia'

import { getReimBillDetail } from '@/api/reimBillApi'
import { REIM_TYPE } from '@/constants/reimStatus'
import { reimCompanyOptions } from '@/constants/staticData'
import type {
  ReimAllocationDTO,
  ReimBillDetailDTO,
  ReimBillSubmitDTO,
  ReimItineraryDTO,
  ReimMainDTO,
  ReimSubsidyDTO,
  SubsidyCalendarDTO,
} from '@/types/reimBill'
import { recalcFirstAllocation } from '@/utils/allocation'
import { addMoney } from '@/utils/money'
import {
  buildCalendarsByItinerary,
  buildSubsidyByItinerary,
  summarizeCalendarsToSubsidy,
} from '@/utils/subsidy'

function createEmptyMain(): ReimMainDTO {
  return {
    reimTypeCode: REIM_TYPE.code,
    reimTypeName: REIM_TYPE.name,
    submitDate: dayjs().format('YYYY-MM-DD'),
    reimbursementTitle: '',
    reimburserId: '',
    reimburserNo: '',
    reimburserName: '',
    reimDepartmentId: '',
    reimDepartmentNo: '',
    reimDepartmentName: '',
    reimCompanyId: '',
    reimCompanyNo: '',
    reimCompanyName: '',
    businessTypeId: '',
    businessTypeNo: '',
    businessTypeName: '',
    businessTripReason: '',
    subsidyTotal: 0,
    mealAllowance: 0,
    transportationAllowance: 0,
    phoneAllowance: 0,
    allocationTotal: 0,
    remarks: '',
  }
}

function createDefaultAllocation(total = 0): ReimAllocationDTO {
  const company = reimCompanyOptions[0]
  return {
    reimCompanyId: company?.reimCompanyId || '',
    reimCompanyNo: company?.reimCompanyNo || '',
    reimCompanyName: company?.reimCompanyName || '',
    projectId: null,
    projectNo: null,
    projectName: null,
    allocationRatio: 1,
    allocationAmount: total,
    isFirstRow: '1',
    sortNo: 1,
  }
}

export const useReimBillStore = defineStore('reimBill', {
  state: () => ({
    main: createEmptyMain(),
    itineraries: [] as ReimItineraryDTO[],
    subsidies: [] as ReimSubsidyDTO[],
    subsidyCalendars: [] as SubsidyCalendarDTO[],
    allocations: [createDefaultAllocation()] as ReimAllocationDTO[],
  }),

  getters: {
    isReadonly: (state) => state.main.statusCode === '2',
  },

  actions: {
    initCreate(copyData?: ReimBillDetailDTO) {
      if (copyData) {
        this.applyDetail(copyData)
        this.main.id = null
        this.main.reimNo = null
        this.main.statusCode = null
        this.main.statusName = null
        this.main.submitDate = dayjs().format('YYYY-MM-DD')
        return
      }

      this.main = createEmptyMain()
      this.itineraries = []
      this.subsidies = []
      this.subsidyCalendars = []
      this.allocations = [createDefaultAllocation()]
    },

    async loadDetail(id: string) {
      const detail = await getReimBillDetail(id)
      this.applyDetail(detail)
    },

    applyDetail(detail: ReimBillDetailDTO) {
      this.main = { ...createEmptyMain(), ...detail.main }
      this.itineraries = [...(detail.itineraries || [])]
      this.subsidies = [...(detail.subsidies || [])]
      this.subsidyCalendars = [...(detail.subsidyCalendars || [])]
      this.allocations = detail.allocations?.length ? [...detail.allocations] : [createDefaultAllocation()]
      this.recalcExpenseTotal()
      this.recalcAllocationByTotal()
    },

    addOrUpdateItinerary(itinerary: ReimItineraryDTO) {
      const index = this.itineraries.findIndex(
        (item) => item.clientItineraryId === itinerary.clientItineraryId,
      )
      if (index >= 0) {
        this.itineraries[index] = itinerary
      } else {
        this.itineraries.push(itinerary)
      }
      this.resortItineraries()

      const existingSubsidy = this.subsidies.find(
        (item) => item.clientItineraryId === itinerary.clientItineraryId,
      )
      const subsidy = buildSubsidyByItinerary(itinerary, this.main, existingSubsidy)
      this.addOrUpdateSubsidy(subsidy)
      this.replaceCalendarsByItinerary(
        itinerary.clientItineraryId,
        buildCalendarsByItinerary(itinerary, subsidy),
      )
      this.recalcExpenseTotal()
      this.recalcAllocationByTotal()
    },

    deleteItinerary(clientItineraryId: string) {
      this.itineraries = this.itineraries.filter((item) => item.clientItineraryId !== clientItineraryId)
      this.subsidies = this.subsidies.filter((item) => item.clientItineraryId !== clientItineraryId)
      this.subsidyCalendars = this.subsidyCalendars.filter(
        (item) => item.clientItineraryId !== clientItineraryId,
      )
      this.resortItineraries()
      this.recalcExpenseTotal()
      this.recalcAllocationByTotal()
    },

    addOrUpdateSubsidy(subsidy: ReimSubsidyDTO) {
      const index = this.subsidies.findIndex((item) => item.clientSubsidyId === subsidy.clientSubsidyId)
      if (index >= 0) this.subsidies[index] = subsidy
      else this.subsidies.push(subsidy)
    },

    replaceCalendarsByItinerary(clientItineraryId: string, calendars: SubsidyCalendarDTO[]) {
      this.subsidyCalendars = [
        ...this.subsidyCalendars.filter((item) => item.clientItineraryId !== clientItineraryId),
        ...calendars,
      ]
    },

    saveSubsidyCalendars(clientSubsidyId: string, calendars: SubsidyCalendarDTO[]) {
      this.subsidyCalendars = [
        ...this.subsidyCalendars.filter((item) => item.clientSubsidyId !== clientSubsidyId),
        ...calendars,
      ]
      const subsidy = this.subsidies.find((item) => item.clientSubsidyId === clientSubsidyId)
      if (subsidy) summarizeCalendarsToSubsidy(subsidy, this.subsidyCalendars)
      this.recalcExpenseTotal()
      this.recalcAllocationByTotal()
    },

    recalcExpenseTotal() {
      this.main.subsidyTotal = addMoney(this.subsidies.map((item) => item.subsidyAmount))
      this.main.mealAllowance = addMoney(this.subsidies.map((item) => item.mealAllowance))
      this.main.transportationAllowance = addMoney(
        this.subsidies.map((item) => item.transportationAllowance),
      )
      this.main.phoneAllowance = addMoney(this.subsidies.map((item) => item.phoneAllowance))
      this.main.allocationTotal = this.main.subsidyTotal
    },

    recalcAllocationByTotal() {
      if (this.allocations.length === 0) this.allocations = [createDefaultAllocation(this.main.subsidyTotal)]
      recalcFirstAllocation(this.allocations, this.main.subsidyTotal)
    },

    resortItineraries() {
      this.itineraries.forEach((item, index) => {
        item.sortNo = index + 1
      })
      this.subsidies.forEach((item, index) => {
        item.sortNo = index + 1
      })
    },

    buildSubmitPayload(): ReimBillSubmitDTO {
      this.recalcExpenseTotal()
      this.recalcAllocationByTotal()
      return {
        main: { ...this.main },
        itineraries: this.itineraries.map((item) => ({ ...item })),
        subsidies: this.subsidies.map((item) => ({ ...item })),
        subsidyCalendars: this.subsidyCalendars.map((item) => ({ ...item })),
        allocations: this.allocations.map((item) => ({ ...item })),
      }
    },
  },
})
