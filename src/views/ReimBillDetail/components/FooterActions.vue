<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

import {
  createReimBillDraft,
  submitReimBill,
  updateReimBill,
  updateReimBillDraft,
} from '@/api/reimBillApi'
import { useReimBillStore } from '@/stores/reimBillStore'
import { validateSubmit } from '@/utils/validate'

const store = useReimBillStore()
const route = useRoute()
const router = useRouter()

const isCreate = computed(() => route.path.includes('/create'))
const billId = computed(() => String(route.params.id || ''))

function validateDraftBeforeSave() {
  const title = store.main.reimbursementTitle?.trim()
  if (!title) {
    ElMessage.error('请填写报销标题后保存草稿')
    return false
  }
  if (title.length > 500) {
    ElMessage.error('报销标题不能超过500字')
    return false
  }
  return true
}

async function saveDraft(options?: { closeAfterSave?: boolean }) {
  if (!validateDraftBeforeSave()) {
    return false
  }

  const payload = store.buildSubmitPayload()
  const result = isCreate.value
    ? await createReimBillDraft(payload)
    : await updateReimBillDraft(billId.value, payload)

  if (isCreate.value) {
    await router.replace(`/reim-bills/detail/${result.id}`)
  }

  await store.loadDetail(result.id)
  ElMessage.success(options?.closeAfterSave ? '草稿已保存并关闭' : '草稿已保存')

  if (options?.closeAfterSave) {
    await router.push('/reim-bills')
  }
  return true
}

async function handleClose() {
  if (!store.hasUnsavedChanges) {
    await router.push('/reim-bills')
    return
  }

  try {
    await ElMessageBox.confirm('当前内容有未保存的修改，关闭前是否保存草稿？', '提示', {
      type: 'warning',
      confirmButtonText: '保存草稿并关闭',
      cancelButtonText: '不保存',
      distinguishCancelAndClose: true,
      closeOnClickModal: false,
      closeOnPressEscape: false,
    })
    await saveDraft({ closeAfterSave: true })
  } catch (action) {
    if (action === 'cancel') {
      store.discardUnsavedChanges()
      await router.push('/reim-bills')
    }
  }
}

async function handleSaveDraft() {
  await saveDraft()
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
  await router.push('/reim-bills')
}
</script>

<template>
  <footer class="footer-actions">
    <el-button @click="handleClose">关闭</el-button>
    <el-button v-if="!store.isReadonly" @click="handleSaveDraft">保存草稿</el-button>
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
