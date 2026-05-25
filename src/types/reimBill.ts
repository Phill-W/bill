export type YesNo = '0' | '1'

export interface ApiResult<T> {
  code: number
  message: string
  data: T
  traceId?: string
  errors?: Array<{ field: string; message: string }>
}

export interface PageResult<T> {
  pageNo: number
  pageSize: number
  total: number
  records: T[]
}

export interface ReimBillQuery {
  pageNo: number
  pageSize: number
  reimNo?: string
  reimbursementTitle?: string
  businessTripReason?: string
  reimCompanyId?: string
  reimDepartmentId?: string
  reimburserId?: string
  businessTypeId?: string
  statusCode?: string
}

export interface ReimBillListItem {
  id: string
  reimNo: string
  statusCode: string
  statusName: string
  reimTypeCode: string
  reimTypeName: string
  reimburserId: string
  reimburserNo: string
  reimburserName: string
  reimDepartmentId: string
  reimDepartmentNo: string
  reimDepartmentName: string
  reimCompanyId: string
  reimCompanyNo: string
  reimCompanyName: string
  businessTypeId: string
  businessTypeNo: string
  businessTypeName: string
  reimbursementTitle: string
  businessTripReason: string
  subsidyTotal: number
  creationTime: string
}

export interface ReimBillSubmitDTO {
  main: ReimMainDTO
  itineraries: ReimItineraryDTO[]
  subsidies: ReimSubsidyDTO[]
  subsidyCalendars: SubsidyCalendarDTO[]
  allocations: ReimAllocationDTO[]
}

export type ReimBillDetailDTO = ReimBillSubmitDTO

export interface ReimItineraryOperationDTO {
  itinerary: ReimItineraryDTO
  subsidy: ReimSubsidyDTO
}

export interface ReimMainDTO {
  id?: string | null
  reimNo?: string | null
  reimTypeCode?: string | null
  reimTypeName?: string | null
  statusCode?: string | null
  statusName?: string | null
  submitDate: string
  reimbursementTitle: string
  reimburserId: string
  reimburserNo: string
  reimburserName: string
  reimDepartmentId: string
  reimDepartmentNo: string
  reimDepartmentName: string
  reimCompanyId: string
  reimCompanyNo: string
  reimCompanyName: string
  businessTypeId: string
  businessTypeNo: string
  businessTypeName: string
  businessTripReason: string
  subsidyTotal: number
  mealAllowance: number
  transportationAllowance: number
  phoneAllowance: number
  allocationTotal: number
  remarks?: string
}

export interface ReimItineraryDTO {
  id?: string | null
  clientItineraryId: string
  travelerId: string
  travelerNo: string
  travelerName: string
  departureDate: string
  arrivalDate: string
  itineraryDays: number
  departureCity: string
  departureCityNo: string
  departureCityType?: string
  arrivingCity: string
  arrivingCityNo: string
  arrivingCityType: string
  itineraryRoute: string
  itineraryInstructions: string
  sortNo: number
}

export type ReimItineraryPayload = Omit<ReimItineraryDTO, 'id' | 'clientItineraryId'>

export interface ReimSubsidyDTO {
  id?: string | null
  clientSubsidyId: string
  itineraryId?: string | null
  clientItineraryId: string
  travelerId: string
  travelerNo: string
  travelerName: string
  departureDate: string
  arrivalDate: string
  subsidyDays: number
  departureCity: string
  departureCityNo: string
  arrivingCity: string
  arrivingCityNo: string
  arrivingCityType: string
  subsidyCity: string
  subsidyCityNo: string
  subsidyCityType: string
  itineraryRoute: string
  applicationAmount: number
  subsidyAmount: number
  mealAllowance: number
  transportationAllowance: number
  phoneAllowance: number
  businessTypeId: string
  businessTypeNo: string
  businessTypeName: string
  sortNo: number
}

export interface SubsidyCalendarDTO {
  id?: string | null
  clientItineraryId: string
  clientSubsidyId: string
  itineraryId?: string | null
  subsidyId?: string | null
  travelDate: string
  travelDateWeek: string
  subsidizedCities: string
  subsidizedCityNumber: string
  subsidizedCityType: string
  standardMealExpensesAmount: number
  standardTrafficAmount: number
  standardCommunicationAmount: number
  mealSelected: YesNo
  trafficSelected: YesNo
  communicationSelected: YesNo
  mealExpensesAmount: number
  trafficAmount: number
  communicationAmount: number
  dailyStandardAmount: number
  dailyActualAmount: number
  remark?: string
  sortNo: number
}

export interface ReimAllocationDTO {
  id?: string | null
  reimCompanyId: string
  reimCompanyNo: string
  reimCompanyName: string
  projectId?: string | null
  projectNo?: string | null
  projectName?: string | null
  allocationRatio: number
  allocationAmount: number
  isFirstRow: YesNo
  sortNo: number
}

export interface SelectOptionNode {
  label: string
  value: string
  children?: SelectOptionNode[]
  businessTypeNo?: string
  businessTypeName?: string
}
