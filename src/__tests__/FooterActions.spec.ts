import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ElementPlus, { ElMessageBox } from 'element-plus'
import { createPinia, setActivePinia } from 'pinia'
import { flushPromises, mount } from '@vue/test-utils'

import { useReimBillStore } from '@/stores/reimBillStore'
import FooterActions from '@/views/ReimBillDetail/components/FooterActions.vue'

const routeMock = vi.hoisted(() => ({
  path: '/reim-bills/create',
  params: {} as Record<string, string>,
}))

const routerMock = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
}))

const apiMock = vi.hoisted(() => ({
  createReimBillDraft: vi.fn(),
  updateReimBillDraft: vi.fn(),
  submitReimBill: vi.fn(),
  updateReimBill: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRoute: () => routeMock,
  useRouter: () => routerMock,
}))

vi.mock('@/api/reimBillApi', () => ({
  createReimBillDraft: apiMock.createReimBillDraft,
  updateReimBillDraft: apiMock.updateReimBillDraft,
  submitReimBill: apiMock.submitReimBill,
  updateReimBill: apiMock.updateReimBill,
}))

describe('FooterActions', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
    routeMock.path = '/reim-bills/create'
    routeMock.params = {}
    vi.clearAllMocks()
    routerMock.push.mockResolvedValue(undefined)
    routerMock.replace.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  async function settleActions() {
    await flushPromises()
    await vi.runAllTimersAsync()
    await flushPromises()
  }

  it('requires a title before saving a draft', async () => {
    const store = useReimBillStore()
    store.initCreate()
    const wrapper = mount(FooterActions, {
      global: {
        plugins: [ElementPlus],
      },
    })

    await (wrapper.vm as unknown as { handleSaveDraft: () => Promise<void> }).handleSaveDraft()

    expect(apiMock.createReimBillDraft).not.toHaveBeenCalled()
  })

  it('creates a draft, switches to detail route, and reloads the saved bill', async () => {
    const store = useReimBillStore()
    store.initCreate()
    store.main.reimbursementTitle = '杭州出差报销'
    const loadDetailSpy = vi.spyOn(store, 'loadDetail').mockResolvedValue(undefined)
    apiMock.createReimBillDraft.mockResolvedValue({
      id: 'bill-1',
      reimNo: 'BX202605240001',
      statusCode: '0',
      statusName: '草稿',
    })
    const wrapper = mount(FooterActions, {
      global: {
        plugins: [ElementPlus],
      },
    })

    const action = (wrapper.vm as unknown as { handleSaveDraft: () => Promise<void> }).handleSaveDraft()
    await settleActions()
    await action

    expect(apiMock.createReimBillDraft).toHaveBeenCalled()
    expect(routerMock.replace).toHaveBeenCalledWith('/reim-bills/detail/bill-1')
    expect(loadDetailSpy).toHaveBeenCalledWith('bill-1')
  })

  it('closes immediately when nothing changed', async () => {
    const store = useReimBillStore()
    store.initCreate()
    const confirmSpy = vi.spyOn(ElMessageBox, 'confirm')
    const wrapper = mount(FooterActions, {
      global: {
        plugins: [ElementPlus],
      },
    })

    await (wrapper.vm as unknown as { handleClose: () => Promise<void> }).handleClose()

    expect(confirmSpy).not.toHaveBeenCalled()
    expect(routerMock.push).toHaveBeenCalledWith('/reim-bills')
  })

  it('can discard unsaved changes when closing a draft page', async () => {
    const store = useReimBillStore()
    store.initCreate()
    store.main.reimbursementTitle = '待提交草稿'
    vi.spyOn(ElMessageBox, 'confirm').mockRejectedValue('cancel')
    const discardSpy = vi.spyOn(store, 'discardUnsavedChanges')
    const wrapper = mount(FooterActions, {
      global: {
        plugins: [ElementPlus],
      },
    })

    await (wrapper.vm as unknown as { handleClose: () => Promise<void> }).handleClose()

    expect(discardSpy).toHaveBeenCalled()
    expect(routerMock.push).toHaveBeenCalledWith('/reim-bills')
  })

  it('locks the footer while saving a draft to avoid duplicate submissions', async () => {
    const store = useReimBillStore()
    store.initCreate()
    store.main.reimbursementTitle = '杭州出差报销'
    const deferred = new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: 'bill-1',
          reimNo: 'BX202605240001',
          statusCode: '0',
          statusName: '草稿',
        })
      }, 1)
    })
    const loadDetailSpy = vi.spyOn(store, 'loadDetail').mockResolvedValue(undefined)
    apiMock.createReimBillDraft.mockReturnValue(deferred)
    const wrapper = mount(FooterActions, {
      global: {
        plugins: [ElementPlus],
      },
    })

    const buttons = wrapper.findAll('button')
    await buttons[1]?.trigger('click')

    expect(wrapper.get('.footer-actions').attributes('data-state')).toBe('busy')
    expect(apiMock.createReimBillDraft).toHaveBeenCalledTimes(1)

    await buttons[1]?.trigger('click')
    expect(apiMock.createReimBillDraft).toHaveBeenCalledTimes(1)

    await settleActions()
    await flushPromises()
    expect(loadDetailSpy).toHaveBeenCalledWith('bill-1')
    expect(wrapper.get('.footer-actions').attributes('data-state')).toBe('idle')
  })

  it('shows submit loading and prevents duplicate submit requests', async () => {
    const store = useReimBillStore()
    store.initCreate()
    store.main.reimbursementTitle = '杭州出差报销'
    store.main.reimburserId = 'employee-1'
    store.main.reimDepartmentId = 'department-1'
    store.main.reimCompanyId = 'company-1'
    store.main.businessTypeId = 'business-1'
    store.main.businessTripReason = '出差'
    store.allocations = [
      {
        id: null,
        reimCompanyId: 'company-1',
        reimCompanyNo: 'COM001',
        reimCompanyName: '示例公司',
        projectId: null,
        projectNo: null,
        projectName: null,
        allocationRatio: 1,
        allocationAmount: 0,
        isFirstRow: '1',
        sortNo: 1,
      },
    ]
    store.itineraries = [
      {
        id: null,
        clientItineraryId: 'itinerary-1',
        travelerId: 'employee-1',
        travelerNo: '74541',
        travelerName: '徐年年',
        departureDate: '2026-05-20',
        arrivalDate: '2026-05-21',
        itineraryDays: 2,
        departureCity: '武汉',
        departureCityNo: '027',
        departureCityType: '1',
        arrivingCity: '北京',
        arrivingCityNo: '010',
        arrivingCityType: '1',
        itineraryRoute: '武汉-北京',
        itineraryInstructions: '出差',
        sortNo: 1,
      },
    ]
    const deferred = new Promise((resolve) => {
      setTimeout(() => resolve(true), 1)
    })
    apiMock.submitReimBill.mockReturnValue(deferred)
    const wrapper = mount(FooterActions, {
      global: {
        plugins: [ElementPlus],
      },
    })

    const buttons = wrapper.findAll('button')
    await buttons[2]?.trigger('click')

    expect(wrapper.get('.footer-actions').attributes('data-state')).toBe('busy')
    expect(apiMock.submitReimBill).toHaveBeenCalledTimes(1)

    await buttons[2]?.trigger('click')
    expect(apiMock.submitReimBill).toHaveBeenCalledTimes(1)

    await settleActions()
    await flushPromises()
    expect(routerMock.push).toHaveBeenCalledWith('/reim-bills')
  })
})
