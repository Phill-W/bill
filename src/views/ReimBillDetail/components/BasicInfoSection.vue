<script setup lang="ts">
import {
  buildBusinessTypeTree,
  businessTypeOptions,
  departmentOptions,
  employeeOptions,
  reimCompanyOptions,
} from '@/constants/staticData'
import { useReimBillStore } from '@/stores/reimBillStore'

import SectionPanel from '@/components/SectionPanel.vue'

const store = useReimBillStore()
const businessTypeTree = buildBusinessTypeTree()

function onReimburserChange(id: string) {
  const item = employeeOptions.find((option) => option.reimburserId === id)
  if (!item) return
  store.main.reimburserId = item.reimburserId
  store.main.reimburserNo = item.reimburserNo
  store.main.reimburserName = item.reimburserName
}

function onDepartmentChange(id: string) {
  const item = departmentOptions.find((option) => option.reimDepartmentId === id)
  if (!item) return
  store.main.reimDepartmentId = item.reimDepartmentId
  store.main.reimDepartmentNo = item.reimDepartmentNo
  store.main.reimDepartmentName = item.reimDepartmentName
}

function onCompanyChange(id: string) {
  const item = reimCompanyOptions.find((option) => option.reimCompanyId === id)
  if (!item) return
  store.main.reimCompanyId = item.reimCompanyId
  store.main.reimCompanyNo = item.reimCompanyNo
  store.main.reimCompanyName = item.reimCompanyName
}

function onBusinessTypeChange(id: string) {
  const item = businessTypeOptions.find((option) => option.businessTypeId === id)
  if (!item) return
  store.main.businessTypeId = item.businessTypeId
  store.main.businessTypeNo = item.businessTypeNo
  store.main.businessTypeName = item.businessTypeName
}
</script>

<template>
  <SectionPanel title="基础信息">
    <div class="basic-info-panel">
      <el-form :model="store.main" label-width="96px" :disabled="store.isReadonly">
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
                  v-for="item in employeeOptions"
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
                  v-for="item in departmentOptions"
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
                  v-for="item in reimCompanyOptions"
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
            <el-form-item label="出差事由" required>
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
  grid-template-columns: 340px minmax(0, 1fr);
}

.basic-info-panel :deep(.el-form-item) {
  margin-bottom: 0;
}

.basic-info-panel :deep(.el-form-item__label) {
  color: #495468;
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

@media (max-width: 1280px) {
  .basic-info-row--triple,
  .basic-info-row--mixed {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .basic-info-row--mixed :deep(.el-form-item:last-child) {
    grid-column: 1 / -1;
  }
}
</style>
