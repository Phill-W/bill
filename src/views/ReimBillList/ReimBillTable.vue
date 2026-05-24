<script setup lang="ts">
import chartTreeMapIcon from '@/assets/icons/chart-tree-map-svgrepo-com.svg'
import circleDotsVerticalIcon from '@/assets/icons/circle-dots-vertical-svgrepo-com.svg'
import fileContractIcon from '@/assets/icons/file-contract-svgrepo-com.svg'
import markerIcon from '@/assets/icons/marker-svgrepo-com.svg'
import BillListActionIcon from '@/components/BillListActionIcon.vue'
import { canEditListRow, getReimBillMenuActions } from '@/constants/reimBillListActions'

import { getReimStatusClass, getReimStatusLabel } from '@/constants/reimStatus'
import type { ReimBillListItem } from '@/types/reimBill'
import { formatMoney } from '@/utils/money'

withDefaults(
  defineProps<{
    data: ReimBillListItem[]
    loading: boolean
    emptyDescription?: string
  }>(),
  {
    emptyDescription: '暂无数据',
  },
)

const emit = defineEmits<{
  detail: [row: ReimBillListItem]
  delete: [row: ReimBillListItem]
  copy: [row: ReimBillListItem]
  edit: [row: ReimBillListItem]
}>()

function handleMenuCommand(command: string, row: ReimBillListItem) {
  if (command === 'delete') emit('delete', row)
  if (command === 'copy') emit('copy', row)
}
</script>

<template>
  <el-table
    v-loading="loading"
    :data="data"
    border
    height="calc(100vh - 206px)"
    size="small"
    class="bill-list-table bill-inline-table"
  >
    <template #empty>
      <el-empty v-if="!loading" :description="emptyDescription" />
    </template>
    <el-table-column width="46" align="center">
      <template #header>
        <img
          :src="chartTreeMapIcon"
          alt="序号"
          class="index-header-icon"
          data-icon="chart-tree-map"
        />
      </template>
      <template #default="{ $index }">
        <span class="index-cell">{{ $index + 1 }}</span>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="112" align="center">
      <template #default="{ row }">
        <div class="table-actions">
          <BillListActionIcon
            :src="fileContractIcon"
            alt="附件"
            title="暂不可用"
            action="file"
            :disabled="true"
          />
          <BillListActionIcon
            :src="markerIcon"
            alt="编辑"
            title="编辑"
            action="edit"
            :clickable="canEditListRow(row)"
            :disabled="!canEditListRow(row)"
            @click="emit('edit', row)"
          />
          <el-dropdown trigger="click" popper-class="bill-list-dropdown" @command="handleMenuCommand($event, row)">
            <BillListActionIcon
              :src="circleDotsVerticalIcon"
              alt="更多操作"
              title="更多操作"
              action="more"
              :clickable="true"
              :rotate="90"
              :use-tooltip="false"
            />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="action in getReimBillMenuActions()"
                  :key="action.key"
                  :command="action.key"
                  :disabled="action.disabled"
                >
                  {{ action.label }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="报销单号" min-width="146" show-overflow-tooltip>
      <template #default="{ row }">
        <span class="page-link" @click="emit('detail', row)">{{ row.reimNo }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="statusName" label="单据状态" width="88" show-overflow-tooltip>
      <template #default="{ row }">
        <span class="status-text" :class="getReimStatusClass(row.statusCode, row.statusName)">
          {{ getReimStatusLabel(row.statusCode, row.statusName) }}
        </span>
      </template>
    </el-table-column>
    <el-table-column prop="reimTypeName" label="单据类型" width="120" show-overflow-tooltip />
    <el-table-column label="报销人" width="132" show-overflow-tooltip>
      <template #default="{ row }">{{ row.reimburserName }}[{{ row.reimburserNo }}]</template>
    </el-table-column>
    <el-table-column label="报销部门" min-width="150" show-overflow-tooltip>
      <template #default="{ row }"
        >{{ row.reimDepartmentName }}[{{ row.reimDepartmentNo }}]</template
      >
    </el-table-column>
    <el-table-column
      prop="reimCompanyName"
      label="费用归属公司"
      min-width="160"
      show-overflow-tooltip
    />
    <el-table-column prop="businessTypeName" label="业务类型" width="100" show-overflow-tooltip />
    <el-table-column label="报销标题" min-width="220" show-overflow-tooltip>
      <template #default="{ row }">
        <span class="page-link" @click="emit('detail', row)">{{ row.reimbursementTitle }}</span>
      </template>
    </el-table-column>
    <el-table-column
      prop="businessTripReason"
      label="报销事由"
      min-width="150"
      show-overflow-tooltip
    />
    <el-table-column label="补助金额" width="100" header-align="right" align="right">
      <template #default="{ row }">{{ formatMoney(row.subsidyTotal) }}</template>
    </el-table-column>
    <el-table-column prop="creationTime" label="创建时间" width="116" />
  </el-table>
</template>

<style scoped>
.index-header-icon {
  width: 14px;
  height: 14px;
  display: block;
  margin: 0 auto;
  filter: invert(49%) sepia(61%) saturate(2408%) hue-rotate(210deg) brightness(100%) contrast(102%);
}

.index-cell {
  color: #667085;
}

.table-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  min-width: 86px;
}

.status-text {
  font-size: 12px;
  font-weight: 500;
}

.bill-list-table :deep(.status-text--draft),
.bill-list-table :deep(.status-text--processing),
.bill-list-table :deep(.status-text--approved),
.bill-list-table :deep(.status-text--completed),
.bill-list-table :deep(.status-text--voided),
.bill-list-table :deep(.status-text--unknown) {
  color: #5b7cff;
}

.bill-list-table :deep(.el-empty) {
  padding: 28px 0;
}
</style>
