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
    itineraries: [
      {
        ...itinerary,
        clientItineraryId: '',
      },
    ],
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

  it('edits an existing draft itinerary locally instead of calling the backend', async () => {
    routeMock.path = '/reim-bills/detail/bill-1'
    routeMock.params = { id: 'bill-1' }
    const store = useReimBillStore()
    store.applyDetail(createDetail())
    const loadDetailSpy = vi.spyOn(store, 'loadDetail')
    const wrapper = mount(ItinerarySection, {
      global: {
        plugins: [ElementPlus],
      },
    })

    const existing = store.itineraries[0]
    expect(existing?.clientItineraryId).toBe('server-itinerary-1')

    ;(wrapper.vm as unknown as { openEdit: (row: ReimItineraryDTO) => void }).openEdit(existing as ReimItineraryDTO)
    wrapper.findComponent(ItineraryDialog).vm.$emit('save', {
      ...existing,
      itineraryInstructions: '更新后的客户拜访',
    })
    await wrapper.vm.$nextTick()

    expect(store.itineraries).toHaveLength(1)
    expect(store.itineraries[0]?.itineraryInstructions).toBe('更新后的客户拜访')
    expect(apiMock.updateReimItinerary).not.toHaveBeenCalled()
    expect(loadDetailSpy).not.toHaveBeenCalled()
  })

  it('copies and deletes draft itineraries locally for existing draft bills', async () => {
    routeMock.path = '/reim-bills/detail/bill-1'
    routeMock.params = { id: 'bill-1' }
    vi.spyOn(ElMessageBox, 'confirm').mockResolvedValue('confirm' as never)
    const store = useReimBillStore()
    store.applyDetail(createDetail())
    const loadDetailSpy = vi.spyOn(store, 'loadDetail')
    const wrapper = mount(ItinerarySection, {
      global: {
        plugins: [ElementPlus],
      },
    })

    const existing = store.itineraries[0] as ReimItineraryDTO
    ;(wrapper.vm as unknown as { openCopy: (row: ReimItineraryDTO) => void }).openCopy(existing)
    wrapper.findComponent(ItineraryDialog).vm.$emit('save', {
      ...existing,
      id: null,
      clientItineraryId: 'client-copy-itinerary-1',
      itineraryInstructions: '复制后的行程',
      sortNo: 2,
    })
    await wrapper.vm.$nextTick()

    expect(store.itineraries).toHaveLength(2)
    expect(apiMock.createReimItinerary).not.toHaveBeenCalled()

    await (wrapper.vm as unknown as { handleDelete: (row: ReimItineraryDTO) => Promise<void> }).handleDelete(
      store.itineraries[1] as ReimItineraryDTO,
    )

    expect(store.itineraries).toHaveLength(1)
    expect(apiMock.deleteReimItinerary).not.toHaveBeenCalled()
    expect(loadDetailSpy).not.toHaveBeenCalled()
  })
})
