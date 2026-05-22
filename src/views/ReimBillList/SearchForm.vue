<script setup lang="ts">
import {
  buildBusinessTypeTree,
  departmentOptions,
  employeeOptions,
  reimCompanyOptions,
} from '@/constants/staticData'
import type { ReimBillQuery } from '@/types/reimBill'

const queryForm = defineModel<ReimBillQuery>({ required: true })

const emit = defineEmits<{
  search: []
  clear: []
  create: []
}>()

const businessTypeTree = buildBusinessTypeTree()
</script>

<template>
  <el-form :model="queryForm" class="search-form" label-width="82px">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-form-item label="报销单号">
          <el-input v-model="queryForm.reimNo" placeholder="请输入" clearable />
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="标题">
          <el-input v-model="queryForm.reimbursementTitle" placeholder="请输入" clearable />
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="事由">
          <el-input v-model="queryForm.businessTripReason" placeholder="请输入" clearable />
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="费用归属公司">
          <el-select v-model="queryForm.reimCompanyId" placeholder="请选择" clearable filterable>
            <el-option
              v-for="item in reimCompanyOptions"
              :key="item.reimCompanyId"
              :label="item.reimCompanyName"
              :value="item.reimCompanyId"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="报销部门">
          <el-select v-model="queryForm.reimDepartmentId" placeholder="请选择" clearable filterable>
            <el-option
              v-for="item in departmentOptions"
              :key="item.reimDepartmentId"
              :label="item.reimDepartmentName"
              :value="item.reimDepartmentId"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="报销人">
          <el-select v-model="queryForm.reimburserId" placeholder="请选择" clearable filterable>
            <el-option
              v-for="item in employeeOptions"
              :key="item.reimburserId"
              :label="`${item.reimburserName}(${item.reimburserNo})`"
              :value="item.reimburserId"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="业务类型">
          <el-tree-select
            v-model="queryForm.businessTypeId"
            :data="businessTypeTree"
            clearable
            filterable
            check-strictly
            placeholder="请选择"
          />
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item class="search-actions" label-width="0">
          <el-button type="primary" @click="emit('create')">新增</el-button>
          <el-button @click="emit('clear')">清除</el-button>
          <el-button type="primary" @click="emit('search')">搜索</el-button>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<style scoped>
.search-form {
  padding: 14px 12px 0;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
}

.search-form :deep(.el-form-item) {
  margin-bottom: 12px;
}

.search-actions :deep(.el-form-item__content) {
  justify-content: flex-end;
}
</style>
