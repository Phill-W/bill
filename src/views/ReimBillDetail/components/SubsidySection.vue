<script setup lang="ts">
import { computed, ref } from 'vue'
import { EditPen, WarningFilled } from '@element-plus/icons-vue'

import SectionPanel from '@/components/SectionPanel.vue'
import { useReimBillStore } from '@/stores/reimBillStore'
import type { ReimSubsidyDTO } from '@/types/reimBill'
import { formatMoney } from '@/utils/money'

import SubsidyCalendarDialog from './SubsidyCalendarDialog.vue'

const store = useReimBillStore()
const dialogVisible = ref(false)
const currentSubsidy = ref<ReimSubsidyDTO | null>(null)

const summaryText = computed(() => {
  const first = store.subsidies[0]
  if (!first) return `${formatMoney(store.main.subsidyTotal)}（徐年年:0天）`
  return `${formatMoney(store.main.subsidyTotal)}（${first.travelerName}:${first.subsidyDays}天）`
})

function openCalendar(row: ReimSubsidyDTO) {
  currentSubsidy.value = row
  dialogVisible.value = true
}
</script>

<template>
  <SectionPanel title="补助信息" :subtitle="summaryText">
    <div class="subsidy-tip">
      <el-icon class="subsidy-tip__icon"><WarningFilled /></el-icon>
      <span>
        1、请根据实际出差日期选择补助 2、出差期间当日有用餐安排的请自行核减当日餐补
        3、出差期间当日有用车的，请自行核减当日交补
      </span>
    </div>
    <el-empty v-if="store.subsidies.length === 0" description="暂无补助信息，请先补录行程" />
    <el-table v-else :data="store.subsidies" border size="small" class="bill-inline-table">
      <el-table-column label="序号" width="54" align="center">
        <template #default="{ $index }">{{ $index + 1 }}</template>
      </el-table-column>
      <el-table-column label="出行人" width="140">
        <template #default="{ row }">{{ row.travelerName }}({{ row.travelerNo }})</template>
      </el-table-column>
      <el-table-column label="出差日期" width="190">
        <template #default="{ row }">{{ row.departureDate }} 至 {{ row.arrivalDate }}</template>
      </el-table-column>
      <el-table-column prop="subsidyDays" label="补助天数" width="90" align="right" />
      <el-table-column prop="itineraryRoute" label="行程" width="130" />
      <el-table-column prop="subsidyCity" label="补贴城市" width="110" />
      <el-table-column label="申请金额" width="110" align="right">
        <template #default="{ row }">{{ formatMoney(row.applicationAmount) }}</template>
      </el-table-column>
      <el-table-column label="补贴金额" width="110" align="right">
        <template #default="{ row }">{{ formatMoney(row.subsidyAmount) }}</template>
      </el-table-column>
      <el-table-column v-if="!store.isReadonly" label="操作" width="72" align="center">
        <template #default="{ row }">
          <el-button :icon="EditPen" link type="primary" @click="openCalendar(row)" />
        </template>
      </el-table-column>
    </el-table>
    <SubsidyCalendarDialog v-model:visible="dialogVisible" :subsidy="currentSubsidy" />
  </SectionPanel>
</template>

<style scoped>
.subsidy-tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
  padding: 12px 14px;
  border-radius: 6px;
  background: var(--bill-warning-bg);
  color: var(--bill-warning-text);
  line-height: 1.6;
}

.subsidy-tip__icon {
  margin-top: 2px;
  color: #ff9f1a;
}
</style>
