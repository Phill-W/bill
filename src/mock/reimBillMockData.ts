import type { ReimBillDetailDTO, ReimBillListItem } from '@/types/reimBill'

import { mockDetails, mockList } from './reimBillMockData.mjs'

export const typedMockDetails = mockDetails as ReimBillDetailDTO[]
export const typedMockList = mockList as ReimBillListItem[]
