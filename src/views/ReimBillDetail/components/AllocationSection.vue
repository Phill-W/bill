<script setup lang="ts">
import { Delete, Plus, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import SectionPanel from '@/components/SectionPanel.vue'
import { projectOptions, reimCompanyOptions } from '@/constants/staticData'
import { useReimBillStore } from '@/stores/reimBillStore'
import type { ReimAllocationDTO } from '@/types/reimBill'
import {
  recalcAllocationAmount,
  recalcFirstAllocation,
  splitAllocationsEvenly,
} from '@/utils/allocation'
import { formatMoney, formatPercent, toRatio } from '@/utils/money'

const store = useReimBillStore()

function addAllocation() {
  store.allocations.push({
    reimCompanyId: '',
    reimCompanyNo: '',
    reimCompanyName: '',
    projectId: null,
    projectNo: null,
    projectName: null,
    allocationRatio: 0,
    allocationAmount: 0,
    isFirstRow: '0',
    sortNo: store.allocations.length + 1,
  })
  store.recalcAllocationByTotal()
}

async function deleteAllocation(index: number) {
  if (store.allocations.length === 1) {
    ElMessage.warning('至少保留一条分摊信息')
    return
  }
  await ElMessageBox.confirm('确认删除该分摊信息吗？', '提示', { type: 'warning' })
  store.allocations.splice(index, 1)
  store.recalcAllocationByTotal()
}

function onCompanyChange(row: ReimAllocationDTO, id: string) {
  const item = getCompanyOptions(row).find((option) => option.reimCompanyId === id)
  if (!item) return
  row.reimCompanyId = item.reimCompanyId
  row.reimCompanyNo = item.reimCompanyNo
  row.reimCompanyName = item.reimCompanyName
}

function onProjectChange(row: ReimAllocationDTO, id: string | null) {
  const item = getProjectOptions(row).find((option) => option.projectId === id)
  row.projectId = item?.projectId || null
  row.projectNo = item?.projectNo || null
  row.projectName = item?.projectName || null
}

function getCompanyOptions(row: ReimAllocationDTO) {
  if (!row.reimCompanyId || reimCompanyOptions.some((option) => option.reimCompanyId === row.reimCompanyId)) {
    return reimCompanyOptions
  }
  return [
    ...reimCompanyOptions,
    {
      reimCompanyId: row.reimCompanyId,
      reimCompanyNo: row.reimCompanyNo,
      reimCompanyName: row.reimCompanyName || row.reimCompanyId,
    },
  ]
}

function getProjectOptions(row: ReimAllocationDTO) {
  if (!row.projectId || projectOptions.some((option) => option.projectId === row.projectId)) {
    return projectOptions
  }
  return [
    ...projectOptions,
    {
      projectId: row.projectId,
      projectNo: row.projectNo || '',
      projectName: row.projectName || row.projectId,
    },
  ]
}

function onRatioChange(row: ReimAllocationDTO, percentValue: number | undefined) {
  row.allocationRatio = toRatio(Number(percentValue || 0) / 100)
  const otherTotal = store.allocations.slice(1).reduce((sum, item) => sum + item.allocationRatio, 0)
  if (otherTotal > 1) {
    row.allocationRatio = 0
    row.allocationAmount = 0
    ElMessage.warning('分摊比例合计不能超过100%')
    return
  }
  recalcAllocationAmount(row, store.main.subsidyTotal)
  recalcFirstAllocation(store.allocations, store.main.subsidyTotal)
}

function splitEvenly() {
  splitAllocationsEvenly(store.allocations, store.main.subsidyTotal)
}
</script>

<template>
  <SectionPanel title="费用归属及分摊" :subtitle="`（分摊金额：${formatMoney(store.main.allocationTotal)}）`">
    <template #header-actions>
      <el-button
        v-if="!store.isReadonly"
        :icon="Refresh"
        type="primary"
        size="small"
        class="split-button"
        @click.stop="splitEvenly"
      >
        均摊
      </el-button>
    </template>
    <div class="allocation-panel">
      <el-table :data="store.allocations" border size="small" class="bill-inline-table allocation-table">
        <el-table-column label="序号" width="54" align="center">
          <template #default="{ $index }">{{ $index + 1 }}</template>
        </el-table-column>
        <el-table-column label="费用归属" min-width="190">
          <template #default="{ row }">
            <el-select
              v-model="row.reimCompanyId"
              :disabled="store.isReadonly"
              filterable
              placeholder="请选择"
              @change="(id: string) => onCompanyChange(row, id)"
            >
              <el-option
                v-for="item in getCompanyOptions(row)"
                :key="item.reimCompanyId"
                :label="item.reimCompanyName"
                :value="item.reimCompanyId"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="项目" min-width="190">
          <template #default="{ row }">
            <el-select
              v-model="row.projectId"
              :disabled="store.isReadonly"
              clearable
              filterable
              placeholder="请选择"
              @change="(id: string | null) => onProjectChange(row, id)"
            >
              <el-option
                v-for="item in getProjectOptions(row)"
                :key="item.projectId"
                :label="item.projectName"
                :value="item.projectId"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="分摊比例" width="150" align="right">
          <template #default="{ row, $index }">
            <span v-if="$index === 0 || store.isReadonly">{{ formatPercent(row.allocationRatio).toFixed(2) }}%</span>
            <el-input-number
              v-else
              :model-value="formatPercent(row.allocationRatio)"
              :min="0"
              :max="100"
              :precision="2"
              controls-position="right"
              @change="onRatioChange(row, Number($event || 0))"
            />
          </template>
        </el-table-column>
        <el-table-column label="分摊金额" width="140" align="right">
          <template #default="{ row }">{{ formatMoney(row.allocationAmount) }}</template>
        </el-table-column>
        <el-table-column v-if="!store.isReadonly" label="操作" width="72" align="center">
          <template #default="{ $index }">
            <el-button :icon="Delete" link type="primary" @click="deleteAllocation($index)" />
          </template>
        </el-table-column>
      </el-table>
      <button v-if="!store.isReadonly" type="button" class="allocation-add-row" @click="addAllocation">
        <el-icon><Plus /></el-icon>
        <span>添加一行</span>
      </button>
      <div class="allocation-summary">
        <span>合计</span>
        <span class="allocation-summary__ratio">100.00%</span>
        <span class="allocation-summary__amount">CNY {{ formatMoney(store.main.allocationTotal) }}</span>
      </div>
    </div>
  </SectionPanel>
</template>

<style scoped>
.split-button {
  min-width: 60px;
}

.allocation-panel {
  display: grid;
  gap: 0;
}

.allocation-add-row {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 40px;
  border: 0;
  border-left: 1px solid var(--bill-table-border);
  border-right: 1px solid var(--bill-table-border);
  border-bottom: 1px solid var(--bill-table-border);
  background: #fff;
  color: var(--bill-link);
  cursor: pointer;
}

.allocation-summary {
  display: grid;
  grid-template-columns: 1fr 150px 140px;
  align-items: center;
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid var(--bill-table-border);
  border-top: 0;
  background: #fff8eb;
}

.allocation-summary__ratio,
.allocation-summary__amount {
  justify-self: end;
  color: var(--bill-accent);
  font-variant-numeric: tabular-nums;
}
</style>
