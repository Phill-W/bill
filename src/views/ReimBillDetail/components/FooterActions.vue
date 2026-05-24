<script setup lang="ts">
import { computed, ref } from 'vue'
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

const ACTION_FEEDBACK_DELAY_MS = 160

const store = useReimBillStore()
const route = useRoute()
const router = useRouter()

const isCreate = computed(() => route.path.includes('/create'))
const billId = computed(() => String(route.params.id || ''))
const savingDraft = ref(false)
const submitting = ref(false)
const closingWithSave = ref(false)

const actionLocked = computed(() => savingDraft.value || submitting.value || closingWithSave.value)

function waitForActionFeedback() {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ACTION_FEEDBACK_DELAY_MS)
  })
}

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
  if (actionLocked.value) {
    return false
  }
  if (!validateDraftBeforeSave()) {
    return false
  }

  if (options?.closeAfterSave) {
    closingWithSave.value = true
  } else {
    savingDraft.value = true
  }

  try {
    const payload = store.buildSubmitPayload()
    const result = isCreate.value
      ? await createReimBillDraft(payload)
      : await updateReimBillDraft(billId.value, payload)

    if (isCreate.value) {
      await router.replace(`/reim-bills/detail/${result.id}`)
    }

    await store.loadDetail(result.id)
    ElMessage.success(options?.closeAfterSave ? '草稿已保存并关闭' : '草稿已保存')
    await waitForActionFeedback()

    if (options?.closeAfterSave) {
      await router.push('/reim-bills')
    }
    return true
  } finally {
    savingDraft.value = false
    closingWithSave.value = false
  }
}

async function handleClose() {
  if (actionLocked.value) {
    return
  }
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
  if (actionLocked.value) {
    return
  }
  const payload = store.buildSubmitPayload()
  const errors = validateSubmit(payload)
  if (errors.length) {
    ElMessage.error(errors[0])
    return
  }

  submitting.value = true
  try {
    if (isCreate.value) {
      await submitReimBill(payload)
    } else {
      await updateReimBill(billId.value, payload)
    }
    ElMessage.success('提交成功')
    await waitForActionFeedback()
    await router.push('/reim-bills')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <footer class="footer-actions" :data-state="actionLocked ? 'busy' : 'idle'">
    <el-button :disabled="actionLocked" @click="handleClose">
      {{ closingWithSave ? '保存中...' : '关闭' }}
    </el-button>
    <el-button
      v-if="!store.isReadonly"
      :loading="savingDraft || closingWithSave"
      :disabled="actionLocked"
      @click="handleSaveDraft"
    >
      保存草稿
    </el-button>
    <el-button
      v-if="!store.isReadonly"
      type="primary"
      :loading="submitting"
      :disabled="actionLocked && !submitting"
      @click="handleSubmit"
    >
      提交
    </el-button>
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
  transition:
    box-shadow 0.18s ease-out,
    transform 0.18s ease-out;
}

.footer-actions[data-state='busy'] {
  box-shadow: 0 -8px 20px rgba(31, 47, 61, 0.08);
}
</style>
