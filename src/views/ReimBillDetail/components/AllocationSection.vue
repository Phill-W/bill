<script setup lang="ts">
import { Delete, Plus, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

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
  const item = reimCompanyOptions.find((option) => option.reimCompanyId === id)
  if (!item) return
  row.reimCompanyId = item.reimCompanyId
  row.reimCompanyNo = item.reimCompanyNo
  row.reimCompanyName = item.reimCompanyName
}

function onProjectChange(row: ReimAllocationDTO, id: string | null) {
  const item = projectOptions.find((option) => option.projectId === id)
  row.projectId = item?.projectId || null
  row.projectNo = item?.projectNo || null
  row.projectName = item?.projectName || null
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
  <section class="section-block">
    <div class="section-title">
      <span>费用归属及分摊</span>
      <span class="muted-text">分摊金额：{{ formatMoney(store.main.allocationTotal) }}</span>
    </div>
    <div class="section-body">
      <div v-if="!store.isReadonly" class="toolbar-line">
        <span />
        <div>
          <el-button :icon="Refresh" size="small" @click="splitEvenly">均摊</el-button>
          <el-button :icon="Plus" type="primary" size="small" @click="addAllocation">添加一行</el-button>
        </div>
      </div>
      <el-table :data="store.allocations" border size="small">
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
                v-for="item in reimCompanyOptions"
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
                v-for="item in projectOptions"
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
        <el-table-column v-if="!store.isReadonly" label="操作" width="90" align="center">
          <template #default="{ $index }">
            <el-button :icon="Delete" link type="danger" @click="deleteAllocation($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </section>
</template>
