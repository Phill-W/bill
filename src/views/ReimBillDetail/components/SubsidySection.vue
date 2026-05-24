<script setup lang="ts">
import { computed, ref } from 'vue'
import { EditPen } from '@element-plus/icons-vue'

import SectionPanel from '@/components/SectionPanel.vue'
import { useReimBillStore } from '@/stores/reimBillStore'
import type { ReimSubsidyDTO } from '@/types/reimBill'
import { formatMoney } from '@/utils/money'

import SubsidyCalendarDialog from './SubsidyCalendarDialog.vue'

const store = useReimBillStore()
const dialogVisible = ref(false)
const currentSubsidy = ref<ReimSubsidyDTO | null>(null)

const subsidyTipText =
  '1、请根据实际出差日期选择补助 2、出差期间当日有用餐安排的请自行核减当日餐补 3、出差期间当日有用车的，请自行核减当日交补'

const hasSubsidies = computed(() => store.subsidies.length > 0)
const totalSubsidyDays = computed(() =>
  store.subsidies.reduce((sum, item) => sum + Number(item.subsidyDays || 0), 0),
)
const travelerSummary = computed(() => {
  const travelerKeys = new Set<string>()
  const travelerNames: string[] = []

  store.subsidies.forEach((item) => {
    const key = item.travelerId || item.travelerNo || item.travelerName
    if (!key || travelerKeys.has(key)) return
    travelerKeys.add(key)
    travelerNames.push(item.travelerName || item.travelerNo || '出行人')
  })

  return {
    count: travelerNames.length,
    firstName: travelerNames[0] || '',
  }
})

const summaryText = computed(() => {
  const amountText = formatMoney(store.main.subsidyTotal)
  const daysText = `${totalSubsidyDays.value}天`

  if (travelerSummary.value.count === 0) {
    return `${amountText}（0人:${daysText}）`
  }

  if (travelerSummary.value.count === 1) {
    return `${amountText}（${travelerSummary.value.firstName}:${daysText}）`
  }

  return `${amountText}（共${travelerSummary.value.count}人:${daysText}）`
})

function openCalendar(row: ReimSubsidyDTO) {
  currentSubsidy.value = row
  dialogVisible.value = true
}
</script>

<template>
  <SectionPanel title="补助信息" :subtitle="summaryText">
    <template v-if="hasSubsidies" #header-extra>
      <span class="subsidy-header-tip" :title="subsidyTipText">
        <span class="subsidy-header-tip__symbol" aria-hidden="true">⚠️</span>
        <span class="subsidy-header-tip__text">{{ subsidyTipText }}</span>
      </span>
    </template>

    <div v-if="!hasSubsidies" class="subsidy-tip subsidy-tip--inline">
      <span class="subsidy-tip__symbol" aria-hidden="true">⚠️</span>
      <span>{{ subsidyTipText }}</span>
    </div>
    <el-table v-else :data="store.subsidies" border size="small" class="bill-inline-table subsidy-table">
      <el-table-column label="序号" width="54" align="center">
        <template #default="{ $index }">{{ $index + 1 }}</template>
      </el-table-column>
      <el-table-column label="出行人" min-width="140">
        <template #default="{ row }">{{ row.travelerName }}({{ row.travelerNo }})</template>
      </el-table-column>
      <el-table-column label="出差日期" min-width="190">
        <template #default="{ row }">{{ row.departureDate }} 至 {{ row.arrivalDate }}</template>
      </el-table-column>
      <el-table-column prop="subsidyDays" label="补助天数" width="90" align="right" />
      <el-table-column prop="itineraryRoute" label="行程" min-width="130" />
      <el-table-column prop="subsidyCity" label="补贴城市" min-width="110" />
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
.subsidy-header-tip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  max-width: 100%;
  color: rgb(255, 149, 52);
  font-size: 13px;
  line-height: 1.4;
}

.subsidy-header-tip__symbol {
  flex: none;
  font-size: 13px;
  line-height: 1;
}

.subsidy-header-tip__text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.subsidy-tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 6px;
  background: var(--bill-warning-bg);
  color: var(--bill-warning-text);
  line-height: 1.6;
}

.subsidy-tip--inline {
  margin-bottom: 0;
}

.subsidy-tip__symbol {
  flex: none;
  font-size: 14px;
  line-height: 1.2;
}

.subsidy-table {
  width: 100%;
}

.subsidy-table :deep(.el-table__inner-wrapper),
.subsidy-table :deep(.el-table__body),
.subsidy-table :deep(.el-table__header) {
  width: 100% !important;
}
</style>
