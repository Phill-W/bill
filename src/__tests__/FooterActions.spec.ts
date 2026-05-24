import { beforeEach, describe, expect, it, vi } from 'vitest'
import ElementPlus, { ElMessageBox } from 'element-plus'
import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'

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
    setActivePinia(createPinia())
    routeMock.path = '/reim-bills/create'
    routeMock.params = {}
    vi.clearAllMocks()
    routerMock.push.mockResolvedValue(undefined)
    routerMock.replace.mockResolvedValue(undefined)
  })

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

    await (wrapper.vm as unknown as { handleSaveDraft: () => Promise<void> }).handleSaveDraft()

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
    store.main.reimbursementTitle = '待丢弃草稿'
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
})
