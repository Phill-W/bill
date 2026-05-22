<script setup lang="ts">
import { ref } from 'vue'
import { EditPen } from '@element-plus/icons-vue'

import { useReimBillStore } from '@/stores/reimBillStore'
import type { ReimSubsidyDTO } from '@/types/reimBill'
import { formatMoney } from '@/utils/money'

import SubsidyCalendarDialog from './SubsidyCalendarDialog.vue'

const store = useReimBillStore()
const dialogVisible = ref(false)
const currentSubsidy = ref<ReimSubsidyDTO | null>(null)

function openCalendar(row: ReimSubsidyDTO) {
  currentSubsidy.value = row
  dialogVisible.value = true
}
</script>

<template>
  <section class="section-block">
    <div class="section-title">补助信息</div>
    <div class="section-body">
      <el-tooltip
        content="1、请根据实际出差日期选择补助 2、出差期间当日有用餐安排的请自行核减当日餐补 3、出差期间当日有用车的，请自行核减当日交补"
        placement="top"
      >
        <div class="subsidy-tip">
          1、请根据实际出差日期选择补助 2、出差期间当日有用餐安排的请自行核减当日餐补 3、出差期间当日有用车的，请自行核减当日交补
        </div>
      </el-tooltip>
      <el-empty v-if="store.subsidies.length === 0" description="暂无补助信息，请先补录行程" />
      <el-table v-else :data="store.subsidies" border size="small">
        <el-table-column label="出行人" width="140">
          <template #default="{ row }">{{ row.travelerName }}({{ row.travelerNo }})</template>
        </el-table-column>
        <el-table-column label="出差日期" width="190">
          <template #default="{ row }">{{ row.departureDate }} 至 {{ row.arrivalDate }}</template>
        </el-table-column>
        <el-table-column prop="subsidyDays" label="补助天数" width="90" align="right" />
        <el-table-column prop="itineraryRoute" label="行程" width="130" />
        <el-table-column prop="subsidyCity" label="补助城市" width="110" />
        <el-table-column label="申请金额" width="110" align="right">
          <template #default="{ row }">{{ formatMoney(row.applicationAmount) }}</template>
        </el-table-column>
        <el-table-column label="补助金额" width="110" align="right">
          <template #default="{ row }">{{ formatMoney(row.subsidyAmount) }}</template>
        </el-table-column>
        <el-table-column v-if="!store.isReadonly" label="操作" width="100" align="center">
          <template #default="{ row }">
            <el-button :icon="EditPen" link type="primary" @click="openCalendar(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <SubsidyCalendarDialog v-model:visible="dialogVisible" :subsidy="currentSubsidy" />
  </section>
</template>

<style scoped>
.subsidy-tip {
  width: 100%;
  margin-bottom: 10px;
  overflow: hidden;
  color: #606266;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
