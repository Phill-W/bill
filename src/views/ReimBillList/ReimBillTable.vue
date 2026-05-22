<script setup lang="ts">
import { CopyDocument, Delete, EditPen, MoreFilled, View } from '@element-plus/icons-vue'

import type { ReimBillListItem } from '@/types/reimBill'
import { formatMoney } from '@/utils/money'

defineProps<{
  data: ReimBillListItem[]
  loading: boolean
}>()

const emit = defineEmits<{
  detail: [row: ReimBillListItem]
  void: [row: ReimBillListItem]
  copy: [row: ReimBillListItem]
}>()
</script>

<template>
  <el-table
    v-loading="loading"
    :data="data"
    border
    stripe
    height="calc(100vh - 206px)"
    size="small"
  >
    <el-table-column type="index" width="44" align="center" />
    <el-table-column label="操作" width="118" align="center" fixed>
      <template #default="{ row }">
        <el-tooltip content="查看" placement="top">
          <el-button :icon="View" link size="small" @click="emit('detail', row)" />
        </el-tooltip>
        <el-tooltip content="编辑" placement="top">
          <el-button :icon="EditPen" link size="small" @click="emit('detail', row)" />
        </el-tooltip>
        <el-dropdown trigger="click">
          <el-button :icon="MoreFilled" link size="small" />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :icon="Delete" @click="emit('void', row)">删除</el-dropdown-item>
              <el-dropdown-item disabled>手工推送</el-dropdown-item>
              <el-dropdown-item :icon="CopyDocument" @click="emit('copy', row)">复制</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </el-table-column>
    <el-table-column label="报销单号" min-width="146" show-overflow-tooltip>
      <template #default="{ row }">
        <span class="page-link" @click="emit('detail', row)">{{ row.reimNo }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="statusName" label="单据状态" width="88" show-overflow-tooltip>
      <template #default="{ row }">
        <el-tag :type="row.statusCode === '2' ? 'info' : 'primary'" effect="plain" size="small">
          {{ row.statusName }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="reimTypeName" label="单据类型" width="120" show-overflow-tooltip />
    <el-table-column label="报销人" width="132" show-overflow-tooltip>
      <template #default="{ row }">{{ row.reimburserName }}[{{ row.reimburserNo }}]</template>
    </el-table-column>
    <el-table-column label="报销部门" min-width="150" show-overflow-tooltip>
      <template #default="{ row }">{{ row.reimDepartmentName }}[{{ row.reimDepartmentNo }}]</template>
    </el-table-column>
    <el-table-column prop="reimCompanyName" label="费用归属公司" min-width="160" show-overflow-tooltip />
    <el-table-column prop="businessTypeName" label="业务类型" width="100" show-overflow-tooltip />
    <el-table-column label="报销标题" min-width="220" show-overflow-tooltip>
      <template #default="{ row }">
        <span class="page-link" @click="emit('detail', row)">{{ row.reimbursementTitle }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="businessTripReason" label="报销事由" min-width="150" show-overflow-tooltip />
    <el-table-column label="补助金额" width="100" header-align="right" align="right">
      <template #default="{ row }">{{ formatMoney(row.subsidyTotal) }}</template>
    </el-table-column>
    <el-table-column prop="creationTime" label="创建时间" width="116" />
  </el-table>
</template>
