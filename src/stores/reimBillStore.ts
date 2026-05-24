import dayjs from 'dayjs'
import { defineStore } from 'pinia'

import { getReimBillDetail } from '@/api/reimBillApi'
import { REIM_STATUS, REIM_TYPE, isReadonlyReimBill } from '@/constants/reimStatus'
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

function cloneDetail(detail: ReimBillDetailDTO): ReimBillDetailDTO {
  return JSON.parse(JSON.stringify(detail)) as ReimBillDetailDTO
}

function serializeDetail(detail: ReimBillDetailDTO | null) {
  return JSON.stringify(detail ?? null)
}

function createCurrentDetailSnapshot(
  main: ReimMainDTO,
  itineraries: ReimItineraryDTO[],
  subsidies: ReimSubsidyDTO[],
  subsidyCalendars: SubsidyCalendarDTO[],
  allocations: ReimAllocationDTO[],
): ReimBillDetailDTO {
  return cloneDetail({
    main,
    itineraries,
    subsidies,
    subsidyCalendars,
    allocations,
  })
}

function normalizeDetail(detail: ReimBillDetailDTO): ReimBillDetailDTO {
  const itineraryClientIds = new Map<string, string>()
  const subsidyClientIds = new Map<string, string>()
  const itineraries = (detail.itineraries || []).map((item, index) => {
    const clientItineraryId = item.clientItineraryId || item.id || `itinerary-${index + 1}`
    if (item.id) itineraryClientIds.set(item.id, clientItineraryId)
    return {
      ...item,
      clientItineraryId,
    }
  })
  const subsidies = (detail.subsidies || []).map((item, index) => {
    const clientSubsidyId = item.clientSubsidyId || item.id || `subsidy-${index + 1}`
    const clientItineraryId =
      item.clientItineraryId ||
      itineraryClientIds.get(String(item.itineraryId || '')) ||
      String(item.itineraryId || item.id || `itinerary-${index + 1}`)
    if (item.id) subsidyClientIds.set(item.id, clientSubsidyId)
    return {
      ...item,
      clientSubsidyId,
      clientItineraryId,
    }
  })
  const subsidyCalendars = (detail.subsidyCalendars || []).map((item, index) => ({
    ...item,
    clientItineraryId:
      item.clientItineraryId ||
      itineraryClientIds.get(String(item.itineraryId || '')) ||
      String(item.itineraryId || `calendar-itinerary-${index + 1}`),
    clientSubsidyId:
      item.clientSubsidyId ||
      subsidyClientIds.get(String(item.subsidyId || '')) ||
      String(item.subsidyId || `calendar-subsidy-${index + 1}`),
  }))

  return {
    main: { ...createEmptyMain(), ...detail.main },
    itineraries,
    subsidies,
    subsidyCalendars,
    allocations: detail.allocations?.length ? [...detail.allocations] : [createDefaultAllocation()],
  }
}

function createEmptyMain(): ReimMainDTO {
  return {
    reimTypeCode: REIM_TYPE.code,
    reimTypeName: REIM_TYPE.name,
    statusCode: REIM_STATUS.DRAFT.code,
    statusName: REIM_STATUS.DRAFT.name,
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
    baselineDetail: null as ReimBillDetailDTO | null,
    forceDirty: false,
  }),

  getters: {
    isReadonly: (state) => isReadonlyReimBill(state.main.statusCode, state.main.statusName),
    hasUnsavedChanges: (state) =>
      state.forceDirty ||
      serializeDetail(
        createCurrentDetailSnapshot(
          state.main,
          state.itineraries,
          state.subsidies,
          state.subsidyCalendars,
          state.allocations,
        ),
      ) !== serializeDetail(state.baselineDetail),
  },

  actions: {
    initCreate(copyData?: ReimBillDetailDTO) {
      if (copyData) {
        this.applyDetail(copyData)
        this.main.id = null
        this.main.reimNo = null
        this.main.statusCode = REIM_STATUS.DRAFT.code
        this.main.statusName = REIM_STATUS.DRAFT.name
        this.main.submitDate = dayjs().format('YYYY-MM-DD')
        this.commitBaseline()
        this.forceDirty = true
        return
      }

      this.main = createEmptyMain()
      this.itineraries = []
      this.subsidies = []
      this.subsidyCalendars = []
      this.allocations = [createDefaultAllocation()]
      this.commitBaseline()
    },

    async loadDetail(id: string) {
      const detail = await getReimBillDetail(id)
      this.applyDetail(detail)
    },

    applyDetail(detail: ReimBillDetailDTO) {
      const normalized = normalizeDetail(detail)
      this.main = normalized.main
      this.itineraries = normalized.itineraries
      this.subsidies = normalized.subsidies
      this.subsidyCalendars = normalized.subsidyCalendars
      this.allocations = normalized.allocations
      this.recalcExpenseTotal()
      this.recalcAllocationByTotal()
      this.commitBaseline()
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

    currentDetailSnapshot() {
      return createCurrentDetailSnapshot(
        this.main,
        this.itineraries,
        this.subsidies,
        this.subsidyCalendars,
        this.allocations,
      )
    },

    commitBaseline() {
      this.baselineDetail = this.currentDetailSnapshot()
      this.forceDirty = false
    },

    discardUnsavedChanges() {
      if (!this.baselineDetail) {
        return
      }
      const baseline = cloneDetail(this.baselineDetail)
      this.main = baseline.main
      this.itineraries = baseline.itineraries
      this.subsidies = baseline.subsidies
      this.subsidyCalendars = baseline.subsidyCalendars
      this.allocations = baseline.allocations
      this.forceDirty = false
    },
  },
})
