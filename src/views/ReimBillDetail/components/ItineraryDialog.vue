<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'

import { cityOptions, employeeOptions } from '@/constants/staticData'
import type { ReimItineraryDTO } from '@/types/reimBill'
import { buildItinerary, type ItineraryFormValues, validateItinerary } from '@/utils/itinerary'

const visible = defineModel<boolean>('visible', { required: true })
const props = defineProps<{
  editing?: ReimItineraryDTO | null
  copyMode?: boolean
  saving?: boolean
  existingItineraries: ReimItineraryDTO[]
}>()
const emit = defineEmits<{
  save: [itinerary: ReimItineraryDTO]
}>()

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
    const sortNo = props.editing && !props.copyMode ? props.editing.sortNo : props.existingItineraries.length + 1
    const itinerary = buildItinerary(form, sortNo)
    const error = validateItinerary(itinerary, props.existingItineraries)
    if (error) {
      ElMessage.error(error)
      return
    }
    emit('save', itinerary)
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '行程保存失败')
  }
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="860px"
    destroy-on-close
    class="itinerary-dialog"
  >
    <div class="itinerary-tip">
      <span class="itinerary-tip__icon">!</span>
      <div class="itinerary-tip__content">
        <strong>仅可补录未从申请单带入或未产生费用的行程信息</strong>
        <span>
          跨天跨城行程填写说明： 出发城市-到达城市：武汉-北京; 出发日期-到达日期：1号-5号;
          1号~5号补助按北京匹配;
        </span>
      </div>
    </div>

    <el-form :model="form" label-width="140px" class="itinerary-form">
      <el-form-item label="出行人" required>
        <el-select
          v-model="form.travelerId"
          filterable
          placeholder="请选择"
          class="itinerary-control"
        >
          <el-option
            v-for="item in employeeOptions"
            :key="item.reimburserId"
            :label="`${item.reimburserName}(${item.reimburserNo})`"
            :value="item.reimburserId"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="出发城市" required>
        <el-select
          v-model="form.departureCityNo"
          filterable
          placeholder="请选择"
          class="itinerary-control"
        >
          <el-option
            v-for="item in cityOptions"
            :key="item.cityNo"
            :label="item.cityName"
            :value="item.cityNo"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="到达城市" required>
        <el-select
          v-model="form.arrivingCityNo"
          filterable
          placeholder="请选择"
          class="itinerary-control"
        >
          <el-option
            v-for="item in cityOptions"
            :key="item.cityNo"
            :label="item.cityName"
            :value="item.cityNo"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="出发到达日期" required>
        <el-date-picker
          v-model="form.dateRange"
          type="daterange"
          value-format="YYYY-MM-DD"
          format="YYYY-MM-DD 00:00:00"
          range-separator="-"
          start-placeholder="出发日期"
          end-placeholder="到达日期"
          class="itinerary-date-range"
        />
      </el-form-item>

      <el-form-item label="行程说明" required class="itinerary-form__textarea-item">
        <el-input
          v-model="form.itineraryInstructions"
          type="textarea"
          maxlength="500"
          show-word-limit
          :rows="3"
          placeholder="行程说明"
          class="itinerary-textarea"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="itinerary-footer">
        <el-button class="itinerary-button itinerary-button--cancel" @click="visible = false">
          取消
        </el-button>
        <el-button
          class="itinerary-button itinerary-button--save"
          type="primary"
          :loading="saving"
          @click="handleSave"
        >
          保存
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
:global(.itinerary-dialog) {
  border-radius: 0;
}

:global(.itinerary-dialog .el-dialog__header) {
  display: flex;
  align-items: center;
  height: 62px;
  padding: 0 22px;
  margin: 0;
  border-bottom: 1px solid #edf0f5;
}

:global(.itinerary-dialog .el-dialog__title) {
  color: #1f2f3d;
  font-size: 20px;
  font-weight: 700;
}

:global(.itinerary-dialog .el-dialog__headerbtn) {
  top: 17px;
  right: 20px;
  width: 30px;
  height: 30px;
}

:global(.itinerary-dialog .el-dialog__close) {
  color: #a5adba;
  font-size: 18px;
}

:global(.itinerary-dialog .el-dialog__body) {
  padding: 20px 22px 18px;
}

:global(.itinerary-dialog .el-dialog__footer) {
  padding: 0;
  border-top: 1px solid #edf0f5;
}

.itinerary-tip {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-height: 92px;
  margin-bottom: 18px;
  padding: 12px 16px;
  background: #fffbe8;
  color: #304156;
  line-height: 1.55;
}

.itinerary-tip__icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-top: 1px;
  border-radius: 50%;
  background: #ff9f1a;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
}

.itinerary-tip__content {
  display: grid;
  gap: 2px;
  font-size: 16px;
}

.itinerary-tip__content strong {
  font-weight: 700;
}

.itinerary-form {
  width: 760px;
  margin: 0 auto;
}

.itinerary-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.itinerary-form :deep(.el-form-item__label) {
  color: #7b8797;
  font-size: 16px;
  font-weight: 600;
}

.itinerary-form :deep(.el-form-item__content) {
  min-width: 0;
}

.itinerary-control,
.itinerary-date-range {
  width: 340px;
}

.itinerary-form :deep(.el-date-editor.itinerary-date-range) {
  width: 420px !important;
  flex-grow: 0;
}

.itinerary-textarea {
  width: 680px;
}

.itinerary-form :deep(.el-select__wrapper),
.itinerary-form :deep(.el-input__wrapper) {
  min-height: 38px;
  border-radius: 4px;
  background: #fff;
  box-shadow: 0 0 0 1px #dfe5ee inset;
}

.itinerary-form :deep(.el-select__selected-item),
.itinerary-form :deep(.el-input__inner) {
  color: #25364d;
  font-size: 16px;
}

.itinerary-form :deep(.el-date-editor .el-range-input) {
  color: #25364d;
  font-size: 16px;
}

.itinerary-form :deep(.el-date-editor .el-range-separator) {
  color: #25364d;
  font-size: 16px;
}

.itinerary-form :deep(.el-date-editor .el-range__icon) {
  color: #c2c9d4;
}

.itinerary-form :deep(.el-textarea__inner) {
  min-height: 66px !important;
  padding: 8px 10px;
  border: 0;
  border-radius: 4px;
  background: #fff;
  color: #25364d;
  font-size: 16px;
  resize: none;
  box-shadow: 0 0 0 1px #dfe5ee inset;
}

.itinerary-form :deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px #c8d1de inset;
}

.itinerary-form :deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #0b8fdc inset;
}

.itinerary-form :deep(.el-input__count) {
  color: #aab2bf;
}

.itinerary-form__textarea-item {
  margin-bottom: 2px !important;
}

.itinerary-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  height: 70px;
  padding: 16px 20px;
  background: #fff;
}

.itinerary-button {
  width: 76px;
  height: 38px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
}

.itinerary-button--cancel {
  border-color: #0b8fdc;
  color: #0b8fdc;
  background: #fff;
}

.itinerary-button--save {
  border-color: #0b8fdc;
  background: #0b8fdc;
}
</style>
