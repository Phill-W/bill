<script setup lang="ts">
import { useReimBillStore } from '@/stores/reimBillStore'
import { formatMoney } from '@/utils/money'

const store = useReimBillStore()
</script>

<template>
  <section class="section-block">
    <div class="section-title">费用合计</div>
    <div class="section-body total-grid">
      <div>
        <span>补助总金额</span>
        <strong>{{ formatMoney(store.main.subsidyTotal) }}</strong>
      </div>
      <div>
        <span>餐费补助</span>
        <strong>{{ formatMoney(store.main.mealAllowance) }}</strong>
      </div>
      <div>
        <span>交通补助</span>
        <strong>{{ formatMoney(store.main.transportationAllowance) }}</strong>
      </div>
      <div>
        <span>通讯补助</span>
        <strong>{{ formatMoney(store.main.phoneAllowance) }}</strong>
      </div>
    </div>
  </section>
</template>

<style scoped>
.total-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.total-grid > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 12px;
  background: #f7f9fc;
  border: 1px solid #ebeef5;
}

strong {
  font-size: 16px;
  font-variant-numeric: tabular-nums;
}
</style>
