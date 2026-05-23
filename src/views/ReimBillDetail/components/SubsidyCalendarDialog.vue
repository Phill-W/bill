<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Location } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

import { useReimBillStore } from '@/stores/reimBillStore'
import type { ReimSubsidyDTO, SubsidyCalendarDTO, YesNo } from '@/types/reimBill'
import { formatMoney, toMoney } from '@/utils/money'
import { recalcCalendarRow } from '@/utils/subsidy'

type AllowanceField = 'meal' | 'traffic' | 'communication'

const visible = defineModel<boolean>('visible', { required: true })
const props = defineProps<{
  subsidy: ReimSubsidyDTO | null
}>()

const store = useReimBillStore()
const calendarList = ref<SubsidyCalendarDTO[]>([])

const currentItinerary = computed(() =>
  store.itineraries.find((item) => item.clientItineraryId === props.subsidy?.clientItineraryId),
)

const businessTypeName = computed(() => store.main.businessTypeName || '日常办公')
const departureCity = computed(() => currentItinerary.value?.departureCity || props.subsidy?.departureCity || '-')
const arrivalCity = computed(
  () =>
    currentItinerary.value?.arrivingCity ||
    props.subsidy?.arrivingCity ||
    props.subsidy?.subsidyCity ||
    '-',
)
const tripRouteText = computed(() => `${departureCity.value} - ${arrivalCity.value}`)
const standardTotal = computed(() =>
  calendarList.value.reduce((sum, item) => sum + item.dailyStandardAmount, 0),
)
const actualTotal = computed(() => calendarList.value.reduce((sum, item) => sum + item.dailyActualAmount, 0))
const allChecked = computed(
  () => calendarList.value.length > 0 && calendarList.value.every((row) => isDateRowChecked(row)),
)
const allIndeterminate = computed(
  () => calendarList.value.some((row) => hasAnySelected(row)) && !allChecked.value,
)

watch(
  () => [visible.value, props.subsidy?.clientSubsidyId] as const,
  () => {
    if (!visible.value || !props.subsidy) return
    calendarList.value = store.subsidyCalendars
      .filter((item) => item.clientSubsidyId === props.subsidy?.clientSubsidyId)
      .map((item) => {
        const row = { ...item }
        normalizeUnselectedAmounts(row)
        recalcCalendarRow(row)
        return row
      })
  },
)

function getSelected(row: SubsidyCalendarDTO, field: AllowanceField) {
  if (field === 'meal') return row.mealSelected
  if (field === 'traffic') return row.trafficSelected
  return row.communicationSelected
}

function setSelected(row: SubsidyCalendarDTO, field: AllowanceField, value: YesNo) {
  if (field === 'meal') row.mealSelected = value
  if (field === 'traffic') row.trafficSelected = value
  if (field === 'communication') row.communicationSelected = value
}

function getStandardAmount(row: SubsidyCalendarDTO, field: AllowanceField) {
  if (field === 'meal') return row.standardMealExpensesAmount
  if (field === 'traffic') return row.standardTrafficAmount
  return row.standardCommunicationAmount
}

function getActualAmount(row: SubsidyCalendarDTO, field: AllowanceField) {
  if (field === 'meal') return row.mealExpensesAmount
  if (field === 'traffic') return row.trafficAmount
  return row.communicationAmount
}

function setActualAmount(row: SubsidyCalendarDTO, field: AllowanceField, amount: number) {
  const normalizedAmount = toMoney(amount)
  if (field === 'meal') row.mealExpensesAmount = normalizedAmount
  if (field === 'traffic') row.trafficAmount = normalizedAmount
  if (field === 'communication') row.communicationAmount = normalizedAmount
}

function normalizeUnselectedAmounts(row: SubsidyCalendarDTO) {
  if (row.mealSelected !== '1') row.mealExpensesAmount = 0
  if (row.trafficSelected !== '1') row.trafficAmount = 0
  if (row.communicationSelected !== '1') row.communicationAmount = 0
}

function getEditorValue(row: SubsidyCalendarDTO, field: AllowanceField) {
  return getSelected(row, field) === '1' ? getActualAmount(row, field) : getStandardAmount(row, field)
}

function isDateRowChecked(row: SubsidyCalendarDTO) {
  return row.mealSelected === '1' && row.trafficSelected === '1' && row.communicationSelected === '1'
}

function hasAnySelected(row: SubsidyCalendarDTO) {
  return row.mealSelected === '1' || row.trafficSelected === '1' || row.communicationSelected === '1'
}

function isColumnChecked(field: AllowanceField) {
  return calendarList.value.length > 0 && calendarList.value.every((row) => getSelected(row, field) === '1')
}

function isColumnIndeterminate(field: AllowanceField) {
  const checkedCount = calendarList.value.filter((row) => getSelected(row, field) === '1').length
  return checkedCount > 0 && checkedCount < calendarList.value.length
}

function syncAmount(row: SubsidyCalendarDTO, field: AllowanceField) {
  if (getSelected(row, field) === '1') setActualAmount(row, field, getStandardAmount(row, field))
  else setActualAmount(row, field, 0)
  recalcCalendarRow(row)
}

function toggleCell(row: SubsidyCalendarDTO, field: AllowanceField, checked: boolean) {
  setSelected(row, field, checked ? '1' : '0')
  syncAmount(row, field)
}

function toggleDateRow(row: SubsidyCalendarDTO, checked: boolean) {
  toggleCell(row, 'meal', checked)
  toggleCell(row, 'traffic', checked)
  toggleCell(row, 'communication', checked)
}

function toggleColumn(field: AllowanceField, checked: boolean) {
  calendarList.value.forEach((row) => toggleCell(row, field, checked))
}

function toggleAll(checked: boolean) {
  calendarList.value.forEach((row) => toggleDateRow(row, checked))
}

function updateAmount(row: SubsidyCalendarDTO, field: AllowanceField, value: number | undefined) {
  setActualAmount(row, field, value ?? 0)
  validateAmount(row)
}

function validateAmount(row: SubsidyCalendarDTO) {
  if (row.mealExpensesAmount > row.standardMealExpensesAmount) {
    row.mealExpensesAmount = row.standardMealExpensesAmount
    ElMessage.warning('餐费金额不能大于标准金额')
  }
  if (row.trafficAmount > row.standardTrafficAmount) {
    row.trafficAmount = row.standardTrafficAmount
    ElMessage.warning('交通金额不能大于标准金额')
  }
  if (row.communicationAmount > row.standardCommunicationAmount) {
    row.communicationAmount = row.standardCommunicationAmount
    ElMessage.warning('通讯金额不能大于标准金额')
  }
  recalcCalendarRow(row)
}

function handleSave() {
  if (!props.subsidy) return
  calendarList.value.forEach((row) => {
    normalizeUnselectedAmounts(row)
    recalcCalendarRow(row)
  })
  store.saveSubsidyCalendars(props.subsidy.clientSubsidyId, calendarList.value)
  visible.value = false
}
</script>

<template>
  <el-dialog
    v-model="visible"
    title="补助日历"
    width="1280px"
    top="6vh"
    destroy-on-close
    class="subsidy-calendar-dialog"
  >
    <div v-if="subsidy" class="calendar-dialog-content">
      <div class="calendar-trip-type">
        <span>出差类型</span>
        <strong>{{ businessTypeName }}</strong>
      </div>

      <div class="calendar-table-title">
        <strong>出差补助</strong>
        <el-checkbox
          :model-value="allChecked"
          :indeterminate="allIndeterminate"
          @change="toggleAll(Boolean($event))"
        >
          全选
        </el-checkbox>
      </div>

      <aside class="calendar-sidebar">
        <section class="calendar-route-card">
          <div class="route-date-row">
            <span class="route-label">开始日期</span>
            <span class="route-dot" />
            <span class="route-date">{{ subsidy.departureDate }}</span>
          </div>
          <div class="route-days-bar">
            <span>行程天数</span>
            <strong>{{ tripRouteText }}</strong>
            <span>{{ subsidy.subsidyDays }}天</span>
          </div>
          <div class="route-date-row is-end">
            <span class="route-label">结束日期</span>
            <span class="route-dot" />
            <span class="route-date">{{ subsidy.arrivalDate }}</span>
          </div>
        </section>

        <section class="calendar-summary-card">
          <div>
            <span>补助金额</span>
            <em>CNY</em>
            <strong>{{ formatMoney(actualTotal) }}</strong>
          </div>
          <div>
            <span>标准总额</span>
            <em>CNY</em>
            <strong>{{ formatMoney(standardTotal) }}</strong>
          </div>
          <div>
            <span>补助金额</span>
            <em>CNY</em>
            <strong>{{ formatMoney(actualTotal) }}</strong>
          </div>
        </section>
      </aside>

      <section class="calendar-main">
        <el-table
          :data="calendarList"
          border
          size="small"
          max-height="510"
          class="calendar-table bill-inline-table"
        >
          <el-table-column label="出差日期" width="176" align="center">
            <template #default="{ row }">
              <div class="calendar-date-cell">
                <div>{{ row.travelDate }}</div>
                <div>
                  <span>{{ row.travelDateWeek }}</span>
                  <el-checkbox
                    :model-value="isDateRowChecked(row)"
                    :indeterminate="hasAnySelected(row) && !isDateRowChecked(row)"
                    @change="toggleDateRow(row, Boolean($event))"
                  />
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column width="46" align="center">
            <template #default>
              <el-icon class="calendar-location-icon"><Location /></el-icon>
            </template>
          </el-table-column>

          <el-table-column prop="subsidizedCities" label="补助城市" min-width="150" align="center" />

          <el-table-column min-width="176" align="center">
            <template #header>
              <span class="allowance-header">
                餐费补助
                <el-checkbox
                  :model-value="isColumnChecked('meal')"
                  :indeterminate="isColumnIndeterminate('meal')"
                  @click.stop
                  @change="toggleColumn('meal', Boolean($event))"
                />
              </span>
            </template>
            <template #default="{ row }">
              <div class="allowance-cell">
                <div class="allowance-standard">CNY {{ formatMoney(row.standardMealExpensesAmount) }} / 天</div>
                <div class="allowance-control">
                  <el-checkbox
                    :model-value="row.mealSelected === '1'"
                    @change="toggleCell(row, 'meal', Boolean($event))"
                  />
                  <el-input-number
                    class="allowance-input"
                    :model-value="getEditorValue(row, 'meal')"
                    :disabled="row.mealSelected === '0'"
                    :min="0"
                    :max="row.standardMealExpensesAmount"
                    :precision="2"
                    :controls="false"
                    @update:model-value="updateAmount(row, 'meal', $event)"
                    @change="updateAmount(row, 'meal', $event)"
                  />
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column min-width="176" align="center">
            <template #header>
              <span class="allowance-header">
                交通补助
                <el-checkbox
                  :model-value="isColumnChecked('traffic')"
                  :indeterminate="isColumnIndeterminate('traffic')"
                  @click.stop
                  @change="toggleColumn('traffic', Boolean($event))"
                />
              </span>
            </template>
            <template #default="{ row }">
              <div class="allowance-cell">
                <div class="allowance-standard">CNY {{ formatMoney(row.standardTrafficAmount) }} / 天</div>
                <div class="allowance-control">
                  <el-checkbox
                    :model-value="row.trafficSelected === '1'"
                    @change="toggleCell(row, 'traffic', Boolean($event))"
                  />
                  <el-input-number
                    class="allowance-input"
                    :model-value="getEditorValue(row, 'traffic')"
                    :disabled="row.trafficSelected === '0'"
                    :min="0"
                    :max="row.standardTrafficAmount"
                    :precision="2"
                    :controls="false"
                    @update:model-value="updateAmount(row, 'traffic', $event)"
                    @change="updateAmount(row, 'traffic', $event)"
                  />
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column min-width="176" align="center">
            <template #header>
              <span class="allowance-header">
                通讯补助
                <el-checkbox
                  :model-value="isColumnChecked('communication')"
                  :indeterminate="isColumnIndeterminate('communication')"
                  @click.stop
                  @change="toggleColumn('communication', Boolean($event))"
                />
              </span>
            </template>
            <template #default="{ row }">
              <div class="allowance-cell">
                <div class="allowance-standard">CNY {{ formatMoney(row.standardCommunicationAmount) }} / 天</div>
                <div class="allowance-control">
                  <el-checkbox
                    :model-value="row.communicationSelected === '1'"
                    @change="toggleCell(row, 'communication', Boolean($event))"
                  />
                  <el-input-number
                    class="allowance-input"
                    :model-value="getEditorValue(row, 'communication')"
                    :disabled="row.communicationSelected === '0'"
                    :min="0"
                    :max="row.standardCommunicationAmount"
                    :precision="2"
                    :controls="false"
                    @update:model-value="updateAmount(row, 'communication', $event)"
                    @change="updateAmount(row, 'communication', $event)"
                  />
                </div>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </section>
    </div>

    <template #footer>
      <div class="calendar-dialog-footer">
        <el-button class="calendar-cancel-button" @click="visible = false">取消</el-button>
        <el-button class="calendar-confirm-button" type="primary" @click="handleSave">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
:global(.subsidy-calendar-dialog) {
  --calendar-blue: #0b8fdc;
  --calendar-orange: #ff6b00;
  --calendar-border: #e8edf3;
  --calendar-text: #25364d;
  border-radius: 0;
}

:global(.subsidy-calendar-dialog .el-dialog__header) {
  height: 56px;
  padding: 18px 16px 14px;
  border-bottom: 1px solid #f0f2f5;
  margin: 0;
}

:global(.subsidy-calendar-dialog .el-dialog__title) {
  color: #1f2f3d;
  font-size: 18px;
  font-weight: 600;
}

:global(.subsidy-calendar-dialog .el-dialog__headerbtn) {
  top: 12px;
  right: 14px;
  width: 28px;
  height: 28px;
}

:global(.subsidy-calendar-dialog .el-dialog__body) {
  padding: 0 16px 16px;
}

:global(.subsidy-calendar-dialog .el-dialog__footer) {
  padding: 0;
  border-top: 1px solid #edf1f6;
  box-shadow: 0 -4px 12px rgba(31, 47, 61, 0.08);
}

.calendar-dialog-content {
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr);
  grid-template-rows: 42px minmax(520px, auto);
  column-gap: 20px;
  min-height: 620px;
  background: #fff;
}

.calendar-trip-type,
.calendar-table-title {
  display: flex;
  align-items: center;
  min-width: 0;
}

.calendar-trip-type {
  gap: 18px;
  color: #2d3a4b;
  font-size: 14px;
  font-weight: 600;
}

.calendar-trip-type strong {
  color: var(--calendar-orange);
  font-weight: 600;
}

.calendar-table-title {
  justify-content: space-between;
  color: #1f2f3d;
  font-size: 15px;
}

.calendar-table-title strong {
  font-size: 16px;
  font-weight: 600;
}

.calendar-sidebar {
  display: grid;
  align-content: start;
  gap: 48px;
}

.calendar-route-card,
.calendar-summary-card {
  border: 1px solid var(--calendar-border);
  background: #fff;
}

.calendar-route-card {
  position: relative;
  padding: 20px 20px 16px;
}

.calendar-route-card::before {
  content: '';
  position: absolute;
  top: 24px;
  left: 84px;
  width: 3px;
  height: 88px;
  background: var(--calendar-blue);
  border-radius: 99px;
}

.route-date-row {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 64px 22px 1fr;
  align-items: center;
  min-height: 28px;
  color: #546176;
}

.route-date-row.is-end {
  margin-top: 16px;
}

.route-label {
  color: #3f4d60;
  font-size: 13px;
}

.route-dot {
  width: 10px;
  height: 10px;
  margin: auto;
  border: 3px solid var(--calendar-blue);
  border-radius: 50%;
  background: #fff;
}

.route-date {
  color: #354052;
  font-size: 13px;
}

.route-days-bar {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 70px minmax(0, 1fr) 44px;
  align-items: center;
  height: 30px;
  margin-top: 14px;
  padding: 0 10px;
  background: var(--calendar-blue);
  color: #fff;
  font-size: 13px;
  line-height: 30px;
}

.route-days-bar strong {
  overflow: hidden;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.route-days-bar span:last-child {
  text-align: right;
}

.calendar-summary-card {
  display: grid;
  gap: 18px;
  min-height: 318px;
  padding: 30px 20px;
}

.calendar-summary-card div {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 44px 70px;
  align-items: baseline;
  gap: 6px;
  color: #3f4d60;
  font-size: 13px;
}

.calendar-summary-card em {
  color: #3f4d60;
  font-style: normal;
  text-align: right;
}

.calendar-summary-card strong {
  color: var(--calendar-orange);
  font-size: 16px;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  text-align: right;
}

.calendar-main {
  min-width: 0;
}

.calendar-table {
  --el-table-border-color: var(--calendar-border);
  --el-table-header-bg-color: #fafbfc;
  --el-table-row-hover-bg-color: #fff;
  width: 100%;
}

.calendar-table :deep(th.el-table__cell) {
  height: 40px;
  padding: 0;
  background: #fafbfc;
  color: #2f3c52;
  font-size: 13px;
  font-weight: 500;
}

.calendar-table :deep(td.el-table__cell) {
  height: 78px;
  padding: 0;
  color: #344054;
  font-size: 13px;
}

.calendar-table :deep(.cell) {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: inherit;
  line-height: 1.4;
}

.allowance-header {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.calendar-date-cell {
  display: grid;
  justify-items: center;
  gap: 3px;
  color: #25364d;
  font-size: 13px;
}

.calendar-date-cell > div:last-child {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.calendar-location-icon {
  color: #9aa4b2;
  font-size: 15px;
}

.allowance-cell {
  display: grid;
  justify-items: center;
  gap: 5px;
  width: 100%;
}

.allowance-standard {
  color: var(--calendar-orange);
  font-size: 13px;
  font-weight: 600;
  line-height: 16px;
}

.allowance-control {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.allowance-input {
  width: 82px;
}

.allowance-input :deep(.el-input__wrapper) {
  height: 26px;
  padding: 0 8px;
  border-radius: 3px;
  background: #fff;
  box-shadow: 0 0 0 1px #dfe5ee inset;
}

.allowance-input :deep(.el-input__inner) {
  color: #46566c;
  font-size: 13px;
  text-align: center;
}

.allowance-input.is-disabled :deep(.el-input__wrapper),
.allowance-input :deep(.el-input__wrapper.is-disabled) {
  background: #f1f4f8;
  box-shadow: 0 0 0 1px #dfe5ee inset;
}

.allowance-input.is-disabled :deep(.el-input__inner),
.allowance-input :deep(.el-input__wrapper.is-disabled .el-input__inner) {
  color: #b8c0cc;
  -webkit-text-fill-color: #b8c0cc;
}

.calendar-dialog-content :deep(.el-checkbox) {
  height: 14px;
}

.calendar-dialog-content :deep(.el-checkbox__input) {
  line-height: 14px;
}

.calendar-dialog-content :deep(.el-checkbox__inner) {
  width: 14px;
  height: 14px;
  border-color: #d6dde8;
  border-radius: 2px;
}

.calendar-dialog-content :deep(.el-checkbox__label) {
  padding-left: 4px;
  color: #344054;
  font-size: 13px;
}

.calendar-dialog-content :deep(.el-checkbox__input.is-checked .el-checkbox__inner),
.calendar-dialog-content :deep(.el-checkbox__input.is-indeterminate .el-checkbox__inner) {
  border-color: var(--calendar-blue);
  background: var(--calendar-blue);
}

.calendar-dialog-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 44px;
  background: #fff;
}

.calendar-cancel-button,
.calendar-confirm-button {
  width: 62px;
  height: 30px;
  padding: 0;
  border-radius: 2px;
  font-size: 13px;
}

.calendar-cancel-button {
  border-color: #0b8fdc;
  color: #0b8fdc;
  background: #fff;
}

.calendar-confirm-button {
  border-color: #0b8fdc;
  background: #0b8fdc;
}
</style>
