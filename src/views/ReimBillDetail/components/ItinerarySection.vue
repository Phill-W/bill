<script setup lang="ts">
import { ref } from 'vue'
import { CopyDocument, Delete, EditPen, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import SectionPanel from '@/components/SectionPanel.vue'
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
  ElMessage.success('删除成功')
}

function handleSave(itinerary: ReimItineraryDTO) {
  store.addOrUpdateItinerary(itinerary)
  dialogVisible.value = false
  ElMessage.success('保存成功')
}
</script>

<template>
  <SectionPanel title="补录行程">
    <template #header-actions>
      <el-button
        v-if="!store.isReadonly"
        :icon="Plus"
        link
        type="primary"
        class="panel-action-link"
        @click.stop="openCreate"
      >
        补录行程
      </el-button>
    </template>
    <div class="itinerary-panel">
      <el-table :data="store.itineraries" border size="small" class="bill-inline-table">
        <el-table-column type="index" label="序号" width="54" align="center" />
        <el-table-column label="出行人" width="140">
          <template #default="{ row }">{{ row.travelerName }}({{ row.travelerNo }})</template>
        </el-table-column>
        <el-table-column label="出差日期" width="190">
          <template #default="{ row }">{{ row.departureDate }} 至 {{ row.arrivalDate }}</template>
        </el-table-column>
        <el-table-column prop="itineraryRoute" label="行程" width="140" />
        <el-table-column prop="itineraryInstructions" label="行程说明" show-overflow-tooltip />
        <el-table-column v-if="!store.isReadonly" label="操作" width="126" align="center">
          <template #default="{ row }">
            <div class="row-actions">
              <el-button :icon="EditPen" link type="primary" @click="openEdit(row)" />
              <el-button :icon="CopyDocument" link type="primary" @click="openCopy(row)" />
              <el-button :icon="Delete" link type="primary" @click="handleDelete(row)" />
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <ItineraryDialog
      v-model:visible="dialogVisible"
      :editing="editing"
      :copy-mode="copyMode"
      :saving="false"
      :existing-itineraries="store.itineraries"
      @save="handleSave"
    />
  </SectionPanel>
</template>

<style scoped>
.panel-action-link {
  font-weight: 500;
}

.itinerary-panel {
  padding-top: 2px;
}

.row-actions {
  display: inline-flex;
  gap: 2px;
}
</style>
