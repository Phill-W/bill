<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

import { useReimBillStore } from '@/stores/reimBillStore'
import type { ReimSubsidyDTO, SubsidyCalendarDTO, YesNo } from '@/types/reimBill'
import { formatMoney } from '@/utils/money'
import { recalcCalendarRow } from '@/utils/subsidy'

const visible = defineModel<boolean>('visible', { required: true })
const props = defineProps<{
  subsidy: ReimSubsidyDTO | null
}>()

const store = useReimBillStore()
const calendarList = ref<SubsidyCalendarDTO[]>([])

const currentItinerary = computed(() =>
  store.itineraries.find((item) => item.clientItineraryId === props.subsidy?.clientItineraryId),
)

const standardTotal = computed(() =>
  calendarList.value.reduce((sum, item) => sum + item.dailyStandardAmount, 0),
)
const actualTotal = computed(() => calendarList.value.reduce((sum, item) => sum + item.dailyActualAmount, 0))

watch(
  () => [visible.value, props.subsidy?.clientSubsidyId] as const,
  () => {
    if (!visible.value || !props.subsidy) return
    calendarList.value = store.subsidyCalendars
      .filter((item) => item.clientSubsidyId === props.subsidy?.clientSubsidyId)
      .map((item) => ({ ...item }))
  },
)

function syncAmount(row: SubsidyCalendarDTO, field: 'meal' | 'traffic' | 'communication') {
  if (field === 'meal') row.mealExpensesAmount = row.mealSelected === '1' ? row.standardMealExpensesAmount : 0
  if (field === 'traffic') row.trafficAmount = row.trafficSelected === '1' ? row.standardTrafficAmount : 0
  if (field === 'communication') {
    row.communicationAmount =
      row.communicationSelected === '1' ? row.standardCommunicationAmount : 0
  }
  recalcCalendarRow(row)
}

function toggleCell(row: SubsidyCalendarDTO, field: 'meal' | 'traffic' | 'communication', checked: boolean) {
  const flag: YesNo = checked ? '1' : '0'
  if (field === 'meal') row.mealSelected = flag
  if (field === 'traffic') row.trafficSelected = flag
  if (field === 'communication') row.communicationSelected = flag
  syncAmount(row, field)
}

function toggleDateRow(row: SubsidyCalendarDTO, checked: boolean) {
  toggleCell(row, 'meal', checked)
  toggleCell(row, 'traffic', checked)
  toggleCell(row, 'communication', checked)
}

function toggleColumn(field: 'meal' | 'traffic' | 'communication', checked: boolean) {
  calendarList.value.forEach((row) => toggleCell(row, field, checked))
}

function toggleAll(checked: boolean) {
  calendarList.value.forEach((row) => toggleDateRow(row, checked))
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
  calendarList.value.forEach(recalcCalendarRow)
  store.saveSubsidyCalendars(props.subsidy.clientSubsidyId, calendarList.value)
  visible.value = false
}
</script>

<template>
  <el-dialog v-model="visible" title="补助日历" width="1060px" destroy-on-close class="subsidy-calendar-dialog">
    <div v-if="subsidy" class="calendar-layout">
      <aside class="calendar-sidebar">
        <div class="calendar-sidebar__title">补助日历</div>
        <div class="calendar-sidebar__tabs">
          <span class="is-active">{{ store.main.businessTypeName || '日常办公' }}</span>
        </div>
        <div class="calendar-route-card">
          <div class="calendar-route-card__line">
            <span class="calendar-route-card__dot" />
            <div>
              <div class="calendar-route-card__date">{{ subsidy.departureDate }}</div>
              <div class="calendar-route-card__city">{{ currentItinerary?.departureCity || '-' }}</div>
            </div>
          </div>
          <div class="calendar-route-card__line is-target">
            <span class="calendar-route-card__dot" />
            <div>
              <div class="calendar-route-card__date">{{ subsidy.arrivalDate }}</div>
              <div class="calendar-route-card__city">{{ currentItinerary?.arrivingCity || subsidy.subsidyCity }}</div>
            </div>
            <span class="calendar-route-card__days">{{ subsidy.subsidyDays }}天</span>
          </div>
        </div>
        <div class="calendar-summary-card">
          <div><span>补助金额</span><strong>{{ formatMoney(actualTotal) }}</strong></div>
          <div><span>标准金额</span><strong>{{ formatMoney(standardTotal) }}</strong></div>
          <div><span>行程</span><strong>{{ currentItinerary?.itineraryRoute || '-' }}</strong></div>
        </div>
      </aside>
      <div class="calendar-main">
        <div class="calendar-actions">
          <el-checkbox @change="toggleAll(Boolean($event))">全选</el-checkbox>
          <el-checkbox @change="toggleColumn('meal', Boolean($event))">餐费补助</el-checkbox>
          <el-checkbox @change="toggleColumn('traffic', Boolean($event))">交通补助</el-checkbox>
          <el-checkbox @change="toggleColumn('communication', Boolean($event))">通讯补助</el-checkbox>
        </div>
        <el-table :data="calendarList" border size="small" max-height="430" class="bill-inline-table">
          <el-table-column label="出差日期" width="150">
            <template #default="{ row }">
              <el-checkbox
                :model-value="
                  row.mealSelected === '1' &&
                  row.trafficSelected === '1' &&
                  row.communicationSelected === '1'
                "
                @change="toggleDateRow(row, Boolean($event))"
              >
                {{ row.travelDate }}
              </el-checkbox>
            </template>
          </el-table-column>
          <el-table-column prop="travelDateWeek" label="星期" width="80" />
          <el-table-column prop="subsidizedCities" label="补助城市" width="100" />
          <el-table-column label="餐费补助" min-width="180">
            <template #default="{ row }">
              <div class="amount-editor">
                <el-checkbox
                  :model-value="row.mealSelected === '1'"
                  @change="toggleCell(row, 'meal', Boolean($event))"
                />
                <el-input-number
                  v-model="row.mealExpensesAmount"
                  :disabled="row.mealSelected === '0'"
                  :min="0"
                  :max="row.standardMealExpensesAmount"
                  :precision="2"
                  controls-position="right"
                  @change="validateAmount(row)"
                />
                <span class="amount-standard">CNY {{ row.standardMealExpensesAmount.toFixed(2) }} / 天</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="交通补助" min-width="180">
            <template #default="{ row }">
              <div class="amount-editor">
                <el-checkbox
                  :model-value="row.trafficSelected === '1'"
                  @change="toggleCell(row, 'traffic', Boolean($event))"
                />
                <el-input-number
                  v-model="row.trafficAmount"
                  :disabled="row.trafficSelected === '0'"
                  :min="0"
                  :max="row.standardTrafficAmount"
                  :precision="2"
                  controls-position="right"
                  @change="validateAmount(row)"
                />
                <span class="amount-standard">CNY {{ row.standardTrafficAmount.toFixed(2) }} / 天</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="通讯补助" min-width="180">
            <template #default="{ row }">
              <div class="amount-editor">
                <el-checkbox
                  :model-value="row.communicationSelected === '1'"
                  @change="toggleCell(row, 'communication', Boolean($event))"
                />
                <el-input-number
                  v-model="row.communicationAmount"
                  :disabled="row.communicationSelected === '0'"
                  :min="0"
                  :max="row.standardCommunicationAmount"
                  :precision="2"
                  controls-position="right"
                  @change="validateAmount(row)"
                />
                <span class="amount-standard">CNY {{ row.standardCommunicationAmount.toFixed(2) }} / 天</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="当日补助" width="110" align="right">
            <template #default="{ row }">{{ formatMoney(row.dailyActualAmount) }}</template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSave">确认</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.calendar-layout {
  display: grid;
  grid-template-columns: 188px minmax(0, 1fr);
  gap: 14px;
}

.calendar-sidebar {
  display: grid;
  gap: 12px;
}

.calendar-sidebar__title {
  font-size: 16px;
  font-weight: 600;
}

.calendar-sidebar__tabs {
  display: inline-flex;
  gap: 10px;
  color: #ff7d21;
  font-weight: 500;
}

.calendar-route-card,
.calendar-summary-card {
  border: 1px solid var(--bill-table-border);
  background: #fff;
}

.calendar-route-card {
  padding: 14px 12px;
}

.calendar-route-card__line {
  position: relative;
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr);
  gap: 10px;
  padding-bottom: 18px;
}

.calendar-route-card__line::after {
  content: '';
  position: absolute;
  top: 10px;
  left: 8px;
  bottom: 0;
  width: 2px;
  background: #d7e5ff;
}

.calendar-route-card__line.is-target {
  padding-bottom: 0;
}

.calendar-route-card__line.is-target::after {
  display: none;
}

.calendar-route-card__dot {
  width: 16px;
  height: 16px;
  border-radius: 999px;
  border: 3px solid #7eb0ff;
  background: #fff;
}

.calendar-route-card__date {
  color: #5a6780;
  font-size: 13px;
}

.calendar-route-card__city {
  margin-top: 4px;
  color: #2f3c52;
  font-weight: 500;
}

.calendar-route-card__days {
  align-self: center;
  justify-self: end;
  color: #fff;
  background: #2f88ff;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 12px;
}

.calendar-summary-card {
  display: grid;
  gap: 8px;
  padding: 14px 12px;
}

.calendar-summary-card div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.calendar-summary-card strong {
  color: var(--bill-accent);
  font-variant-numeric: tabular-nums;
}

.calendar-main {
  min-width: 0;
}

.calendar-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
  margin-bottom: 12px;
}

.amount-editor {
  display: grid;
  grid-template-columns: 22px 104px auto;
  align-items: center;
  gap: 6px;
}

.amount-standard {
  color: var(--bill-accent);
  font-size: 12px;
  white-space: nowrap;
}
</style>
