<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    src: string
    alt: string
    title?: string
    disabled?: boolean
    clickable?: boolean
    rotate?: number
    action?: string
    iconName?: string
    useTooltip?: boolean
    iconSize?: number
  }>(),
  {
    title: '',
    disabled: false,
    clickable: false,
    rotate: 0,
    action: '',
    iconName: '',
    useTooltip: true,
    iconSize: 14,
  },
)

const emit = defineEmits<{
  click: []
}>()

function handleClick() {
  if (props.disabled || !props.clickable) return
  emit('click')
}
</script>

<template>
  <el-tooltip v-if="useTooltip" :content="title || alt" placement="top">
    <button
      type="button"
      class="bill-list-action-icon"
      :class="{
        'is-disabled': disabled || !clickable,
        'is-clickable': clickable && !disabled,
      }"
      :data-action="action || undefined"
      :data-icon="iconName || undefined"
      :aria-label="alt"
      :aria-disabled="disabled || !clickable"
      :title="title || alt"
      @click="handleClick"
    >
      <img
        class="bill-list-action-icon__image"
        :src="src"
        :alt="alt"
        :style="{
          width: `${iconSize}px`,
          height: `${iconSize}px`,
          transform: `rotate(${rotate}deg)`,
        }"
      />
    </button>
  </el-tooltip>
  <button
    v-else
    type="button"
    class="bill-list-action-icon"
    :class="{
      'is-disabled': disabled || !clickable,
      'is-clickable': clickable && !disabled,
    }"
    :data-action="action || undefined"
    :data-icon="iconName || undefined"
    :aria-label="alt"
    :aria-disabled="disabled || !clickable"
    :title="title || alt"
    @click="handleClick"
  >
    <img
      class="bill-list-action-icon__image"
      :src="src"
      :alt="alt"
      :style="{
        width: `${iconSize}px`,
        height: `${iconSize}px`,
        transform: `rotate(${rotate}deg)`,
      }"
    />
  </button>
</template>

<style scoped>
.bill-list-action-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: default;
}

.bill-list-action-icon.is-clickable {
  cursor: pointer;
}

.bill-list-action-icon__image {
  width: 14px;
  height: 14px;
  display: block;
  opacity: 0.72;
  transition:
    opacity 0.18s ease,
    filter 0.18s ease,
    transform 0.18s ease;
  pointer-events: none;
}

.bill-list-action-icon.is-clickable .bill-list-action-icon__image {
  opacity: 1;
  filter: invert(47%) sepia(88%) saturate(2068%) hue-rotate(210deg) brightness(101%) contrast(101%);
}

.bill-list-action-icon.is-disabled .bill-list-action-icon__image {
  opacity: 0.6;
  filter: grayscale(1) brightness(0.8) contrast(0.9);
}

.bill-list-action-icon.is-clickable:hover .bill-list-action-icon__image {
  filter: invert(40%) sepia(80%) saturate(2630%) hue-rotate(216deg) brightness(97%) contrast(97%);
}
</style>
