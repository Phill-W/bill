<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

import { submitReimBill, updateReimBill } from '@/api/reimBillApi'
import { useReimBillStore } from '@/stores/reimBillStore'
import { validateSubmit } from '@/utils/validate'

const store = useReimBillStore()
const route = useRoute()
const router = useRouter()

const isCreate = computed(() => route.path.includes('/create'))
const billId = computed(() => String(route.params.id || ''))

async function handleClose() {
  await ElMessageBox.confirm('当前内容未提交，关闭后将丢失，是否确认关闭？', '提示', {
    type: 'warning',
  })
  router.push('/reim-bills')
}

async function handleSubmit() {
  const payload = store.buildSubmitPayload()
  const errors = validateSubmit(payload)
  if (errors.length) {
    ElMessage.error(errors[0])
    return
  }

  if (isCreate.value) {
    await submitReimBill(payload)
  } else {
    await updateReimBill(billId.value, payload)
  }
  ElMessage.success('提交成功')
  router.push('/reim-bills')
}
</script>

<template>
  <footer class="footer-actions">
    <el-button @click="handleClose">关闭</el-button>
    <el-button v-if="!store.isReadonly" type="primary" @click="handleSubmit">提交</el-button>
  </footer>
</template>

<style scoped>
.footer-actions {
  position: sticky;
  bottom: 0;
  z-index: 10;
  display: flex;
  justify-content: center;
  gap: 12px;
  height: 56px;
  padding-top: 10px;
  background: #fff;
  border-top: 1px solid #dcdfe6;
}
</style>
