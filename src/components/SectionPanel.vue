<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'

const props = withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    collapsible?: boolean
    defaultExpanded?: boolean
    bodyClass?: string
  }>(),
  {
    subtitle: '',
    collapsible: true,
    defaultExpanded: true,
    bodyClass: '',
  },
)

const expanded = ref(props.defaultExpanded)

watch(
  () => props.defaultExpanded,
  (value) => {
    expanded.value = value
  },
)

const iconComponent = computed(() => (expanded.value ? ArrowUp : ArrowDown))

function toggleExpanded() {
  if (!props.collapsible) return
  expanded.value = !expanded.value
}
</script>

<template>
  <section class="section-panel" :class="{ 'is-collapsed': !expanded }">
    <header class="section-panel__header" :class="{ 'is-static': !collapsible }">
      <span class="section-panel__lead">
        <span class="section-panel__marker" />
        <span class="section-panel__title">{{ title }}</span>
        <span v-if="subtitle" class="section-panel__subtitle">{{ subtitle }}</span>
        <span v-if="$slots['header-extra']" class="section-panel__header-extra">
          <slot name="header-extra" />
        </span>
      </span>
      <span class="section-panel__actions">
        <slot name="header-actions" />
        <button
          v-if="collapsible"
          type="button"
          class="section-panel__toggle"
          :aria-expanded="expanded"
          @click="toggleExpanded"
        >
          <component :is="iconComponent" class="section-panel__icon" />
        </button>
      </span>
    </header>
    <transition name="section-panel-collapse">
      <div
        v-show="expanded"
        class="section-panel__body"
        :class="bodyClass"
        data-state="expanded-body"
      >
        <slot />
      </div>
    </transition>
  </section>
</template>
