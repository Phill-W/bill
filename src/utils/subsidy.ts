import { nanoid } from 'nanoid'

import {
  COMMUNICATION_STANDARD,
  getMealStandard,
  TRAFFIC_STANDARD,
} from '@/constants/subsidyStandard'
import type {
  ReimItineraryDTO,
  ReimMainDTO,
  ReimSubsidyDTO,
  SubsidyCalendarDTO,
} from '@/types/reimBill'
import { getWeekName, listDates } from '@/utils/date'
import { addMoney } from '@/utils/money'

export function buildSubsidyByItinerary(
  itinerary: ReimItineraryDTO,
  main: ReimMainDTO,
  existing?: ReimSubsidyDTO,
): ReimSubsidyDTO {
  return {
    id: existing?.id,
    clientSubsidyId: existing?.clientSubsidyId || nanoid(),
    itineraryId: itinerary.id,
    clientItineraryId: itinerary.clientItineraryId,
    travelerId: itinerary.travelerId,
    travelerNo: itinerary.travelerNo,
    travelerName: itinerary.travelerName,
    departureDate: itinerary.departureDate,
    arrivalDate: itinerary.arrivalDate,
    subsidyDays: itinerary.itineraryDays,
    departureCity: itinerary.departureCity,
    departureCityNo: itinerary.departureCityNo,
    arrivingCity: itinerary.arrivingCity,
    arrivingCityNo: itinerary.arrivingCityNo,
    arrivingCityType: itinerary.arrivingCityType,
    subsidyCity: itinerary.arrivingCity,
    subsidyCityNo: itinerary.arrivingCityNo,
    subsidyCityType: itinerary.arrivingCityType,
    itineraryRoute: itinerary.itineraryRoute,
    applicationAmount: existing?.applicationAmount || 0,
    subsidyAmount: existing?.subsidyAmount || 0,
    mealAllowance: existing?.mealAllowance || 0,
    transportationAllowance: existing?.transportationAllowance || 0,
    phoneAllowance: existing?.phoneAllowance || 0,
    businessTypeId: main.businessTypeId,
    businessTypeNo: main.businessTypeNo,
    businessTypeName: main.businessTypeName,
    sortNo: itinerary.sortNo,
  }
}

export function buildCalendarsByItinerary(
  itinerary: ReimItineraryDTO,
  subsidy: ReimSubsidyDTO,
): SubsidyCalendarDTO[] {
  return listDates(itinerary.departureDate, itinerary.arrivalDate).map((travelDate, index) => ({
    clientItineraryId: itinerary.clientItineraryId,
    clientSubsidyId: subsidy.clientSubsidyId,
    itineraryId: itinerary.id,
    subsidyId: subsidy.id,
    travelDate,
    travelDateWeek: getWeekName(travelDate),
    subsidizedCities: itinerary.arrivingCity,
    subsidizedCityNumber: itinerary.arrivingCityNo,
    subsidizedCityType: itinerary.arrivingCityType,
    standardMealExpensesAmount: getMealStandard(itinerary.arrivingCityType),
    standardTrafficAmount: TRAFFIC_STANDARD,
    standardCommunicationAmount: COMMUNICATION_STANDARD,
    mealSelected: '0',
    trafficSelected: '0',
    communicationSelected: '0',
    mealExpensesAmount: 0,
    trafficAmount: 0,
    communicationAmount: 0,
    dailyStandardAmount: 0,
    dailyActualAmount: 0,
    remark: '',
    sortNo: index + 1,
  }))
}

export function recalcCalendarRow(row: SubsidyCalendarDTO) {
  row.dailyStandardAmount = addMoney([
    row.mealSelected === '1' ? row.standardMealExpensesAmount : 0,
    row.trafficSelected === '1' ? row.standardTrafficAmount : 0,
    row.communicationSelected === '1' ? row.standardCommunicationAmount : 0,
  ])
  row.dailyActualAmount = addMoney([
    row.mealSelected === '1' ? row.mealExpensesAmount : 0,
    row.trafficSelected === '1' ? row.trafficAmount : 0,
    row.communicationSelected === '1' ? row.communicationAmount : 0,
  ])
}

export function summarizeCalendarsToSubsidy(
  subsidy: ReimSubsidyDTO,
  calendars: SubsidyCalendarDTO[],
) {
  const scoped = calendars.filter((item) => item.clientSubsidyId === subsidy.clientSubsidyId)
  subsidy.applicationAmount = addMoney(scoped.map((item) => item.dailyStandardAmount))
  subsidy.subsidyAmount = addMoney(scoped.map((item) => item.dailyActualAmount))
  subsidy.mealAllowance = addMoney(
    scoped.map((item) => (item.mealSelected === '1' ? item.mealExpensesAmount : 0)),
  )
  subsidy.transportationAllowance = addMoney(
    scoped.map((item) => (item.trafficSelected === '1' ? item.trafficAmount : 0)),
  )
  subsidy.phoneAllowance = addMoney(
    scoped.map((item) => (item.communicationSelected === '1' ? item.communicationAmount : 0)),
  )
}
