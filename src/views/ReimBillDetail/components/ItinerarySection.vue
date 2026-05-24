<script setup lang="ts">
import { computed, ref } from 'vue'
import { CopyDocument, Delete, EditPen, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute } from 'vue-router'

import { createReimItinerary, deleteReimItinerary, updateReimItinerary } from '@/api/reimBillApi'
import SectionPanel from '@/components/SectionPanel.vue'
import { useReimBillStore } from '@/stores/reimBillStore'
import type { ReimItineraryDTO } from '@/types/reimBill'

import ItineraryDialog from './ItineraryDialog.vue'

const store = useReimBillStore()
const route = useRoute()
const dialogVisible = ref(false)
const editing = ref<ReimItineraryDTO | null>(null)
const copyMode = ref(false)
const saving = ref(false)
const deletingId = ref('')

const isCreate = computed(() => route.path.includes('/create'))
const billId = computed(() => String(route.params.id || ''))

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
  if (isCreate.value) {
    store.deleteItinerary(row.clientItineraryId)
    return
  }

  if (!row.id) {
    ElMessage.error('行程ID不存在，请刷新后重试')
    return
  }

  deletingId.value = row.id
  try {
    await deleteReimItinerary(billId.value, row.id)
    await store.loadDetail(billId.value)
    ElMessage.success('删除成功')
  } finally {
    deletingId.value = ''
  }
}

async function handleSave(itinerary: ReimItineraryDTO) {
  if (isCreate.value) {
    store.addOrUpdateItinerary(itinerary)
    dialogVisible.value = false
    return
  }

  saving.value = true
  try {
    if (editing.value && !copyMode.value) {
      if (!editing.value.id) {
        ElMessage.error('行程ID不存在，请刷新后重试')
        return
      }
      await updateReimItinerary(billId.value, editing.value.id, itinerary)
    } else {
      await createReimItinerary(billId.value, itinerary)
    }
    await store.loadDetail(billId.value)
    dialogVisible.value = false
    ElMessage.success('保存成功')
  } finally {
    saving.value = false
  }
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
              <el-button
                :icon="Delete"
                :loading="deletingId === row.id"
                link
                type="primary"
                @click="handleDelete(row)"
              />
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <ItineraryDialog
      v-model:visible="dialogVisible"
      :editing="editing"
      :copy-mode="copyMode"
      :saving="saving"
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
