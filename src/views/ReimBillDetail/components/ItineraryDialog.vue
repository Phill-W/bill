<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'

import { cityOptions, employeeOptions } from '@/constants/staticData'
import { useReimBillStore } from '@/stores/reimBillStore'
import type { ReimItineraryDTO } from '@/types/reimBill'
import { buildItinerary, type ItineraryFormValues, validateItinerary } from '@/utils/itinerary'

const visible = defineModel<boolean>('visible', { required: true })
const props = defineProps<{
  editing?: ReimItineraryDTO | null
  copyMode?: boolean
}>()

const store = useReimBillStore()
const form = reactive<ItineraryFormValues>({
  travelerId: '',
  departureCityNo: '',
  arrivingCityNo: '',
  dateRange: ['', ''],
  itineraryInstructions: '',
})

const title = computed(() => (props.editing && !props.copyMode ? '编辑行程' : '补录行程'))

watch(
  () => [visible.value, props.editing, props.copyMode] as const,
  () => {
    if (!visible.value) return
    if (props.editing) {
      form.id = props.copyMode ? null : props.editing.id
      form.clientItineraryId = props.copyMode ? undefined : props.editing.clientItineraryId
      form.travelerId = props.editing.travelerId
      form.departureCityNo = props.editing.departureCityNo
      form.arrivingCityNo = props.editing.arrivingCityNo
      form.dateRange = [props.editing.departureDate, props.editing.arrivalDate]
      form.itineraryInstructions = props.editing.itineraryInstructions
    } else {
      Object.assign(form, {
        id: null,
        clientItineraryId: undefined,
        travelerId: '',
        departureCityNo: '',
        arrivingCityNo: '',
        dateRange: ['', ''],
        itineraryInstructions: '',
      })
    }
  },
)

function handleSave() {
  try {
    const itinerary = buildItinerary(form, store.itineraries.length + 1)
    const error = validateItinerary(itinerary, store.itineraries)
    if (error) {
      ElMessage.error(error)
      return
    }
    store.addOrUpdateItinerary(itinerary)
    visible.value = false
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '行程保存失败')
  }
}
</script>

<template>
  <el-dialog v-model="visible" :title="title" width="720px" destroy-on-close>
    <el-alert
      class="dialog-tip"
      type="info"
      :closable="false"
      title="仅可补录未从申请单带入或未产生费用的行程信息；跨天跨城行程按到达城市匹配补助。"
    />
    <el-form :model="form" label-width="104px">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="出行人" required>
            <el-select v-model="form.travelerId" filterable placeholder="请选择">
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
          <el-form-item label="出发/到达日期" required>
            <el-date-picker
              v-model="form.dateRange"
              type="daterange"
              value-format="YYYY-MM-DD"
              start-placeholder="出发日期"
              end-placeholder="到达日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="出发城市" required>
            <el-select v-model="form.departureCityNo" filterable placeholder="请选择">
              <el-option
                v-for="item in cityOptions"
                :key="item.cityNo"
                :label="item.cityName"
                :value="item.cityNo"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="到达城市" required>
            <el-select v-model="form.arrivingCityNo" filterable placeholder="请选择">
              <el-option
                v-for="item in cityOptions"
                :key="item.cityNo"
                :label="item.cityName"
                :value="item.cityNo"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="行程说明" required>
            <el-input
              v-model="form.itineraryInstructions"
              type="textarea"
              maxlength="500"
              show-word-limit
              :rows="3"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.dialog-tip {
  margin-bottom: 14px;
}
</style>
