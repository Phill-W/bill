const employee = {
  reimburserId: '13AB3A3F72409002',
  reimburserNo: '74541',
  reimburserName: '徐年年',
}
const department = {
  reimDepartmentId: '13AB8D7B52A9B002',
  reimDepartmentNo: '072001',
  reimDepartmentName: '客户成功事业部',
}
const company = {
  reimCompanyId: '1C54557F1782E000',
  reimCompanyNo: '0407',
  reimCompanyName: '胜意科技北京分公司',
}
const businessType = {
  businessTypeId: '1B5FEB7DD4396000',
  businessTypeNo: '10010010101',
  businessTypeName: '日常办公',
}

function addDays(date, days) {
  const value = new Date(`${date}T00:00:00`)
  value.setDate(value.getDate() + days)
  return value.toISOString().slice(0, 10)
}

function weekName(date) {
  const weeks = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return weeks[new Date(`${date}T00:00:00`).getDay()] || ''
}

function money(value) {
  return Number(value.toFixed(2))
}

function createMain(id, index = 1) {
  return {
    id,
    reimNo: `RCBX202605${String(index).padStart(4, '0')}`,
    reimTypeCode: 'TRAVEL_REIMBURSEMENT',
    reimTypeName: '差旅费用报销单',
    statusCode: index % 7 === 0 ? '2' : '1',
    statusName: index % 7 === 0 ? '已作废' : '已完成',
    submitDate: '2026-04-23',
    reimbursementTitle: index % 3 === 0 ? '测试' : `日常报销单标题 - 测试，${index * 1000}.00CNY`,
    reimburserId: employee.reimburserId,
    reimburserNo: employee.reimburserNo,
    reimburserName: employee.reimburserName,
    reimDepartmentId: department.reimDepartmentId,
    reimDepartmentNo: department.reimDepartmentNo,
    reimDepartmentName: department.reimDepartmentName,
    reimCompanyId: company.reimCompanyId,
    reimCompanyNo: company.reimCompanyNo,
    reimCompanyName: index % 5 === 0 ? '这个法人公司的名字可能会有点长显示...' : company.reimCompanyName,
    businessTypeId: businessType.businessTypeId,
    businessTypeNo: businessType.businessTypeNo,
    businessTypeName: businessType.businessTypeName,
    businessTripReason: index % 4 === 0 ? '测试' : '客户项目现场支持',
    subsidyTotal: 0,
    mealAllowance: 0,
    transportationAllowance: 0,
    phoneAllowance: 0,
    allocationTotal: 0,
    remarks: '备注信息',
  }
}

function createDetail(id, index = 1) {
  const main = createMain(id, index)
  const itinerary = {
    id: `${id}-iti-1`,
    clientItineraryId: `${id}-client-iti-1`,
    travelerId: employee.reimburserId,
    travelerNo: employee.reimburserNo,
    travelerName: employee.reimburserName,
    departureDate: '2026-04-13',
    arrivalDate: '2026-04-17',
    itineraryDays: 5,
    departureCity: '武汉',
    departureCityNo: '10458',
    departureCityType: '2',
    arrivingCity: '北京',
    arrivingCityNo: '10119',
    arrivingCityType: '1',
    itineraryRoute: '武汉-北京',
    itineraryInstructions: '客户项目现场支持',
    sortNo: 1,
  }
  const subsidy = {
    id: `${id}-sub-1`,
    clientSubsidyId: `${id}-client-sub-1`,
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
    applicationAmount: 0,
    subsidyAmount: 0,
    mealAllowance: 0,
    transportationAllowance: 0,
    phoneAllowance: 0,
    businessTypeId: main.businessTypeId,
    businessTypeNo: main.businessTypeNo,
    businessTypeName: main.businessTypeName,
    sortNo: 1,
  }

  const calendars = Array.from({ length: 5 }, (_, dayIndex) => {
    const dailyActualAmount = 180
    return {
      id: `${id}-cal-${dayIndex + 1}`,
      clientItineraryId: itinerary.clientItineraryId,
      clientSubsidyId: subsidy.clientSubsidyId,
      itineraryId: itinerary.id,
      subsidyId: subsidy.id,
      travelDate: addDays('2026-04-13', dayIndex),
      travelDateWeek: weekName(addDays('2026-04-13', dayIndex)),
      subsidizedCities: '北京',
      subsidizedCityNumber: '10119',
      subsidizedCityType: '1',
      standardMealExpensesAmount: 100,
      standardTrafficAmount: 40,
      standardCommunicationAmount: 40,
      mealSelected: '1',
      trafficSelected: '1',
      communicationSelected: '1',
      mealExpensesAmount: 100,
      trafficAmount: 40,
      communicationAmount: 40,
      dailyStandardAmount: dailyActualAmount,
      dailyActualAmount,
      remark: '',
      sortNo: dayIndex + 1,
    }
  })

  subsidy.applicationAmount = money(calendars.reduce((sum, row) => sum + row.dailyStandardAmount, 0))
  subsidy.subsidyAmount = money(calendars.reduce((sum, row) => sum + row.dailyActualAmount, 0))
  subsidy.mealAllowance = money(calendars.reduce((sum, row) => sum + row.mealExpensesAmount, 0))
  subsidy.transportationAllowance = money(calendars.reduce((sum, row) => sum + row.trafficAmount, 0))
  subsidy.phoneAllowance = money(calendars.reduce((sum, row) => sum + row.communicationAmount, 0))
  main.subsidyTotal = subsidy.subsidyAmount
  main.mealAllowance = subsidy.mealAllowance
  main.transportationAllowance = subsidy.transportationAllowance
  main.phoneAllowance = subsidy.phoneAllowance
  main.allocationTotal = subsidy.subsidyAmount

  return {
    main,
    itineraries: [itinerary],
    subsidies: [subsidy],
    subsidyCalendars: calendars,
    allocations: [
      {
        id: `${id}-alloc-1`,
        reimCompanyId: company.reimCompanyId,
        reimCompanyNo: company.reimCompanyNo,
        reimCompanyName: company.reimCompanyName,
        projectId: null,
        projectNo: null,
        projectName: null,
        allocationRatio: 1,
        allocationAmount: main.subsidyTotal,
        isFirstRow: '1',
        sortNo: 1,
      },
    ],
  }
}

export const mockDetails = Array.from({ length: 39 }, (_, index) =>
  createDetail(`mock-${index + 1}`, index + 1),
)

export const mockList = mockDetails.map((detail, index) => ({
  id: detail.main.id || `mock-${index + 1}`,
  reimNo: detail.main.reimNo || '',
  statusCode: detail.main.statusCode || '1',
  statusName: detail.main.statusName || '已完成',
  reimTypeCode: detail.main.reimTypeCode || 'TRAVEL_REIMBURSEMENT',
  reimTypeName: detail.main.reimTypeName || '差旅费用报销单',
  reimburserId: detail.main.reimburserId,
  reimburserNo: detail.main.reimburserNo,
  reimburserName: detail.main.reimburserName,
  reimDepartmentId: detail.main.reimDepartmentId,
  reimDepartmentNo: detail.main.reimDepartmentNo,
  reimDepartmentName: detail.main.reimDepartmentName,
  reimCompanyId: detail.main.reimCompanyId,
  reimCompanyNo: detail.main.reimCompanyNo,
  reimCompanyName: detail.main.reimCompanyName,
  businessTypeId: detail.main.businessTypeId,
  businessTypeNo: detail.main.businessTypeNo,
  businessTypeName: detail.main.businessTypeName,
  reimbursementTitle: detail.main.reimbursementTitle,
  businessTripReason: detail.main.businessTripReason,
  subsidyTotal: detail.main.subsidyTotal,
  creationTime: addDays('2026-05-13', -(index % 14)),
}))
