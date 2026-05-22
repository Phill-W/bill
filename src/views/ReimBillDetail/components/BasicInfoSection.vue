<script setup lang="ts">
import {
  buildBusinessTypeTree,
  businessTypeOptions,
  departmentOptions,
  employeeOptions,
  reimCompanyOptions,
} from '@/constants/staticData'
import { useReimBillStore } from '@/stores/reimBillStore'

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
  <section class="section-block">
    <div class="section-title">基础信息</div>
    <div class="section-body">
      <el-form :model="store.main" label-width="104px" :disabled="store.isReadonly">
        <el-row :gutter="18">
          <el-col :span="12">
            <el-form-item label="报销标题" required>
              <el-input v-model="store.main.reimbursementTitle" maxlength="500" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :span="12">
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
          </el-col>
          <el-col :span="12">
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
          </el-col>
          <el-col :span="12">
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
          </el-col>
          <el-col :span="12">
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
          </el-col>
          <el-col :span="12">
            <el-form-item label="出差事由" required>
              <el-input v-model="store.main.businessTripReason" maxlength="500" show-word-limit />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </section>
</template>
