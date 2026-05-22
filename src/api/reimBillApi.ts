import request from '@/utils/request'
import type {
  PageResult,
  ReimBillDetailDTO,
  ReimBillListItem,
  ReimBillQuery,
  ReimBillSubmitDTO,
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

export function updateReimBill(id: string, data: ReimBillSubmitDTO) {
  return request.put<SubmitResult>(`/api/v1/reim-bills/${id}/submit`, data)
}

export function voidReimBill(id: string) {
  return request.post<SubmitResult>(`/api/v1/reim-bills/${id}/void`, {})
}

export function copyReimBill(id: string) {
  return request.post<ReimBillDetailDTO>(`/api/v1/reim-bills/${id}/copy`, {})
}
