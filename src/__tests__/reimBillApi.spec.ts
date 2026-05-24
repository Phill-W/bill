import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ReimBillSubmitDTO, ReimItineraryDTO } from '@/types/reimBill'

const requestMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  request: vi.fn(),
}))

vi.mock('@/utils/request', () => ({
  default: requestMock,
}))

describe('reim bill api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses POST for editing and resubmitting an existing bill', async () => {
    const { createReimBillDraft, updateReimBill, updateReimBillDraft } = await import('@/api/reimBillApi')
    const payload = { main: {}, itineraries: [], subsidies: [], subsidyCalendars: [], allocations: [] } as unknown as ReimBillSubmitDTO

    await createReimBillDraft(payload)
    await updateReimBillDraft('bill-1', payload)
    await updateReimBill('bill-1', payload)

    expect(requestMock.post).toHaveBeenCalledWith('/api/v1/reim-bills/draft', payload)
    expect(requestMock.post).toHaveBeenCalledWith('/api/v1/reim-bills/bill-1/draft', payload)
    expect(requestMock.post).toHaveBeenCalledWith('/api/v1/reim-bills/bill-1/submit', payload)
    expect(requestMock.put).not.toHaveBeenCalled()
  })

  it('wraps itinerary create and update bodies without frontend-only ids', async () => {
    const {
      createReimItinerary,
      toReimItineraryPayload,
      updateReimItinerary,
    } = await import('@/api/reimBillApi')
    const itinerary = {
      id: 'server-itinerary-1',
      clientItineraryId: 'client-itinerary-1',
      travelerId: 'u002',
      travelerNo: 'EMP002',
      travelerName: '李四',
      departureDate: '2026-05-21',
      arrivalDate: '2026-05-21',
      itineraryDays: 1,
      departureCity: '武汉',
      departureCityNo: '420100',
      departureCityType: '2',
      arrivingCity: '上海',
      arrivingCityNo: '310100',
      arrivingCityType: '1',
      itineraryRoute: '武汉-上海',
      itineraryInstructions: '客户拜访',
      sortNo: 2,
    } satisfies ReimItineraryDTO

    const payload = toReimItineraryPayload(itinerary)
    await createReimItinerary('bill-1', itinerary)
    await updateReimItinerary('bill-1', 'server-itinerary-1', itinerary)

    expect(payload).not.toHaveProperty('id')
    expect(payload).not.toHaveProperty('clientItineraryId')
    expect(requestMock.post).toHaveBeenCalledWith('/api/v1/reim-bills/bill-1/itineraries', {
      itinerary: payload,
    })
    expect(requestMock.post).toHaveBeenCalledWith(
      '/api/v1/reim-bills/bill-1/itineraries/server-itinerary-1/update',
      { itinerary: payload },
    )
  })

  it('calls the backend itinerary delete endpoint', async () => {
    const { deleteReimItinerary } = await import('@/api/reimBillApi')

    await deleteReimItinerary('bill-1', 'server-itinerary-1')

    expect(requestMock.post).toHaveBeenCalledWith(
      '/api/v1/reim-bills/bill-1/itineraries/server-itinerary-1/delete',
      {},
    )
  })
})
