import { beforeEach, describe, expect, it, vi } from 'vitest'
import ElementPlus from 'element-plus'
import { ElMessageBox } from 'element-plus'
import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'

import { REIM_STATUS } from '@/constants/reimStatus'
import { useReimBillStore } from '@/stores/reimBillStore'
import type { ReimBillDetailDTO, ReimItineraryDTO } from '@/types/reimBill'
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

function createDetail(): ReimBillDetailDTO {
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
    itineraries: [itinerary],
    subsidies: [],
    subsidyCalendars: [],
    allocations: [],
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
    await wrapper.vm.$nextTick()

    expect(store.itineraries).toHaveLength(1)
    expect(store.itineraries[0]?.clientItineraryId).toBe('client-itinerary-1')
    expect(apiMock.createReimItinerary).not.toHaveBeenCalled()
    expect(loadDetailSpy).not.toHaveBeenCalled()
  })

  it('creates an itinerary immediately for existing bills and refreshes detail', async () => {
    routeMock.path = '/reim-bills/detail/bill-1'
    routeMock.params = { id: 'bill-1' }
    apiMock.createReimItinerary.mockResolvedValue(true)
    const store = useReimBillStore()
    store.applyDetail(createDetail())
    const loadDetailSpy = vi.spyOn(store, 'loadDetail').mockResolvedValue(undefined)
    const wrapper = mount(ItinerarySection, {
      global: {
        plugins: [ElementPlus],
      },
    })

    wrapper.findComponent(ItineraryDialog).vm.$emit('save', {
      ...itinerary,
      id: null,
      clientItineraryId: 'new-client-itinerary',
    })
    await vi.waitFor(() => expect(apiMock.createReimItinerary).toHaveBeenCalled())

    expect(apiMock.createReimItinerary).toHaveBeenCalledWith(
      'bill-1',
      expect.objectContaining({ clientItineraryId: 'new-client-itinerary' }),
    )
    expect(loadDetailSpy).toHaveBeenCalledWith('bill-1')
  })

  it('updates an existing itinerary immediately and refreshes detail', async () => {
    routeMock.path = '/reim-bills/detail/bill-1'
    routeMock.params = { id: 'bill-1' }
    apiMock.updateReimItinerary.mockResolvedValue(true)
    const store = useReimBillStore()
    store.applyDetail(createDetail())
    const loadDetailSpy = vi.spyOn(store, 'loadDetail').mockResolvedValue(undefined)
    const wrapper = mount(ItinerarySection, {
      global: {
        plugins: [ElementPlus],
      },
    })

    ;(wrapper.vm as unknown as { openEdit: (row: ReimItineraryDTO) => void }).openEdit(itinerary)
    wrapper.findComponent(ItineraryDialog).vm.$emit('save', {
      ...itinerary,
      itineraryInstructions: '更新后的客户拜访',
    })
    await vi.waitFor(() => expect(apiMock.updateReimItinerary).toHaveBeenCalled())

    expect(apiMock.updateReimItinerary).toHaveBeenCalledWith(
      'bill-1',
      'server-itinerary-1',
      expect.objectContaining({ itineraryInstructions: '更新后的客户拜访' }),
    )
    expect(loadDetailSpy).toHaveBeenCalledWith('bill-1')
  })

  it('deletes an existing itinerary immediately and refreshes detail', async () => {
    routeMock.path = '/reim-bills/detail/bill-1'
    routeMock.params = { id: 'bill-1' }
    apiMock.deleteReimItinerary.mockResolvedValue(true)
    vi.spyOn(ElMessageBox, 'confirm').mockResolvedValue('confirm' as never)
    const store = useReimBillStore()
    store.applyDetail(createDetail())
    const loadDetailSpy = vi.spyOn(store, 'loadDetail').mockResolvedValue(undefined)
    const wrapper = mount(ItinerarySection, {
      global: {
        plugins: [ElementPlus],
      },
    })

    await (wrapper.vm as unknown as { handleDelete: (row: ReimItineraryDTO) => Promise<void> }).handleDelete(
      itinerary,
    )
    await vi.waitFor(() => expect(apiMock.deleteReimItinerary).toHaveBeenCalled())

    expect(apiMock.deleteReimItinerary).toHaveBeenCalledWith('bill-1', 'server-itinerary-1')
    expect(loadDetailSpy).toHaveBeenCalledWith('bill-1')
  })
})
