import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import ReimBillDetail from '@/views/ReimBillDetail/index.vue'

vi.mock('vue-router', () => ({
  useRoute: () => ({
    path: '/reim-bills/create',
    params: {},
  }),
}))

vi.mock('element-plus', async () => {
  const actual = await vi.importActual<typeof import('element-plus')>('element-plus')
  return {
    ...actual,
    ElMessage: {
      error: vi.fn(),
      success: vi.fn(),
      warning: vi.fn(),
    },
  }
})

vi.mock('@/stores/reimBillStore', () => ({
  useReimBillStore: () => ({
    initCreate: vi.fn(),
    loadDetail: vi.fn(),
    main: {
      reimNo: '',
      statusName: '',
      submitDate: '2026-04-23',
    },
  }),
}))

vi.mock('@/views/ReimBillDetail/components/BillHeader.vue', () => ({
  default: { template: '<div class="mock-bill-header" />' },
}))

vi.mock('@/views/ReimBillDetail/components/BasicInfoSection.vue', () => ({
  default: { template: '<section class="mock-basic-section" />' },
}))

vi.mock('@/views/ReimBillDetail/components/ItinerarySection.vue', () => ({
  default: { template: '<section class="mock-itinerary-section" />' },
}))

vi.mock('@/views/ReimBillDetail/components/SubsidySection.vue', () => ({
  default: { template: '<section class="mock-subsidy-section" />' },
}))

vi.mock('@/views/ReimBillDetail/components/ExpenseTotalSection.vue', () => ({
  default: { template: '<section class="mock-expense-section" />' },
}))

vi.mock('@/views/ReimBillDetail/components/AllocationSection.vue', () => ({
  default: { template: '<section class="mock-allocation-section" />' },
}))

vi.mock('@/views/ReimBillDetail/components/RemarkSection.vue', () => ({
  default: { template: '<section class="mock-remark-section" />' },
}))

vi.mock('@/views/ReimBillDetail/components/FooterActions.vue', () => ({
  default: { template: '<div class="mock-footer-actions" />' },
}))

describe('ReimBillDetail layout', () => {
  it('renders the detail sections inside the central content container', () => {
    const wrapper = mount(ReimBillDetail)

    expect(wrapper.find('.reim-detail-page').exists()).toBe(true)
    expect(wrapper.find('.detail-content').exists()).toBe(true)
    expect(wrapper.find('.detail-content .mock-basic-section').exists()).toBe(true)
    expect(wrapper.find('.detail-content .mock-subsidy-section').exists()).toBe(true)
  })
})
