<script setup lang="ts">
import { computed } from 'vue'

import SectionPanel from '@/components/SectionPanel.vue'
import {
  buildBusinessTypeTree,
  businessTypeOptions,
  departmentOptions,
  employeeOptions,
  reimCompanyOptions,
} from '@/constants/staticData'
import { useReimBillStore } from '@/stores/reimBillStore'
import type { SelectOptionNode } from '@/types/reimBill'

const store = useReimBillStore()
const staticBusinessTypeTree = buildBusinessTypeTree()

const reimburserOptions = computed(() => {
  if (
    !store.main.reimburserId ||
    employeeOptions.some((option) => option.reimburserId === store.main.reimburserId)
  ) {
    return employeeOptions
  }
  return [
    ...employeeOptions,
    {
      reimburserId: store.main.reimburserId,
      reimburserNo: store.main.reimburserNo,
      reimburserName: store.main.reimburserName || store.main.reimburserId,
    },
  ]
})

const departmentSelectOptions = computed(() => {
  if (
    !store.main.reimDepartmentId ||
    departmentOptions.some((option) => option.reimDepartmentId === store.main.reimDepartmentId)
  ) {
    return departmentOptions
  }
  return [
    ...departmentOptions,
    {
      reimDepartmentId: store.main.reimDepartmentId,
      reimDepartmentNo: store.main.reimDepartmentNo,
      reimDepartmentName: store.main.reimDepartmentName || store.main.reimDepartmentId,
    },
  ]
})

const companySelectOptions = computed(() => {
  if (
    !store.main.reimCompanyId ||
    reimCompanyOptions.some((option) => option.reimCompanyId === store.main.reimCompanyId)
  ) {
    return reimCompanyOptions
  }
  return [
    ...reimCompanyOptions,
    {
      reimCompanyId: store.main.reimCompanyId,
      reimCompanyNo: store.main.reimCompanyNo,
      reimCompanyName: store.main.reimCompanyName || store.main.reimCompanyId,
    },
  ]
})

const businessTypeTree = computed(() => {
  if (!store.main.businessTypeId || hasTreeValue(staticBusinessTypeTree, store.main.businessTypeId)) {
    return staticBusinessTypeTree
  }
  return [
    ...staticBusinessTypeTree,
    {
      label: store.main.businessTypeName || store.main.businessTypeId,
      value: store.main.businessTypeId,
      businessTypeNo: store.main.businessTypeNo,
      businessTypeName: store.main.businessTypeName,
    },
  ]
})

function hasTreeValue(nodes: SelectOptionNode[], value: string): boolean {
  return nodes.some((node) => node.value === value || hasTreeValue(node.children || [], value))
}

function onReimburserChange(id: string) {
  const item = reimburserOptions.value.find((option) => option.reimburserId === id)
  if (!item) return
  store.main.reimburserId = item.reimburserId
  store.main.reimburserNo = item.reimburserNo
  store.main.reimburserName = item.reimburserName
}

function onDepartmentChange(id: string) {
  const item = departmentSelectOptions.value.find((option) => option.reimDepartmentId === id)
  if (!item) return
  store.main.reimDepartmentId = item.reimDepartmentId
  store.main.reimDepartmentNo = item.reimDepartmentNo
  store.main.reimDepartmentName = item.reimDepartmentName
}

function onCompanyChange(id: string) {
  const item = companySelectOptions.value.find((option) => option.reimCompanyId === id)
  if (!item) return
  store.main.reimCompanyId = item.reimCompanyId
  store.main.reimCompanyNo = item.reimCompanyNo
  store.main.reimCompanyName = item.reimCompanyName
}

function onBusinessTypeChange(id: string) {
  const item = businessTypeOptions.find((option) => option.businessTypeId === id)
  store.main.businessTypeId = item?.businessTypeId || id
  store.main.businessTypeNo = item?.businessTypeNo || store.main.businessTypeNo
  store.main.businessTypeName = item?.businessTypeName || store.main.businessTypeName
}
</script>

<template>
  <SectionPanel title="基础信息">
    <div class="basic-info-panel">
      <el-form :model="store.main" label-width="108px" :disabled="store.isReadonly">
        <div class="basic-info-layout">
          <div class="basic-info-row basic-info-row--full">
            <el-form-item label="报销标题" required>
              <el-input v-model="store.main.reimbursementTitle" maxlength="500" show-word-limit />
            </el-form-item>
          </div>
          <div class="basic-info-row basic-info-row--triple">
            <el-form-item label="报销人" required>
              <el-select
                v-model="store.main.reimburserId"
                placeholder="请选择"
                filterable
                @change="onReimburserChange"
              >
                <el-option
                  v-for="item in reimburserOptions"
                  :key="item.reimburserId"
                  :label="`${item.reimburserName}(${item.reimburserNo})`"
                  :value="item.reimburserId"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="报销部门" required>
              <el-select
                v-model="store.main.reimDepartmentId"
                placeholder="请选择"
                filterable
                @change="onDepartmentChange"
              >
                <el-option
                  v-for="item in departmentSelectOptions"
                  :key="item.reimDepartmentId"
                  :label="`${item.reimDepartmentName}(${item.reimDepartmentNo})`"
                  :value="item.reimDepartmentId"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="费用归属公司" required>
              <el-select
                v-model="store.main.reimCompanyId"
                placeholder="请选择"
                filterable
                @change="onCompanyChange"
              >
                <el-option
                  v-for="item in companySelectOptions"
                  :key="item.reimCompanyId"
                  :label="item.reimCompanyName"
                  :value="item.reimCompanyId"
                />
              </el-select>
            </el-form-item>
          </div>
          <div class="basic-info-row basic-info-row--mixed">
            <el-form-item label="业务类型" required>
              <el-tree-select
                v-model="store.main.businessTypeId"
                :data="businessTypeTree"
                check-strictly
                filterable
                placeholder="请选择"
                @change="onBusinessTypeChange"
              />
            </el-form-item>
            <div class="basic-info-row__reason">
              <div class="basic-info-row__reason-label">
                <span class="basic-info-row__reason-required">*</span>
                <span>出差事由</span>
              </div>
              <el-form-item class="basic-info-row__reason-item" label-width="0" required>
                <el-input
                  v-model="store.main.businessTripReason"
                  type="textarea"
                  maxlength="500"
                  :rows="2"
                  show-word-limit
                />
              </el-form-item>
            </div>
          </div>
        </div>
      </el-form>
    </div>
  </SectionPanel>
</template>

<style scoped>
.basic-info-panel {
  padding-top: 2px;
}

.basic-info-layout {
  display: grid;
  gap: 16px;
}

.basic-info-row {
  display: grid;
  align-items: start;
  gap: 18px;
}

.basic-info-row--full {
  grid-template-columns: minmax(0, 1fr);
}

.basic-info-row--triple {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.basic-info-row--mixed {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.basic-info-panel :deep(.el-form-item) {
  margin-bottom: 0;
}

.basic-info-panel :deep(.el-form-item__label) {
  color: #495468;
  white-space: nowrap;
}

.basic-info-panel :deep(.el-form-item__content) {
  min-width: 0;
}

.basic-info-panel :deep(.el-select),
.basic-info-panel :deep(.el-tree-select),
.basic-info-panel :deep(.el-input) {
  width: 100%;
}

.basic-info-panel :deep(.el-textarea__inner) {
  min-height: 72px;
}

.basic-info-row__reason {
  display: grid;
  grid-column: 2 / 4;
  grid-template-columns: 108px minmax(0, 1fr);
  align-items: start;
}

.basic-info-row__reason-label {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  padding-top: 6px;
  padding-right: 12px;
  color: #495468;
  white-space: nowrap;
  line-height: 32px;
}

.basic-info-row__reason-required {
  color: var(--el-color-danger);
}

.basic-info-row__reason-item {
  margin-bottom: 0;
}

.basic-info-row__reason-item :deep(.el-form-item__content) {
  margin-left: 0 !important;
}

@media (max-width: 1280px) {
  .basic-info-row--triple,
  .basic-info-row--mixed {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .basic-info-row__reason {
    grid-column: 1 / -1;
  }
}
</style>
