<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

import { copyReimBill, deleteReimBill, queryReimBillList } from '@/api/reimBillApi'
import type { PageResult, ReimBillListItem, ReimBillQuery } from '@/types/reimBill'

import ReimBillTable from './ReimBillTable.vue'
import SearchForm from './SearchForm.vue'

const router = useRouter()
const loading = ref(false)
const rows = ref<ReimBillListItem[]>([])
const total = ref(0)

const queryForm = reactive<ReimBillQuery>({
  pageNo: 1,
  pageSize: 10,
})

async function loadList() {
  loading.value = true
  try {
    const res: PageResult<ReimBillListItem> = await queryReimBillList(queryForm)
    rows.value = res.records
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  queryForm.pageNo = 1
  loadList()
}

function handleClear() {
  Object.assign(queryForm, {
    pageNo: 1,
    pageSize: queryForm.pageSize,
    reimNo: undefined,
    reimbursementTitle: undefined,
    businessTripReason: undefined,
    reimCompanyId: undefined,
    reimDepartmentId: undefined,
    reimburserId: undefined,
    businessTypeId: undefined,
    statusCode: undefined,
  })
  loadList()
}

function handleCreate() {
  router.push('/reim-bills/create')
}

function goDetail(row: ReimBillListItem) {
  router.push(`/reim-bills/detail/${row.id}`)
}

function goEdit(row: ReimBillListItem) {
  router.push(`/reim-bills/detail/${row.id}`)
}

async function handleDelete(row: ReimBillListItem) {
  await ElMessageBox.confirm('确认删除该报销单吗？', '提示', { type: 'warning' })
  await deleteReimBill(row.id)
  ElMessage.success('删除成功')
  if (rows.value.length === 1 && queryForm.pageNo > 1) queryForm.pageNo -= 1
  loadList()
}

async function handleCopy(row: ReimBillListItem) {
  const copyData = await copyReimBill(row.id)
  sessionStorage.setItem('REIM_BILL_COPY_DATA', JSON.stringify(copyData))
  router.push('/reim-bills/create?copy=1')
}

onMounted(loadList)
</script>

<template>
  <main class="list-page">
    <SearchForm
      v-model="queryForm"
      @search="handleSearch"
      @clear="handleClear"
      @create="handleCreate"
    />
    <ReimBillTable
      :data="rows"
      :loading="loading"
      @detail="goDetail"
      @edit="goEdit"
      @delete="handleDelete"
      @copy="handleCopy"
    />
    <div class="pagination-bar">
      <el-pagination
        v-model:current-page="queryForm.pageNo"
        v-model:page-size="queryForm.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        background
        layout="total, sizes, prev, pager, next, jumper"
        @change="loadList"
      />
    </div>
  </main>
</template>

<style scoped>
.list-page {
  min-height: 100vh;
  background: #fff;
}

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-height: 40px;
  padding: 8px 18px;
  background: #fff;
}

.pagination-bar :deep(.el-pagination) {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  color: #667085;
  font-size: 13px;
  font-weight: 400;
}

.pagination-bar :deep(.el-pagination__total) {
  margin-right: 6px;
  color: #667085;
}

.pagination-bar :deep(.el-pagination__sizes) {
  margin-right: 8px;
}

.pagination-bar :deep(.el-select .el-select__wrapper),
.pagination-bar :deep(.el-pagination__editor.el-input .el-input__wrapper) {
  min-height: 24px;
  padding: 0 8px;
  border-radius: 4px;
  background: #fff;
  box-shadow: 0 0 0 1px #dbe2ea inset;
}

.pagination-bar :deep(.el-select .el-select__wrapper:hover),
.pagination-bar :deep(.el-pagination__editor.el-input .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c9d3df inset;
}

.pagination-bar :deep(.btn-prev),
.pagination-bar :deep(.btn-next),
.pagination-bar :deep(.el-pager li) {
  min-width: 24px;
  width: 24px;
  height: 24px;
  margin: 0;
  border: 1px solid #dbe2ea;
  border-radius: 4px;
  background: #fff;
  color: #667085;
  font-size: 13px;
  font-weight: 500;
}

.pagination-bar :deep(.btn-prev:hover),
.pagination-bar :deep(.btn-next:hover),
.pagination-bar :deep(.el-pager li:hover) {
  color: #5b7cff;
  border-color: #bfd1ff;
  background: #fff;
}

.pagination-bar :deep(.el-pager li.is-active) {
  color: #5b7cff;
  border-color: #5b7cff;
  background: #fff;
}

.pagination-bar :deep(.el-pager li.is-more) {
  border-color: transparent;
  background: transparent;
  color: #98a2b3;
}

.pagination-bar :deep(.el-pager li.is-more:hover) {
  border-color: transparent;
  background: transparent;
  color: #98a2b3;
}

.pagination-bar :deep(.btn-prev:disabled),
.pagination-bar :deep(.btn-next:disabled) {
  border-color: #e7ecf2;
  background: #fff;
  color: #c3cad5;
}

.pagination-bar :deep(.btn-prev:disabled:hover),
.pagination-bar :deep(.btn-next:disabled:hover) {
  border-color: #e7ecf2;
  background: #fff;
  color: #c3cad5;
}

.pagination-bar :deep(.el-pagination__jump) {
  margin-left: 8px;
  color: #667085;
}

.pagination-bar :deep(.el-pagination__jump .el-input__inner) {
  text-align: center;
}

.pagination-bar :deep(.el-pagination__editor.el-input) {
  width: 38px;
  margin: 0 4px;
}

.pagination-bar :deep(.el-pagination .el-icon) {
  font-size: 12px;
}
</style>
