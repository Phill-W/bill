<script setup lang="ts">
import { Delete, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import refreshCcwAltIcon from '@/assets/icons/refresh-ccw-alt-1-svgrepo-com.svg'
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

function isLockedFirstAllocationRow(row: ReimAllocationDTO, index: number) {
  return row.isFirstRow === '1' || index === 0
}

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
    <div class="allocation-panel">
      <el-table :data="store.allocations" border size="small" class="bill-inline-table allocation-table">
        <el-table-column label="序号" width="54" align="center">
          <template #default="{ $index }">{{ $index + 1 }}</template>
        </el-table-column>
        <el-table-column min-width="190">
          <template #header>
            <span class="allocation-required-header">费用归属<span class="allocation-required-mark">*</span></span>
          </template>
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
        <el-table-column width="150" align="right">
          <template #header>
            <span class="allocation-required-header allocation-required-header--right">
              <span>分摊比例</span>
              <el-tooltip
                v-if="!store.isReadonly"
                content="均摊"
                placement="top"
                effect="light"
                popper-class="allocation-split-tooltip"
              >
                <button type="button" class="allocation-split-trigger" @click.stop="splitEvenly">
                  <img class="allocation-split-trigger__icon" :src="refreshCcwAltIcon" alt="均摊" />
                </button>
              </el-tooltip>
              <span class="allocation-required-mark">*</span>
            </span>
          </template>
          <template #default="{ row, $index }">
            <span v-if="store.isReadonly || isLockedFirstAllocationRow(row, $index)" class="allocation-static-field">
              {{ formatPercent(row.allocationRatio).toFixed(2) }}%
            </span>
            <div v-else class="allocation-ratio-input-wrap">
              <el-input-number
                class="allocation-ratio-input"
                :model-value="formatPercent(row.allocationRatio)"
                :min="0"
                :max="100"
                :precision="2"
                :controls="false"
                @change="onRatioChange(row, Number($event || 0))"
              />
              <span class="allocation-ratio-input__suffix" aria-hidden="true">%</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column width="140" align="right">
          <template #header>
            <span class="allocation-required-header allocation-required-header--right">分摊金额<span class="allocation-required-mark">*</span></span>
          </template>
          <template #default="{ row, $index }">
            <span
              :class="[
                'allocation-static-field',
                { 'allocation-static-field--editable-surface': !store.isReadonly && !isLockedFirstAllocationRow(row, $index) },
              ]"
            >
              {{ formatMoney(row.allocationAmount) }}
            </span>
          </template>
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
.allocation-required-header {
  display: inline-flex;
  align-items: center;
}

.allocation-required-header--right {
  width: 100%;
  justify-content: flex-end;
  text-align: right;
}

.allocation-required-mark {
  margin-left: 2px;
  color: var(--el-color-danger);
  font-weight: 600;
}

.allocation-split-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-left: 5px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.allocation-split-trigger:hover {
  opacity: 0.85;
}

.allocation-split-trigger__icon {
  width: 16px;
  height: 16px;
  display: block;
  filter: invert(50%) sepia(88%) saturate(2863%) hue-rotate(202deg) brightness(100%) contrast(94%);
}

.allocation-panel {
  display: grid;
  gap: 0;
}

.allocation-ratio-input {
  width: 100%;
}

.allocation-ratio-input-wrap {
  position: relative;
  width: 100%;
}

.allocation-ratio-input__suffix {
  position: absolute;
  top: 50%;
  right: 11px;
  transform: translateY(-50%);
  color: #98a2b3;
  pointer-events: none;
}

.allocation-static-field {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  min-height: 32px;
  padding: 0 11px;
  border: 1px solid var(--bill-field-border);
  border-radius: 4px;
  background: var(--bill-field-bg);
  color: var(--bill-field-text);
  box-sizing: border-box;
  font-variant-numeric: tabular-nums;
}

.allocation-static-field--editable-surface {
  background: #fff;
}

.allocation-table :deep(.el-input-number) {
  width: 100%;
}

.allocation-table :deep(.el-input-number .el-input__wrapper) {
  min-height: 32px;
  padding: 0 28px 0 11px;
  background: #fff;
  justify-content: flex-end;
}

.allocation-table :deep(.el-input-number .el-input__inner) {
  text-align: right;
  color: var(--bill-field-text);
  font-variant-numeric: tabular-nums;
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
