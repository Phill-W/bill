<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

import { copyReimBill, deleteReimBill, queryReimBillList } from '@/api/reimBillApi'
import type { PageResult, ReimBillListItem, ReimBillQuery } from '@/types/reimBill'

import ReimBillTable from './ReimBillTable.vue'
import SearchForm from './SearchForm.vue'

const DEFAULT_QUERY: ReimBillQuery = {
  pageNo: 1,
  pageSize: 10,
}

const router = useRouter()
const loading = ref(false)
const rows = ref<ReimBillListItem[]>([])
const total = ref(0)
const hasLoadedOnce = ref(false)
const requestSeq = ref(0)
const suppressedPaginationChanges = ref(0)
const lastSuccessfulRows = ref<ReimBillListItem[]>([])
const lastSuccessfulTotal = ref(0)
const lastSuccessfulQuery = ref<ReimBillQuery>({ ...DEFAULT_QUERY })

let queryForm = reactive<ReimBillQuery>({
  ...DEFAULT_QUERY,
})

const hasFilters = computed(() =>
  Boolean(
    queryForm.reimNo ||
      queryForm.reimbursementTitle ||
      queryForm.businessTripReason ||
      queryForm.reimCompanyId ||
      queryForm.reimDepartmentId ||
      queryForm.reimburserId ||
      queryForm.businessTypeId ||
      queryForm.statusCode,
  ),
)

const emptyDescription = computed(() =>
  hasFilters.value ? '暂无符合条件的数据，请调整筛选条件' : '暂无报销单',
)

const showPagination = computed(() => total.value > 0)

function cloneQuery(query: ReimBillQuery): ReimBillQuery {
  return {
    pageNo: query.pageNo,
    pageSize: query.pageSize,
    reimNo: query.reimNo,
    reimbursementTitle: query.reimbursementTitle,
    businessTripReason: query.businessTripReason,
    reimCompanyId: query.reimCompanyId,
    reimDepartmentId: query.reimDepartmentId,
    reimburserId: query.reimburserId,
    businessTypeId: query.businessTypeId,
    statusCode: query.statusCode,
  }
}

function applyQuery(query: ReimBillQuery, options?: { silentPagination?: boolean }) {
  if (
    options?.silentPagination &&
    (query.pageNo !== queryForm.pageNo || query.pageSize !== queryForm.pageSize)
  ) {
    suppressedPaginationChanges.value += 1
  }
  Object.assign(queryForm, cloneQuery(query))
}

function normalizeListResult(
  res: PageResult<ReimBillListItem> | null | undefined,
  fallbackQuery: ReimBillQuery,
): PageResult<ReimBillListItem> {
  const records = Array.isArray(res?.records) ? res.records : []
  const totalValue = Number(res?.total)
  const pageNoValue = Number(res?.pageNo)
  const pageSizeValue = Number(res?.pageSize)

  return {
    pageNo: Number.isInteger(pageNoValue) && pageNoValue > 0 ? pageNoValue : fallbackQuery.pageNo,
    pageSize: Number.isInteger(pageSizeValue) && pageSizeValue > 0 ? pageSizeValue : fallbackQuery.pageSize,
    total: Number.isFinite(totalValue) && totalValue > 0 ? totalValue : 0,
    records,
  }
}

function snapshotSuccess(query: ReimBillQuery, result: PageResult<ReimBillListItem>) {
  lastSuccessfulQuery.value = cloneQuery(query)
  lastSuccessfulRows.value = [...result.records]
  lastSuccessfulTotal.value = result.total
}

function applyResult(query: ReimBillQuery, result: PageResult<ReimBillListItem>) {
  applyQuery(
    {
      ...cloneQuery(query),
      pageNo: result.pageNo,
      pageSize: result.pageSize,
    },
    { silentPagination: true },
  )
  rows.value = result.records
  total.value = result.total
}

function rollbackToLastSuccess() {
  applyQuery(lastSuccessfulQuery.value, { silentPagination: true })
  rows.value = [...lastSuccessfulRows.value]
  total.value = lastSuccessfulTotal.value
}

async function loadList(options?: { query?: ReimBillQuery; silentRollback?: boolean }) {
  const currentRequest = ++requestSeq.value
  const requestQuery = cloneQuery(options?.query ?? queryForm)

  loading.value = true
  try {
    const raw = await queryReimBillList(requestQuery)
    if (currentRequest !== requestSeq.value) return

    const normalized = normalizeListResult(raw, requestQuery)
    const lastPageNo = Math.max(1, Math.ceil(normalized.total / normalized.pageSize))
    if (
      normalized.total > 0 &&
      normalized.records.length === 0 &&
      normalized.pageNo > 1 &&
      normalized.pageNo > lastPageNo
    ) {
      applyQuery(
        {
          ...requestQuery,
          pageNo: lastPageNo,
        },
        { silentPagination: true },
      )
      await loadList({ query: { ...requestQuery, pageNo: lastPageNo }, silentRollback: true })
      return
    }

    applyResult(requestQuery, normalized)
    snapshotSuccess(cloneQuery(queryForm), normalized)
  } catch {
    if (currentRequest !== requestSeq.value) return
    if (!options?.silentRollback) rollbackToLastSuccess()
  } finally {
    if (currentRequest === requestSeq.value) {
      loading.value = false
      hasLoadedOnce.value = true
    }
  }
}

function handleSearch() {
  applyQuery(
    {
      ...cloneQuery(queryForm),
      pageNo: 1,
    },
    { silentPagination: true },
  )
  loadList()
}

function handleClear() {
  applyQuery(
    {
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
    },
    { silentPagination: true },
  )
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
  if (rows.value.length === 1 && queryForm.pageNo > 1) {
    applyQuery(
      {
        ...cloneQuery(queryForm),
        pageNo: queryForm.pageNo - 1,
      },
      { silentPagination: true },
    )
  }
  loadList()
}

async function handleCopy(row: ReimBillListItem) {
  const copyData = await copyReimBill(row.id)
  sessionStorage.setItem('REIM_BILL_COPY_DATA', JSON.stringify(copyData))
  router.push('/reim-bills/create?copy=1')
}

function handlePaginationChange(pageNo: number, pageSize: number) {
  if (suppressedPaginationChanges.value > 0) {
    suppressedPaginationChanges.value -= 1
    return
  }
  applyQuery({
    ...cloneQuery(queryForm),
    pageNo,
    pageSize,
  })
  loadList()
}

function handleCurrentPageUpdate(pageNo: number) {
  queryForm.pageNo = pageNo
}

function handlePageSizeUpdate(pageSize: number) {
  queryForm.pageSize = pageSize
}

onMounted(() => {
  loadList({ query: cloneQuery(queryForm), silentRollback: true })
})
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
      :empty-description="hasLoadedOnce ? emptyDescription : ''"
      @detail="goDetail"
      @edit="goEdit"
      @delete="handleDelete"
      @copy="handleCopy"
    />
    <div class="pagination-shell">
      <transition name="pagination-fade">
        <div
          v-if="showPagination"
          class="pagination-bar"
          :class="{ 'pagination-bar--loading': loading }"
          data-state="visible"
        >
          <el-pagination
            :current-page="queryForm.pageNo"
            :page-size="queryForm.pageSize"
            :total="total"
            :page-sizes="[10, 20, 50]"
            :disabled="loading"
            :pager-count="11"
            background
            layout="total, sizes, prev, pager, next, jumper"
            @update:current-page="handleCurrentPageUpdate"
            @update:page-size="handlePageSizeUpdate"
            @change="handlePaginationChange"
          />
        </div>
      </transition>
    </div>
  </main>
</template>

<style scoped>
.list-page {
  min-height: 100vh;
  background: #fff;
}

.pagination-shell {
  min-height: 56px;
}

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-height: 40px;
  padding: 8px 18px;
  background: #fff;
  transition:
    opacity 0.18s ease-out,
    transform 0.18s ease-out;
}

.pagination-bar--loading {
  opacity: 0.88;
}

.pagination-fade-enter-active,
.pagination-fade-leave-active {
  transition:
    opacity 0.18s ease-out,
    transform 0.18s ease-out;
}

.pagination-fade-enter-from,
.pagination-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

.pagination-bar :deep(.el-pagination) {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  color: #667085;
  font-size: 13px;
  font-weight: 400;
}

.pagination-bar :deep(.el-pagination__total) {
  margin-right: 10px;
  color: #667085;
}

.pagination-bar :deep(.el-pagination__sizes) {
  margin-right: 12px;
}

.pagination-bar :deep(.el-pagination__sizes .el-select__wrapper) {
  min-width: 84px;
}

.pagination-bar :deep(.el-pager) {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pagination-bar :deep(.btn-prev) {
  margin-right: 2px;
}

.pagination-bar :deep(.btn-next) {
  margin-left: 2px;
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
  margin-left: 12px;
  color: #667085;
}

.pagination-bar :deep(.el-pagination__jump .el-input__inner) {
  text-align: center;
}

.pagination-bar :deep(.el-pagination__editor.el-input) {
  width: 38px;
  margin: 0 6px;
}

.pagination-bar :deep(.el-pagination .el-icon) {
  font-size: 12px;
}
</style>
