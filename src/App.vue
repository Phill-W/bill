<template>
  <RouterView v-slot="{ Component, route }">
    <transition name="page-fade-slide" mode="out-in">
      <component :is="Component" :key="route.fullPath" />
    </transition>
  </RouterView>
</template>

<style scoped>
.page-fade-slide-enter-active,
.page-fade-slide-leave-active {
  transition:
    opacity 0.18s ease-out,
    transform 0.18s ease-out;
}

.page-fade-slide-enter-from,
.page-fade-slide-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
