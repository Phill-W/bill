<script setup lang="ts">
import { useReimBillStore } from '@/stores/reimBillStore'

const store = useReimBillStore()
</script>

<template>
  <header class="bill-header">
    <div class="bill-meta">
      <span>报销单号：{{ store.main.reimNo || '保存后生成' }}</span>
      <span v-if="store.main.statusName">状态：{{ store.main.statusName }}</span>
    </div>
    <h1>差旅费用报销单</h1>
    <div class="bill-date">提单日期：{{ store.main.submitDate }}</div>
  </header>
</template>

<style scoped>
.bill-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  height: 56px;
  padding: 0 18px;
  background: #fff;
  border-bottom: 1px solid #dcdfe6;
}

h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.bill-meta,
.bill-date {
  display: flex;
  gap: 16px;
  color: #606266;
}

.bill-date {
  justify-content: flex-end;
}
</style>
