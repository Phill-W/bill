<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

import { copyReimBill, queryReimBillList, voidReimBill } from '@/api/reimBillApi'
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

async function handleVoid(row: ReimBillListItem) {
  await ElMessageBox.confirm('确认作废该报销单吗？', '提示', { type: 'warning' })
  await voidReimBill(row.id)
  ElMessage.success('作废成功')
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
    <ReimBillTable :data="rows" :loading="loading" @detail="goDetail" @void="handleVoid" @copy="handleCopy" />
    <div class="pagination-bar">
      <span class="muted-text">共{{ total }}条</span>
      <el-pagination
        v-model:current-page="queryForm.pageNo"
        v-model:page-size="queryForm.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="sizes, prev, pager, next, jumper"
        small
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
  gap: 10px;
  height: 50px;
  padding: 0 18px;
  background: #fff;
}
</style>
