import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('renders routed page content', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: {
            template: '<main>报销单列表</main>',
          },
        },
      },
    })
    expect(wrapper.text()).toContain('报销单列表')
  })
})
