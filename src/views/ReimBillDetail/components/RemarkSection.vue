<script setup lang="ts">
import { Delete } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

import SectionPanel from '@/components/SectionPanel.vue'
import { useReimBillStore } from '@/stores/reimBillStore'

const store = useReimBillStore()

async function clearRemark() {
  await ElMessageBox.confirm('确认删除备注信息吗？', '提示', { type: 'warning' })
  store.main.remarks = ''
}
</script>

<template>
  <SectionPanel title="备注信息">
    <template #header-actions>
      <el-button
        v-if="!store.isReadonly && store.main.remarks"
        :icon="Delete"
        link
        type="primary"
        class="remark-delete-btn"
        @click.stop="clearRemark"
      >
        删除备注
      </el-button>
    </template>
    <div class="remark-panel">
      <el-input
        v-model="store.main.remarks"
        :disabled="store.isReadonly"
        type="textarea"
        :rows="4"
        maxlength="1000"
        show-word-limit
        placeholder="请输入"
      />
    </div>
  </SectionPanel>
</template>

<style scoped>
.remark-delete-btn {
  font-weight: 500;
}

.remark-panel {
  padding-top: 2px;
}
</style>
