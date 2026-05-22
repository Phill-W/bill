<script setup lang="ts">
import { ref } from 'vue'
import { CopyDocument, Delete, EditPen, Plus } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

import { useReimBillStore } from '@/stores/reimBillStore'
import type { ReimItineraryDTO } from '@/types/reimBill'

import ItineraryDialog from './ItineraryDialog.vue'

const store = useReimBillStore()
const dialogVisible = ref(false)
const editing = ref<ReimItineraryDTO | null>(null)
const copyMode = ref(false)

function openCreate() {
  editing.value = null
  copyMode.value = false
  dialogVisible.value = true
}

function openEdit(row: ReimItineraryDTO) {
  editing.value = row
  copyMode.value = false
  dialogVisible.value = true
}

function openCopy(row: ReimItineraryDTO) {
  editing.value = row
  copyMode.value = true
  dialogVisible.value = true
}

async function handleDelete(row: ReimItineraryDTO) {
  await ElMessageBox.confirm('确认删除该行程吗？', '提示', { type: 'warning' })
  store.deleteItinerary(row.clientItineraryId)
}
</script>

<template>
  <section class="section-block">
    <div class="section-title">
      <span>补录行程</span>
      <el-button v-if="!store.isReadonly" :icon="Plus" type="primary" size="small" @click="openCreate">
        补录行程
      </el-button>
    </div>
    <div class="section-body">
      <el-table :data="store.itineraries" border size="small">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="出行人" width="140">
          <template #default="{ row }">{{ row.travelerName }}({{ row.travelerNo }})</template>
        </el-table-column>
        <el-table-column label="出差日期" width="190">
          <template #default="{ row }">{{ row.departureDate }} 至 {{ row.arrivalDate }}</template>
        </el-table-column>
        <el-table-column prop="itineraryRoute" label="行程" width="140" />
        <el-table-column prop="itineraryInstructions" label="行程说明" show-overflow-tooltip />
        <el-table-column v-if="!store.isReadonly" label="操作" width="160" align="center">
          <template #default="{ row }">
            <el-button :icon="EditPen" link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button :icon="CopyDocument" link type="primary" @click="openCopy(row)">复制</el-button>
            <el-button :icon="Delete" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <ItineraryDialog v-model:visible="dialogVisible" :editing="editing" :copy-mode="copyMode" />
  </section>
</template>
