<script setup lang="ts">
import { Delete } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

import { useReimBillStore } from '@/stores/reimBillStore'

const store = useReimBillStore()

async function clearRemark() {
  await ElMessageBox.confirm('确认删除备注信息吗？', '提示', { type: 'warning' })
  store.main.remarks = ''
}
</script>

<template>
  <section class="section-block">
    <div class="section-title">
      <span>备注信息</span>
      <el-button
        v-if="!store.isReadonly && store.main.remarks"
        :icon="Delete"
        link
        type="danger"
        @click="clearRemark"
      >
        删除备注
      </el-button>
    </div>
    <div class="section-body">
      <el-input
        v-model="store.main.remarks"
        :disabled="store.isReadonly"
        type="textarea"
        :rows="4"
        maxlength="1000"
        show-word-limit
        placeholder="请输入备注"
      />
    </div>
  </section>
</template>
