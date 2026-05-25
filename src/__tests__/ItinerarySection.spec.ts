import { beforeEach, describe, expect, it, vi } from 'vitest'
import ElementPlus from 'element-plus'
import { ElMessageBox } from 'element-plus'
import { createPinia, setActivePinia } from 'pinia'
import { flushPromises, mount } from '@vue/test-utils'

import { REIM_STATUS } from '@/constants/reimStatus'
import { useReimBillStore } from '@/stores/reimBillStore'
import type { ReimBillDetailDTO, ReimItineraryDTO, ReimItineraryOperationDTO } from '@/types/reimBill'
import ItineraryDialog from '@/views/ReimBillDetail/components/ItineraryDialog.vue'
import ItinerarySection from '@/views/ReimBillDetail/components/ItinerarySection.vue'

const routeMock = vi.hoisted(() => ({
  path: '/reim-bills/create',
  params: {} as Record<string, string>,
}))

const apiMock = vi.hoisted(() => ({
  createReimItinerary: vi.fn(),
  updateReimItinerary: vi.fn(),
  deleteReimItinerary: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRoute: () => routeMock,
}))

vi.mock('@/api/reimBillApi', () => ({
  createReimItinerary: apiMock.createReimItinerary,
  updateReimItinerary: apiMock.updateReimItinerary,
  deleteReimItinerary: apiMock.deleteReimItinerary,
}))

const itinerary: ReimItineraryDTO = {
  id: 'server-itinerary-1',
  clientItineraryId: 'client-itinerary-1',
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
}

function createDetail(overrides?: Partial<ReimBillDetailDTO>): ReimBillDetailDTO {
  return {
    main: {
      id: 'bill-1',
      submitDate: '2026-05-23',
      reimbursementTitle: '北京出差报销',
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
      statusCode: REIM_STATUS.DRAFT.code,
      statusName: REIM_STATUS.DRAFT.name,
      remarks: '',
    },
    itineraries: [
      {
        ...itinerary,
        clientItineraryId: '',
      },
    ],
    subsidies: [],
    subsidyCalendars: [],
    allocations: [],
    ...overrides,
  }
}

function createOperationResult(nextItinerary = itinerary): ReimItineraryOperationDTO {
  return {
    itinerary: nextItinerary,
    subsidy: {
      id: 'server-subsidy-1',
      clientSubsidyId: 'server-subsidy-1',
      itineraryId: nextItinerary.id,
      clientItineraryId: nextItinerary.clientItineraryId,
      travelerId: nextItinerary.travelerId,
      travelerNo: nextItinerary.travelerNo,
      travelerName: nextItinerary.travelerName,
      departureDate: nextItinerary.departureDate,
      arrivalDate: nextItinerary.arrivalDate,
      subsidyDays: nextItinerary.itineraryDays,
      departureCity: nextItinerary.departureCity,
      departureCityNo: nextItinerary.departureCityNo,
      arrivingCity: nextItinerary.arrivingCity,
      arrivingCityNo: nextItinerary.arrivingCityNo,
      arrivingCityType: nextItinerary.arrivingCityType,
      subsidyCity: nextItinerary.arrivingCity,
      subsidyCityNo: nextItinerary.arrivingCityNo,
      subsidyCityType: nextItinerary.arrivingCityType,
      itineraryRoute: nextItinerary.itineraryRoute,
      applicationAmount: 0,
      subsidyAmount: 0,
      mealAllowance: 0,
      transportationAllowance: 0,
      phoneAllowance: 0,
      businessTypeId: 'bt001',
      businessTypeNo: 'BT001',
      businessTypeName: '差旅',
      sortNo: nextItinerary.sortNo,
    },
  }
}

describe('ItinerarySection persistence', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    routeMock.path = '/reim-bills/create'
    routeMock.params = {}
    vi.clearAllMocks()
  })

  it('keeps create-mode itinerary saves local until bill submit', async () => {
    const store = useReimBillStore()
    store.initCreate()
    const loadDetailSpy = vi.spyOn(store, 'loadDetail')
    const wrapper = mount(ItinerarySection, {
      global: {
        plugins: [ElementPlus],
      },
    })

    wrapper.findComponent(ItineraryDialog).vm.$emit('save', itinerary)
    await flushPromises()

    expect(store.itineraries).toHaveLength(1)
    expect(store.itineraries[0]?.clientItineraryId).toBe('client-itinerary-1')
    expect(apiMock.createReimItinerary).not.toHaveBeenCalled()
    expect(loadDetailSpy).not.toHaveBeenCalled()
  })

  it('creates an itinerary through backend when editing an existing bill', async () => {
    routeMock.path = '/reim-bills/detail/bill-1'
    routeMock.params = { id: 'bill-1' }
    apiMock.createReimItinerary.mockResolvedValue(createOperationResult())
    const store = useReimBillStore()
    store.applyDetail(createDetail({ itineraries: [] }))
    const loadDetailSpy = vi.spyOn(store, 'loadDetail').mockResolvedValue(undefined)
    const wrapper = mount(ItinerarySection, {
      global: {
        plugins: [ElementPlus],
      },
    })

    wrapper.findComponent(ItineraryDialog).vm.$emit('save', { ...itinerary, id: null })
    await flushPromises()

    expect(apiMock.createReimItinerary).toHaveBeenCalledWith('bill-1', { ...itinerary, id: null })
    expect(loadDetailSpy).toHaveBeenCalledWith('bill-1')
    expect(wrapper.findComponent(ItineraryDialog).props('saving')).toBe(false)
  })

  it('updates an existing itinerary through backend and refreshes detail', async () => {
    routeMock.path = '/reim-bills/detail/bill-1'
    routeMock.params = { id: 'bill-1' }
    const updated = {
      ...itinerary,
      itineraryInstructions: '更新后的客户拜访',
    }
    apiMock.updateReimItinerary.mockResolvedValue(createOperationResult(updated))
    const store = useReimBillStore()
    store.applyDetail(createDetail())
    const loadDetailSpy = vi.spyOn(store, 'loadDetail').mockResolvedValue(undefined)
    const wrapper = mount(ItinerarySection, {
      global: {
        plugins: [ElementPlus],
      },
    })

    const existing = store.itineraries[0] as ReimItineraryDTO
    ;(wrapper.vm as unknown as { openEdit: (row: ReimItineraryDTO) => void }).openEdit(existing)
    wrapper.findComponent(ItineraryDialog).vm.$emit('save', updated)
    await flushPromises()

    expect(apiMock.updateReimItinerary).toHaveBeenCalledWith('bill-1', 'server-itinerary-1', updated)
    expect(loadDetailSpy).toHaveBeenCalledWith('bill-1')
  })

  it('deletes an existing itinerary through backend and applies returned detail', async () => {
    routeMock.path = '/reim-bills/detail/bill-1'
    routeMock.params = { id: 'bill-1' }
    vi.spyOn(ElMessageBox, 'confirm').mockResolvedValue('confirm' as never)
    const nextDetail = createDetail({ itineraries: [] })
    apiMock.deleteReimItinerary.mockResolvedValue(nextDetail)
    const store = useReimBillStore()
    store.applyDetail(createDetail())
    const applyDetailSpy = vi.spyOn(store, 'applyDetail')
    const wrapper = mount(ItinerarySection, {
      global: {
        plugins: [ElementPlus],
      },
    })

    await (wrapper.vm as unknown as { handleDelete: (row: ReimItineraryDTO) => Promise<void> }).handleDelete(
      store.itineraries[0] as ReimItineraryDTO,
    )
    await flushPromises()

    expect(apiMock.deleteReimItinerary).toHaveBeenCalledWith('bill-1', 'server-itinerary-1')
    expect(applyDetailSpy).toHaveBeenCalledWith(nextDetail)
    expect(store.itineraries).toHaveLength(0)
  })

  it('keeps dialog open and local data unchanged when backend save fails', async () => {
    routeMock.path = '/reim-bills/detail/bill-1'
    routeMock.params = { id: 'bill-1' }
    apiMock.updateReimItinerary.mockRejectedValue(new Error('network error'))
    const store = useReimBillStore()
    store.applyDetail(createDetail())
    const loadDetailSpy = vi.spyOn(store, 'loadDetail')
    const wrapper = mount(ItinerarySection, {
      global: {
        plugins: [ElementPlus],
      },
    })

    const existing = store.itineraries[0] as ReimItineraryDTO
    ;(wrapper.vm as unknown as { openEdit: (row: ReimItineraryDTO) => void }).openEdit(existing)
    await wrapper.vm.$nextTick()
    wrapper.findComponent(ItineraryDialog).vm.$emit('save', {
      ...existing,
      itineraryInstructions: '失败时不能落本地',
    })
    await flushPromises()

    expect(apiMock.updateReimItinerary).toHaveBeenCalled()
    expect(loadDetailSpy).not.toHaveBeenCalled()
    expect(wrapper.findComponent(ItineraryDialog).props('visible')).toBe(true)
    expect(store.itineraries[0]?.itineraryInstructions).toBe('客户拜访')
  })
})
