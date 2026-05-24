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
    expect(wrapper.get('[data-state="expanded-body"]').exists()).toBe(true)
  })
})
