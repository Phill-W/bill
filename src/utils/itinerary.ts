import dayjs from 'dayjs'
import { nanoid } from 'nanoid'

import { cityOptions, employeeOptions } from '@/constants/staticData'
import type { ReimItineraryDTO } from '@/types/reimBill'
import { calcDays } from '@/utils/date'

export interface ItineraryFormValues {
  id?: string | null
  clientItineraryId?: string
  travelerId: string
  departureCityNo: string
  arrivingCityNo: string
  dateRange: [string, string]
  itineraryInstructions: string
  sortNo?: number
}

export function buildItinerary(
  values: ItineraryFormValues,
  sortNo: number,
): ReimItineraryDTO {
  const traveler = employeeOptions.find((item) => item.reimburserId === values.travelerId)
  const departureCity = cityOptions.find((item) => item.cityNo === values.departureCityNo)
  const arrivingCity = cityOptions.find((item) => item.cityNo === values.arrivingCityNo)

  if (!traveler || !departureCity || !arrivingCity) {
    throw new Error('行程人员或城市数据不存在')
  }

  const [departureDate, arrivalDate] = values.dateRange
  return {
    id: values.id,
    clientItineraryId: values.clientItineraryId || nanoid(),
    travelerId: traveler.reimburserId,
    travelerNo: traveler.reimburserNo,
    travelerName: traveler.reimburserName,
    departureDate,
    arrivalDate,
    itineraryDays: calcDays(departureDate, arrivalDate),
    departureCity: departureCity.cityName,
    departureCityNo: departureCity.cityNo,
    departureCityType: departureCity.cityType,
    arrivingCity: arrivingCity.cityName,
    arrivingCityNo: arrivingCity.cityNo,
    arrivingCityType: arrivingCity.cityType,
    itineraryRoute: `${departureCity.cityName}-${arrivingCity.cityName}`,
    itineraryInstructions: values.itineraryInstructions,
    sortNo,
  }
}

export function hasOverlappedItinerary(
  existing: ReimItineraryDTO[],
  target: ReimItineraryDTO,
) {
  return existing.some((item) => {
    if (item.clientItineraryId === target.clientItineraryId) return false
    if (item.travelerId !== target.travelerId) return false
    return (
      !dayjs(target.departureDate).isAfter(dayjs(item.arrivalDate), 'day') &&
      !dayjs(target.arrivalDate).isBefore(dayjs(item.departureDate), 'day')
    )
  })
}

export function validateItinerary(itinerary: ReimItineraryDTO, existing: ReimItineraryDTO[]) {
  if (!itinerary.travelerId) return '请选择出行人'
  if (!itinerary.departureCityNo) return '请选择出发城市'
  if (!itinerary.arrivingCityNo) return '请选择到达城市'
  if (!itinerary.departureDate || !itinerary.arrivalDate) return '请选择出发/到达日期'
  if (dayjs(itinerary.arrivalDate).isBefore(dayjs(itinerary.departureDate), 'day')) {
    return '到达日期不能早于出发日期'
  }
  if (dayjs(itinerary.arrivalDate).isAfter(dayjs(), 'day')) return '到达日期不能晚于当前日期'
  if (!itinerary.itineraryInstructions.trim()) return '请填写行程说明'
  if (itinerary.itineraryInstructions.length > 500) return '行程说明不能超过500字'
  if (hasOverlappedItinerary(existing, itinerary)) return '同一出行人存在重复行程日期'
  return ''
}
