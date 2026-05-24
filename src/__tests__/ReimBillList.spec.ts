import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import ElementPlus from 'element-plus'
import { flushPromises, mount } from '@vue/test-utils'

import type { PageResult, ReimBillListItem, ReimBillQuery } from '@/types/reimBill'
import ReimBillList from '@/views/ReimBillList/index.vue'

const routerMock = vi.hoisted(() => ({
  push: vi.fn(),
}))

const apiMock = vi.hoisted(() => ({
  copyReimBill: vi.fn(),
  deleteReimBill: vi.fn(),
  queryReimBillList: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRouter: () => routerMock,
}))

vi.mock('@/api/reimBillApi', () => ({
  copyReimBill: apiMock.copyReimBill,
  deleteReimBill: apiMock.deleteReimBill,
  queryReimBillList: apiMock.queryReimBillList,
}))

const SearchFormStub = defineComponent({
  name: 'SearchForm',
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
  },
  emits: ['search', 'clear', 'create'],
  template: `
    <div class="search-form-stub">
      <button class="search-trigger" type="button" @click="$emit('search')">search</button>
      <button class="clear-trigger" type="button" @click="$emit('clear')">clear</button>
    </div>
  `,
})

const ReimBillTableStub = defineComponent({
  name: 'ReimBillTable',
  props: {
    data: {
      type: Array,
      required: true,
    },
    loading: {
      type: Boolean,
      required: true,
    },
    emptyDescription: {
      type: String,
      default: '',
    },
  },
  template: `
    <div class="table-stub">
      <div class="loading-state">{{ loading ? 'loading' : 'idle' }}</div>
      <div class="empty-state">{{ emptyDescription }}</div>
      <ul>
        <li v-for="row in data" :key="row.id">
          {{ row.reimNo }}
        </li>
      </ul>
    </div>
  `,
})

const PaginationStub = defineComponent({
  name: 'ElPagination',
  props: {
    currentPage: {
      type: Number,
      required: true,
    },
    pageSize: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    pagerCount: {
      type: Number,
      default: 7,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['change', 'update:current-page', 'update:page-size'],
  template: `
    <div class="el-pagination pagination-stub" :data-pager-count="pagerCount">
      <button class="btn-prev" :disabled="disabled">prev</button>
      <button
        class="set-page-2"
        type="button"
        @click="$emit('update:current-page', 2); $emit('change', 2, pageSize)"
      >
        page2
      </button>
      <button
        class="set-page-3"
        type="button"
        @click="$emit('update:current-page', 3); $emit('change', 3, pageSize)"
      >
        page3
      </button>
      <button
        class="set-page-4"
        type="button"
        @click="$emit('update:current-page', 4); $emit('change', 4, pageSize)"
      >
        page4
      </button>
      <button
        class="set-size-20"
        type="button"
        @click="$emit('update:page-size', 20); $emit('change', currentPage, 20)"
      >
        size20
      </button>
      <ul class="el-pager">
        <li class="number is-active">{{ currentPage }}</li>
      </ul>
      <button class="btn-next" :disabled="disabled">next</button>
    </div>
  `,
})

function createRow(id: string, overrides: Partial<ReimBillListItem> = {}): ReimBillListItem {
  return {
    id,
    reimNo: `RCBX202605${id.padStart(4, '0')}`,
    statusCode: '0',
    statusName: '草稿',
    reimTypeCode: 'TRAVEL_REIMBURSEMENT',
    reimTypeName: '差旅费用报销单',
    reimburserId: 'employee-1',
    reimburserNo: '74541',
    reimburserName: '徐年年',
    reimDepartmentId: 'department-1',
    reimDepartmentNo: '072001',
    reimDepartmentName: '客户成功事业部',
    reimCompanyId: 'company-1',
    reimCompanyNo: '0407',
    reimCompanyName: '胜意科技北京分公司',
    businessTypeId: 'business-1',
    businessTypeNo: '10010010101',
    businessTypeName: '日常办公',
    reimbursementTitle: `测试单据-${id}`,
    businessTripReason: '客户项目现场支持',
    subsidyTotal: 0,
    creationTime: '2026-05-22',
    ...overrides,
  }
}

function createPageResult(
  records: ReimBillListItem[],
  overrides: Partial<PageResult<ReimBillListItem>> = {},
): PageResult<ReimBillListItem> {
  return {
    pageNo: 1,
    pageSize: 10,
    total: records.length,
    records,
    ...overrides,
  }
}

function createDeferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve, reject }
}

function mountPage(options?: { stubPagination?: boolean }) {
  return mount(ReimBillList, {
    global: {
      plugins: [ElementPlus],
      stubs: {
        SearchForm: SearchFormStub,
        ReimBillTable: ReimBillTableStub,
        ...(options?.stubPagination ? { ElPagination: PaginationStub } : {}),
      },
    },
  })
}

async function settle() {
  await flushPromises()
  await nextTick()
}

function getPagination(wrapper: ReturnType<typeof mountPage>) {
  return wrapper.find('.el-pagination')
}

async function triggerPaginationAction(
  wrapper: ReturnType<typeof mountPage>,
  selector: '.set-page-2' | '.set-page-3' | '.set-page-4' | '.set-size-20',
) {
  await wrapper.get(selector).trigger('click')
  await settle()
}

function getActivePage(wrapper: ReturnType<typeof mountPage>) {
  const active = wrapper.find('.el-pager li.is-active')
  return active.exists() ? Number(active.text()) : null
}

describe('ReimBillList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    routerMock.push.mockResolvedValue(undefined)
  })

  it('loads the first page and keeps 11 pages expanded without folded markers', async () => {
    apiMock.queryReimBillList.mockResolvedValueOnce(
      createPageResult([createRow('1')], { total: 110, pageNo: 1, pageSize: 10 }),
    )

    const wrapper = mountPage()
    await settle()

    expect(apiMock.queryReimBillList).toHaveBeenCalledWith(
      expect.objectContaining({ pageNo: 1, pageSize: 10 }),
    )
    expect(wrapper.findAll('.el-pager li').length).toBeGreaterThan(0)
    expect(wrapper.text()).toContain('RCBX2026050001')
    expect(wrapper.findAll('.el-pager .more')).toHaveLength(0)
  })

  it('folds the pager once the page count exceeds 11', async () => {
    apiMock.queryReimBillList.mockResolvedValueOnce(
      createPageResult([createRow('1')], { total: 120, pageNo: 1, pageSize: 10 }),
    )

    const wrapper = mountPage()
    await settle()

    expect(wrapper.findAll('.el-pager .more').length).toBeGreaterThan(0)
  })

  it('requests data on page and page-size changes while disabling pagination during loading', async () => {
    apiMock.queryReimBillList.mockResolvedValueOnce(
      createPageResult([createRow('1')], { total: 30, pageNo: 1, pageSize: 10 }),
    )

    const wrapper = mountPage({ stubPagination: true })
    await settle()

    const pageDeferred = createDeferred<PageResult<ReimBillListItem>>()
    apiMock.queryReimBillList.mockReturnValueOnce(pageDeferred.promise)
    await wrapper.get('.set-page-2').trigger('click')
    await nextTick()

    expect(apiMock.queryReimBillList).toHaveBeenLastCalledWith(
      expect.objectContaining({ pageNo: 2, pageSize: 10 }),
    )
    expect(wrapper.find('.btn-prev').attributes('disabled')).toBeDefined()
    expect(wrapper.find('.btn-next').attributes('disabled')).toBeDefined()
    expect(wrapper.getComponent(ReimBillTableStub).props('loading')).toBe(true)

    pageDeferred.resolve(
      createPageResult([createRow('2')], { total: 30, pageNo: 2, pageSize: 10 }),
    )
    await settle()

    apiMock.queryReimBillList.mockResolvedValueOnce(
      createPageResult([createRow('20')], { total: 30, pageNo: 2, pageSize: 20 }),
    )
    await triggerPaginationAction(wrapper, '.set-size-20')

    expect(apiMock.queryReimBillList).toHaveBeenLastCalledWith(
      expect.objectContaining({ pageNo: 2, pageSize: 20 }),
    )
    expect(wrapper.find('.btn-prev').attributes('disabled')).toBeUndefined()
    expect(wrapper.text()).toContain('RCBX2026050020')
  })

  it('rolls back to the last successful pagination state when loading a new page fails', async () => {
    apiMock.queryReimBillList.mockResolvedValueOnce(
      createPageResult([createRow('1')], { total: 20, pageNo: 1, pageSize: 10 }),
    )

    const wrapper = mountPage({ stubPagination: true })
    await settle()

    apiMock.queryReimBillList.mockRejectedValueOnce(new Error('network error'))
    await triggerPaginationAction(wrapper, '.set-page-2')

    expect(
      apiMock.queryReimBillList.mock.calls.some(
        ([query]) => query.pageNo === 2 && query.pageSize === 10,
      ),
    ).toBe(true)
    expect(getActivePage(wrapper)).toBe(1)
    expect(wrapper.text()).toContain('RCBX2026050001')
  })

  it('keeps only the latest pagination response when requests resolve out of order', async () => {
    apiMock.queryReimBillList.mockResolvedValueOnce(
      createPageResult([createRow('1')], { total: 30, pageNo: 1, pageSize: 10 }),
    )

    const wrapper = mountPage({ stubPagination: true })
    await settle()

    const pageTwoDeferred = createDeferred<PageResult<ReimBillListItem>>()
    const pageThreeDeferred = createDeferred<PageResult<ReimBillListItem>>()
    apiMock.queryReimBillList
      .mockReturnValueOnce(pageTwoDeferred.promise)
      .mockReturnValueOnce(pageThreeDeferred.promise)

    await wrapper.get('.set-page-2').trigger('click')
    await nextTick()
    await wrapper.get('.set-page-3').trigger('click')
    await nextTick()

    pageThreeDeferred.resolve(
      createPageResult([createRow('3')], { total: 30, pageNo: 3, pageSize: 10 }),
    )
    await settle()

    pageTwoDeferred.resolve(
      createPageResult([createRow('2')], { total: 30, pageNo: 2, pageSize: 10 }),
    )
    await settle()

    expect(getActivePage(wrapper)).toBe(3)
    expect(wrapper.text()).toContain('RCBX2026050003')
    expect(wrapper.text()).not.toContain('RCBX2026050002')
  })

  it('shows the correct empty states and hides pagination when no records are available', async () => {
    apiMock.queryReimBillList.mockResolvedValueOnce(createPageResult([], { total: 0, pageNo: 1, pageSize: 10 }))

    const wrapper = mountPage({ stubPagination: true })
    await settle()

    expect(wrapper.text()).toContain('暂无报销单')
    expect(getPagination(wrapper).exists()).toBe(false)

    apiMock.queryReimBillList.mockResolvedValueOnce(
      createPageResult([createRow('1')], { total: 1, pageNo: 1, pageSize: 10 }),
    )
    const filteredWrapper = mountPage({ stubPagination: true })
    await settle()

    const modelValue = filteredWrapper.findComponent(SearchFormStub).props('modelValue') as ReimBillQuery
    modelValue.reimNo = 'RCBX2026050001'
    apiMock.queryReimBillList.mockResolvedValueOnce(
      createPageResult([], { total: 0, pageNo: 1, pageSize: 10 }),
    )
    await filteredWrapper.find('.search-trigger').trigger('click')
    await settle()

    expect(apiMock.queryReimBillList).toHaveBeenLastCalledWith(
      expect.objectContaining({
        pageNo: 1,
        pageSize: 10,
        reimNo: 'RCBX2026050001',
      }),
    )
    expect(filteredWrapper.text()).toContain('暂无符合条件的数据，请调整筛选条件')
    expect(getPagination(filteredWrapper).exists()).toBe(false)
  })

  it('falls back to the last valid page when the backend returns an out-of-range empty page', async () => {
    apiMock.queryReimBillList.mockResolvedValueOnce(
      createPageResult([createRow('1')], { total: 40, pageNo: 1, pageSize: 10 }),
    )

    const wrapper = mountPage({ stubPagination: true })
    await settle()

    apiMock.queryReimBillList
      .mockResolvedValueOnce(createPageResult([], { total: 25, pageNo: 4, pageSize: 10 }))
      .mockResolvedValueOnce(
        createPageResult([createRow('3')], { total: 25, pageNo: 3, pageSize: 10 }),
      )

    await triggerPaginationAction(wrapper, '.set-page-4')

    expect(
      apiMock.queryReimBillList.mock.calls.some(
        ([query]) => query.pageNo === 4 && query.pageSize === 10,
      ),
    ).toBe(true)
    expect(apiMock.queryReimBillList).toHaveBeenLastCalledWith(
      expect.objectContaining({ pageNo: 3, pageSize: 10 }),
    )
    expect(getActivePage(wrapper)).toBe(3)
    expect(wrapper.text()).toContain('RCBX2026050003')
  })
})
