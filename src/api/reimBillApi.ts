import request from '@/utils/request'
import type {
  PageResult,
  ReimBillDetailDTO,
  ReimBillListItem,
  ReimBillQuery,
  ReimBillSubmitDTO,
  ReimItineraryDTO,
  ReimItineraryPayload,
} from '@/types/reimBill'

export interface SubmitResult {
  id: string
  reimNo: string
  statusCode: string
  statusName: string
  creationTime?: string
  updateTime?: string
}

export function queryReimBillList(params: ReimBillQuery) {
  return request.get<PageResult<ReimBillListItem>>('/api/v1/reim-bills', { params })
}

export function getReimBillDetail(id: string) {
  return request.get<ReimBillDetailDTO>(`/api/v1/reim-bills/${id}`)
}

export function submitReimBill(data: ReimBillSubmitDTO) {
  return request.post<SubmitResult>('/api/v1/reim-bills/submit', data)
}

export function createReimBillDraft(data: ReimBillSubmitDTO) {
  return request.post<SubmitResult>('/api/v1/reim-bills/draft', data)
}

export function updateReimBillDraft(id: string, data: ReimBillSubmitDTO) {
  return request.post<SubmitResult>(`/api/v1/reim-bills/${id}/draft`, data)
}

export function updateReimBill(id: string, data: ReimBillSubmitDTO) {
  return request.post<SubmitResult>(`/api/v1/reim-bills/${id}/submit`, data)
}

export function voidReimBill(id: string) {
  return request.post<SubmitResult>(`/api/v1/reim-bills/${id}/void`, {})
}

export function deleteReimBill(id: string) {
  return request.post<boolean>(`/api/v1/reim-bills/${id}/delete`, {})
}

export function copyReimBill(id: string) {
  return request.post<ReimBillDetailDTO>(`/api/v1/reim-bills/${id}/copy`, {})
}

export function toReimItineraryPayload(itinerary: ReimItineraryDTO): ReimItineraryPayload {
  return {
    travelerId: itinerary.travelerId,
    travelerNo: itinerary.travelerNo,
    travelerName: itinerary.travelerName,
    departureDate: itinerary.departureDate,
    arrivalDate: itinerary.arrivalDate,
    itineraryDays: itinerary.itineraryDays,
    departureCity: itinerary.departureCity,
    departureCityNo: itinerary.departureCityNo,
    departureCityType: itinerary.departureCityType,
    arrivingCity: itinerary.arrivingCity,
    arrivingCityNo: itinerary.arrivingCityNo,
    arrivingCityType: itinerary.arrivingCityType,
    itineraryRoute: itinerary.itineraryRoute,
    itineraryInstructions: itinerary.itineraryInstructions,
    sortNo: itinerary.sortNo,
  }
}

export function createReimItinerary(id: string, itinerary: ReimItineraryDTO) {
  return request.post<boolean>(`/api/v1/reim-bills/${id}/itineraries`, {
    itinerary: toReimItineraryPayload(itinerary),
  })
}

export function updateReimItinerary(id: string, itineraryId: string, itinerary: ReimItineraryDTO) {
  return request.post<boolean>(`/api/v1/reim-bills/${id}/itineraries/${itineraryId}/update`, {
    itinerary: toReimItineraryPayload(itinerary),
  })
}

export function deleteReimItinerary(id: string, itineraryId: string) {
  return request.post<boolean>(`/api/v1/reim-bills/${id}/itineraries/${itineraryId}/delete`, {})
}
