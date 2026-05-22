<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

import { useReimBillStore } from '@/stores/reimBillStore'
import type { ReimBillDetailDTO } from '@/types/reimBill'

import AllocationSection from './components/AllocationSection.vue'
import BasicInfoSection from './components/BasicInfoSection.vue'
import BillHeader from './components/BillHeader.vue'
import ExpenseTotalSection from './components/ExpenseTotalSection.vue'
import FooterActions from './components/FooterActions.vue'
import ItinerarySection from './components/ItinerarySection.vue'
import RemarkSection from './components/RemarkSection.vue'
import SubsidySection from './components/SubsidySection.vue'

const route = useRoute()
const store = useReimBillStore()

const isCreate = computed(() => route.path.includes('/create'))
const billId = computed(() => String(route.params.id || ''))

onMounted(async () => {
  if (isCreate.value) {
    const rawCopyData = sessionStorage.getItem('REIM_BILL_COPY_DATA')
    if (rawCopyData) {
      try {
        const copyData = JSON.parse(rawCopyData) as ReimBillDetailDTO
        store.initCreate(copyData)
      } catch {
        store.initCreate()
      } finally {
        sessionStorage.removeItem('REIM_BILL_COPY_DATA')
      }
    } else {
      store.initCreate()
    }
    return
  }

  try {
    await store.loadDetail(billId.value)
  } catch {
    ElMessage.error('报销单详情加载失败')
  }
})
</script>

<template>
  <main class="reim-detail-page">
    <BillHeader />
    <div class="detail-content">
      <BasicInfoSection />
      <ItinerarySection />
      <SubsidySection />
      <ExpenseTotalSection />
      <AllocationSection />
      <RemarkSection />
    </div>
    <FooterActions />
  </main>
</template>

<style scoped>
.reim-detail-page {
  min-height: 100vh;
  padding-bottom: 0;
  background: #f5f7fa;
}

.detail-content {
  width: 1200px;
  margin: 12px auto 18px;
}
</style>
