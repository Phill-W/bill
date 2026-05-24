import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import SectionPanel from '@/components/SectionPanel.vue'

describe('SectionPanel', () => {
  it('renders content expanded by default and only toggles it from the arrow button', async () => {
    const wrapper = mount(SectionPanel, {
      props: {
        title: '基础信息',
      },
      slots: {
        default: '<div class="panel-content">报销标题字段</div>',
      },
    })

    expect(wrapper.find('.panel-content').exists()).toBe(true)
    expect(wrapper.get('.section-panel__body').attributes('style') || '').toBe('')

    await wrapper.get('.section-panel__header').trigger('click')
    expect(wrapper.get('.section-panel__body').attributes('style') || '').toBe('')

    await wrapper.get('.section-panel__title').trigger('click')
    expect(wrapper.get('.section-panel__body').attributes('style') || '').toBe('')

    await wrapper.get('.section-panel__toggle').trigger('click')
    expect(wrapper.get('.section-panel__body').attributes('style')).toContain('display: none;')

    await wrapper.get('.section-panel__toggle').trigger('click')
    expect(wrapper.get('.section-panel__body').attributes('style') || '').toBe('')
    expect(wrapper.find('[data-state="expanded-body"]').exists()).toBe(true)
  })

  it('renders header-extra content inside the title lead area', () => {
    const wrapper = mount(SectionPanel, {
      props: {
        title: '补助信息',
        subtitle: '120.00（共2人:6天）',
      },
      slots: {
        'header-extra': '<span class="header-extra-slot">⚠️ 测试提示</span>',
        default: '<div class="panel-content">补助表格</div>',
      },
    })

    expect(wrapper.get('.section-panel__header-extra').text()).toContain('⚠️ 测试提示')
    expect(wrapper.get('.section-panel__lead').text()).toContain('补助信息')
  })
})
