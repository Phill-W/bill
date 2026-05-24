import { beforeEach, describe, expect, it } from 'vitest'
import ElementPlus from 'element-plus'
import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'

import { REIM_STATUS } from '@/constants/reimStatus'
import { useReimBillStore } from '@/stores/reimBillStore'
import AllocationSection from '@/views/ReimBillDetail/components/AllocationSection.vue'

const tableStubs = {
  'el-table': {
    template: '<div class="el-table-stub"><slot /></div>',
  },
  'el-table-column': {
    props: ['label'],
    template:
      '<div class="el-table-column-stub"><div class="column-header"><slot name="header">{{ label }}</slot></div><slot :row="{}" :$index="0" /></div>',
  },
}

describe('AllocationSection', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('marks required allocation headers and keeps project optional', () => {
    const store = useReimBillStore()
    store.initCreate()

    const wrapper = mount(AllocationSection, {
      global: {
        plugins: [ElementPlus],
        stubs: tableStubs,
      },
    })

    const requiredHeaders = wrapper.findAll('.allocation-required-header').map((item) => item.text())
    expect(requiredHeaders).toEqual(['费用归属*', '分摊比例*', '分摊金额*'])
    expect(wrapper.text()).toContain('项目')
    expect(requiredHeaders.some((text) => text.includes('项目'))).toBe(false)
  })

  it('shows the split button only for editable bills', () => {
    const store = useReimBillStore()
    store.initCreate()

    const editableWrapper = mount(AllocationSection, {
      global: {
        plugins: [ElementPlus],
        stubs: tableStubs,
      },
    })

    expect(editableWrapper.find('.split-button').exists()).toBe(true)

    store.main.statusCode = REIM_STATUS.COMPLETED.code
    store.main.statusName = REIM_STATUS.COMPLETED.name
    const readonlyWrapper = mount(AllocationSection, {
      global: {
        plugins: [ElementPlus],
        stubs: tableStubs,
      },
    })

    expect(readonlyWrapper.find('.split-button').exists()).toBe(false)
  })

  it('renders editable ratio inputs without changing the first-row display field', () => {
    const store = useReimBillStore()
    store.initCreate()
    store.allocations.push({
      reimCompanyId: '',
      reimCompanyNo: '',
      reimCompanyName: '',
      projectId: null,
      projectNo: null,
      projectName: null,
      allocationRatio: 0,
      allocationAmount: 0,
      isFirstRow: '0',
      sortNo: 2,
    })

    const wrapper = mount(AllocationSection, {
      global: {
        plugins: [ElementPlus],
        stubs: {
          'el-table': {
            template: '<div class="el-table-stub"><slot /></div>',
          },
          'el-table-column': {
            props: ['label'],
            template:
              '<div class="el-table-column-stub"><div class="column-header"><slot name="header">{{ label }}</slot></div><slot :row="{}" :$index="1" /></div>',
          },
        },
      },
    })

    expect(wrapper.find('.allocation-ratio-input').exists()).toBe(true)
    expect(wrapper.find('.allocation-ratio-input__suffix').text()).toBe('%')
  })

  it('treats the current first allocation row as locked after rows are reordered', () => {
    const store = useReimBillStore()
    store.initCreate()
    store.allocations = [
      {
        ...store.allocations[0]!,
        isFirstRow: '0',
        sortNo: 2,
      },
      {
        ...store.allocations[0]!,
        reimCompanyId: 'second-row',
        isFirstRow: '1',
        sortNo: 1,
      },
    ]

    const wrapper = mount(AllocationSection, {
      global: {
        plugins: [ElementPlus],
        stubs: {
          'el-table': {
            template: '<div class="el-table-stub"><slot /></div>',
          },
          'el-table-column': {
            props: ['label'],
            template:
              '<div class="el-table-column-stub"><div class="column-header"><slot name="header">{{ label }}</slot></div><slot :row="{ isFirstRow: \'1\' }" :$index="0" /></div>',
          },
        },
      },
    })

    expect(wrapper.find('.allocation-ratio-input').exists()).toBe(false)
    expect(wrapper.find('.allocation-static-field').exists()).toBe(true)
  })
})
