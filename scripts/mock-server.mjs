import http from 'node:http'

import { mockDetails, mockList } from '../src/mock/reimBillMockData.mjs'

const port = Number(process.env.MOCK_PORT || 4523)
const details = structuredClone(mockDetails)
const list = structuredClone(mockList)

function send(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json;charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  })
  res.end(
    JSON.stringify({
      code: status >= 200 && status < 300 ? 200 : 500,
      message: status >= 200 && status < 300 ? '操作成功' : '请求失败',
      data,
      traceId: String(Date.now()),
    }),
  )
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
    })
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch {
        resolve({})
      }
    })
  })
}

function matchText(value, keyword) {
  if (!keyword) return true
  return String(value || '').includes(String(keyword))
}

function updateListFromDetail(detail) {
  const row = {
    id: detail.main.id,
    reimNo: detail.main.reimNo,
    statusCode: detail.main.statusCode,
    statusName: detail.main.statusName,
    reimTypeCode: detail.main.reimTypeCode,
    reimTypeName: detail.main.reimTypeName,
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
    creationTime: new Date().toISOString().slice(0, 10),
  }
  const index = list.findIndex((item) => item.id === row.id)
  if (index >= 0) list[index] = row
  else list.unshift(row)
}

function cleanCopy(detail) {
  const copy = structuredClone(detail)
  copy.main.id = null
  copy.main.reimNo = null
  copy.main.statusCode = null
  copy.main.statusName = null
  copy.main.reimbursementTitle = `${copy.main.reimbursementTitle}-复制`
  copy.itineraries.forEach((item, index) => {
    item.id = null
    item.clientItineraryId = `copy-iti-${Date.now()}-${index}`
  })
  copy.subsidies.forEach((item, index) => {
    item.id = null
    item.itineraryId = null
    item.clientSubsidyId = `copy-sub-${Date.now()}-${index}`
    item.clientItineraryId = copy.itineraries[index]?.clientItineraryId || item.clientItineraryId
  })
  copy.subsidyCalendars.forEach((item) => {
    item.id = null
    item.itineraryId = null
    item.subsidyId = null
    const subsidy = copy.subsidies.find((sub) => sub.sortNo === item.sortNo || sub.clientSubsidyId)
    item.clientSubsidyId = subsidy?.clientSubsidyId || item.clientSubsidyId
    item.clientItineraryId = subsidy?.clientItineraryId || item.clientItineraryId
  })
  copy.allocations.forEach((item) => {
    item.id = null
  })
  return copy
}

const server = http.createServer(async (req, res) => {
  if (!req.url) return send(res, 404, null)
  if (req.method === 'OPTIONS') return send(res, 200, {})

  const url = new URL(req.url, `http://localhost:${port}`)
  const pathname = url.pathname

  if (req.method === 'GET' && pathname === '/api/v1/reim-bills') {
    const pageNo = Number(url.searchParams.get('pageNo') || 1)
    const pageSize = Number(url.searchParams.get('pageSize') || 10)
    const filtered = list.filter(
      (item) =>
        matchText(item.reimNo, url.searchParams.get('reimNo')) &&
        matchText(item.reimbursementTitle, url.searchParams.get('reimbursementTitle')) &&
        matchText(item.businessTripReason, url.searchParams.get('businessTripReason')) &&
        (!url.searchParams.get('reimCompanyId') ||
          item.reimCompanyId === url.searchParams.get('reimCompanyId')) &&
        (!url.searchParams.get('reimDepartmentId') ||
          item.reimDepartmentId === url.searchParams.get('reimDepartmentId')) &&
        (!url.searchParams.get('reimburserId') ||
          item.reimburserId === url.searchParams.get('reimburserId')) &&
        (!url.searchParams.get('businessTypeId') ||
          item.businessTypeId === url.searchParams.get('businessTypeId')),
    )
    const start = (pageNo - 1) * pageSize
    return send(res, 200, {
      pageNo,
      pageSize,
      total: filtered.length,
      records: filtered.slice(start, start + pageSize),
    })
  }

  if (req.method === 'GET' && pathname.match(/^\/api\/v1\/reim-bills\/[^/]+$/)) {
    const id = decodeURIComponent(pathname.split('/').at(-1))
    const detail = details.find((item) => item.main.id === id)
    return detail ? send(res, 200, detail) : send(res, 404, null)
  }

  if (req.method === 'POST' && pathname === '/api/v1/reim-bills/submit') {
    const payload = await readBody(req)
    const id = `mock-${Date.now()}`
    payload.main.id = id
    payload.main.reimNo = `RCBX${new Date().toISOString().slice(0, 10).replaceAll('-', '')}${list.length + 1}`
    payload.main.statusCode = '1'
    payload.main.statusName = '已完成'
    details.unshift(payload)
    updateListFromDetail(payload)
    return send(res, 200, {
      id,
      reimNo: payload.main.reimNo,
      statusCode: '1',
      statusName: '已完成',
      creationTime: new Date().toISOString().slice(0, 10),
    })
  }

  if (req.method === 'PUT' && pathname.match(/^\/api\/v1\/reim-bills\/[^/]+\/submit$/)) {
    const id = decodeURIComponent(pathname.split('/').at(-2))
    const payload = await readBody(req)
    payload.main.id = id
    payload.main.statusCode = '1'
    payload.main.statusName = '已完成'
    const index = details.findIndex((item) => item.main.id === id)
    if (index >= 0) details[index] = payload
    else details.unshift(payload)
    updateListFromDetail(payload)
    return send(res, 200, {
      id,
      reimNo: payload.main.reimNo,
      statusCode: '1',
      statusName: '已完成',
      updateTime: new Date().toISOString().slice(0, 10),
    })
  }

  if (req.method === 'POST' && pathname.match(/^\/api\/v1\/reim-bills\/[^/]+\/void$/)) {
    const id = decodeURIComponent(pathname.split('/').at(-2))
    const detail = details.find((item) => item.main.id === id)
    if (!detail) return send(res, 404, null)
    detail.main.statusCode = '2'
    detail.main.statusName = '已作废'
    updateListFromDetail(detail)
    return send(res, 200, {
      id,
      reimNo: detail.main.reimNo,
      statusCode: '2',
      statusName: '已作废',
    })
  }

  if (req.method === 'POST' && pathname.match(/^\/api\/v1\/reim-bills\/[^/]+\/copy$/)) {
    const id = decodeURIComponent(pathname.split('/').at(-2))
    const detail = details.find((item) => item.main.id === id)
    return detail ? send(res, 200, cleanCopy(detail)) : send(res, 404, null)
  }

  return send(res, 404, null)
})

server.listen(port, () => {
  console.log(`Mock server running at http://localhost:${port}`)
})
