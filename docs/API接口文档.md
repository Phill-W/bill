# 报销单 API 接口文档

## 1. 接口概述

| 项目 | 内容 |
| --- | --- |
| 系统模块 | 差旅报销单 |
| 后端基础路径 | `/api/v1/reim-bills` |
| 请求协议 | HTTP/HTTPS |
| 请求数据格式 | `application/json`，分页查询使用 Query 参数 |
| 响应数据格式 | `application/json` |
| 统一响应包装 | `ApiResult<T>` |
| 分页响应包装 | `PageResult<T>` |

## 2. 公共响应结构

### 2.1 ApiResult<T>

| 字段名 | 类型 | 是否必填 | 备注 | 格式 |
| --- | --- | --- | --- | --- |
| code | Integer | Y | 业务响应码。成功为 `200`，失败通常为 `500` | 数字 |
| message | String | Y | 响应消息 | 字符串 |
| data | T | N | 响应数据，失败时通常为空 | 对象/数组/布尔值 |
| errors | List<FieldErrorItem> | N | 字段级错误列表 | 数组 |
| traceId | String | N | 响应追踪号 | `yyyyMMddHHmmssSSS` |

### 2.2 FieldErrorItem

| 字段名 | 类型 | 是否必填 | 备注 | 格式 |
| --- | --- | --- | --- | --- |
| field | String | Y | 出错字段路径，例如 `main.reimbursementTitle` | 字符串 |
| message | String | Y | 错误说明 | 字符串 |

### 2.3 PageResult<T>

| 字段名 | 类型 | 是否必填 | 备注 | 格式 |
| --- | --- | --- | --- | --- |
| pageNo | Integer | Y | 当前页码，从 1 开始 | 数字 |
| pageSize | Integer | Y | 每页条数，默认 10，服务端上限 100 | 数字 |
| total | Long | Y | 总记录数 | 数字 |
| records | List<T> | Y | 当前页数据列表 | 数组 |

### 2.4 业务错误码

| 错误码 | HTTP 状态 | 说明 |
| --- | --- | --- |
| SUCCESS | 200 | 请求成功 |
| VALIDATION_ERROR | 400 | 请求参数或业务校验失败 |
| NOT_FOUND | 404 | 单据、行程等资源不存在 |
| STATUS_NOT_ALLOWED | 400 | 当前单据状态不允许执行操作 |
| DUPLICATE_TRIP_DATE | 400 | 同一出行人存在重复行程日期 |
| AMOUNT_VALIDATE_ERROR | 400 | 金额校验失败 |
| SYSTEM_ERROR | 500 | 系统异常 |

## 3. 接口清单

| 序号 | 接口名称 | 请求方式 | 接口路径 | 返回数据 |
| --- | --- | --- | --- | --- |
| 1 | 查询报销单分页列表 | GET | `/api/v1/reim-bills` | `ApiResult<PageResult<ReimBillListVO>>` |
| 2 | 查询报销单详情 | GET | `/api/v1/reim-bills/{id}` | `ApiResult<ReimBillDetailVO>` |
| 3 | 新增保存草稿 | POST | `/api/v1/reim-bills/draft` | `ApiResult<ReimSubmitResultVO>` |
| 4 | 编辑保存草稿 | POST | `/api/v1/reim-bills/{id}/draft` | `ApiResult<ReimSubmitResultVO>` |
| 5 | 新增提交报销单 | POST | `/api/v1/reim-bills/submit` | `ApiResult<ReimSubmitResultVO>` |
| 6 | 编辑提交报销单 | POST | `/api/v1/reim-bills/{id}/submit` | `ApiResult<ReimSubmitResultVO>` |
| 7 | 作废报销单 | POST | `/api/v1/reim-bills/{id}/void` | `ApiResult<Boolean>` |
| 8 | 复制报销单 | POST | `/api/v1/reim-bills/{id}/copy` | `ApiResult<ReimBillDetailVO>` |
| 9 | 删除报销单 | POST | `/api/v1/reim-bills/{id}/delete` | `ApiResult<Boolean>` |
| 10 | 新增补录行程 | POST | `/api/v1/reim-bills/{id}/itineraries` | `ApiResult<ReimItineraryOperationVO>` |
| 11 | 编辑补录行程 | POST | `/api/v1/reim-bills/{id}/itineraries/{itineraryId}/update` | `ApiResult<ReimItineraryOperationVO>` |
| 12 | 删除补录行程 | POST | `/api/v1/reim-bills/{id}/itineraries/{itineraryId}/delete` | `ApiResult<ReimBillDetailVO>` |

## 4. 接口详情

### 4.1 查询报销单分页列表

| 项目 | 内容 |
| --- | --- |
| 接口调用地址 | `ip + 端口 + /api/v1/reim-bills` |
| 请求方式 | GET |
| 接口路径 | `/api/v1/reim-bills` |
| 功能说明 | 按报销单号、标题、事由、公司、部门、报销人、业务类型、状态、创建日期等条件分页查询报销单列表 |

#### 入参

| 字段名 | 类型 | 是否必填 | 备注 | 格式 |
| --- | --- | --- | --- | --- |
| pageNo | Integer | Y | 当前页码，默认 1，小于 1 时按 1 处理 | Query |
| pageSize | Integer | Y | 每页条数，默认 10，大于 100 时按 100 处理 | Query |
| reimNo | String | N | 报销单号，支持模糊查询 | Query |
| reimbursementTitle | String | N | 报销标题，支持模糊查询 | Query |
| businessTripReason | String | N | 出差事由，支持模糊查询 | Query |
| reimCompanyId | String | N | 费用归属公司 ID | Query |
| reimDepartmentId | String | N | 报销部门 ID | Query |
| reimburserId | String | N | 报销人 ID | Query |
| businessTypeId | String | N | 业务类型 ID | Query |
| statusCode | String | N | 单据状态：`0` 草稿，`1` 已完成，`2` 已作废 | Query |
| creationStartDate | LocalDate | N | 创建开始日期 | `yyyy-MM-dd` |
| creationEndDate | LocalDate | N | 创建结束日期 | `yyyy-MM-dd` |

#### 出参

| 字段名 | 类型 | 是否必填 | 备注 | 格式 |
| --- | --- | --- | --- | --- |
| data.pageNo | Integer | Y | 当前页码 | 数字 |
| data.pageSize | Integer | Y | 每页条数 | 数字 |
| data.total | Long | Y | 总记录数 | 数字 |
| data.records | List<ReimBillListVO> | Y | 报销单列表 | 数组 |

#### ReimBillListVO

| 字段名 | 类型 | 是否必填 | 备注 | 格式 |
| --- | --- | --- | --- | --- |
| id | String | Y | 报销单主表 ID | 字符串 |
| reimNo | String | Y | 报销单号 | 字符串 |
| statusCode | String | Y | 单据状态编码 | `0/1/2` |
| statusName | String | Y | 单据状态名称 | 草稿/已完成/已作废 |
| reimTypeCode | String | Y | 单据类型编码 | 字符串 |
| reimTypeName | String | Y | 单据类型名称 | 字符串 |
| reimburserId | String | Y | 报销人 ID | 字符串 |
| reimburserNo | String | Y | 报销人工号 | 字符串 |
| reimburserName | String | Y | 报销人姓名 | 字符串 |
| reimDepartmentId | String | Y | 报销部门 ID | 字符串 |
| reimDepartmentNo | String | Y | 报销部门编号 | 字符串 |
| reimDepartmentName | String | Y | 报销部门名称 | 字符串 |
| reimCompanyId | String | Y | 费用归属公司 ID | 字符串 |
| reimCompanyNo | String | Y | 费用归属公司编号 | 字符串 |
| reimCompanyName | String | Y | 费用归属公司名称 | 字符串 |
| businessTypeId | String | Y | 业务类型 ID | 字符串 |
| businessTypeNo | String | Y | 业务类型编号 | 字符串 |
| businessTypeName | String | Y | 业务类型名称 | 字符串 |
| reimbursementTitle | String | Y | 报销标题 | 字符串 |
| businessTripReason | String | Y | 出差事由 | 字符串 |
| subsidyTotal | BigDecimal | Y | 补助总金额 | 金额，2 位小数 |
| creationTime | LocalDateTime | Y | 创建时间 | `yyyy-MM-dd HH:mm:ss` |

#### 业务说明

| 项目 | 内容 |
| --- | --- |
| 排序规则 | 按创建时间倒序、ID 倒序稳定排序 |
| 分页策略 | 服务端分页，返回当前页记录和总数 |
| 删除数据 | 逻辑删除数据不返回 |

### 4.2 查询报销单详情

| 项目 | 内容 |
| --- | --- |
| 接口调用地址 | `ip + 端口 + /api/v1/reim-bills/{id}` |
| 请求方式 | GET |
| 接口路径 | `/api/v1/reim-bills/{id}` |
| 功能说明 | 根据主表 ID 查询报销单完整详情 |

#### 入参

| 字段名 | 类型 | 是否必填 | 备注 | 格式 |
| --- | --- | --- | --- | --- |
| id | String | Y | 报销单主表 ID | Path |

#### 出参

| 字段名 | 类型 | 是否必填 | 备注 | 格式 |
| --- | --- | --- | --- | --- |
| data.main | ReimMainVO | Y | 主表信息 | 对象 |
| data.itineraries | List<ReimItineraryVO> | Y | 补录行程列表 | 数组 |
| data.subsidies | List<ReimSubsidyVO> | Y | 补助信息列表 | 数组 |
| data.subsidyCalendars | List<SubsidyCalendarVO> | Y | 补助日历列表 | 数组 |
| data.allocations | List<ReimAllocationVO> | Y | 费用归属及分摊列表 | 数组 |

#### 业务说明

| 项目 | 内容 |
| --- | --- |
| 不存在处理 | 单据不存在或已逻辑删除时返回 `NOT_FOUND` |
| 返回范围 | 返回主表、行程、补助、补助日历、分摊的完整数据 |

### 4.3 新增保存草稿

| 项目 | 内容 |
| --- | --- |
| 接口调用地址 | `ip + 端口 + /api/v1/reim-bills/draft` |
| 请求方式 | POST |
| 接口路径 | `/api/v1/reim-bills/draft` |
| 功能说明 | 新建报销单并保存为草稿 |

#### 入参

| 字段名 | 类型 | 是否必填 | 备注 | 格式 |
| --- | --- | --- | --- | --- |
| body | ReimBillSubmitDTO | Y | 报销单提交对象 | JSON |

#### 出参

| 字段名 | 类型 | 是否必填 | 备注 | 格式 |
| --- | --- | --- | --- | --- |
| data.id | String | Y | 报销单主表 ID | 字符串 |
| data.reimNo | String | Y | 报销单号 | 字符串 |
| data.statusCode | String | Y | 单据状态编码，草稿为 `0` | 字符串 |
| data.statusName | String | Y | 单据状态名称 | 字符串 |
| data.creationTime | LocalDateTime | N | 创建时间 | 日期时间 |
| data.updateTime | LocalDateTime | N | 更新时间 | 日期时间 |

#### 业务说明

| 项目 | 内容 |
| --- | --- |
| 草稿校验 | 主表标题必填；标题最多 500 字；出差事由最多 500 字；备注最多 1000 字 |
| 明细处理 | 如传入行程、补助、日历或分摊数据，则进行对应明细一致性校验 |
| 状态 | 保存后状态为草稿 |

### 4.4 编辑保存草稿

| 项目 | 内容 |
| --- | --- |
| 接口调用地址 | `ip + 端口 + /api/v1/reim-bills/{id}/draft` |
| 请求方式 | POST |
| 接口路径 | `/api/v1/reim-bills/{id}/draft` |
| 功能说明 | 编辑已有草稿并重新保存草稿 |

#### 入参

| 字段名 | 类型 | 是否必填 | 备注 | 格式 |
| --- | --- | --- | --- | --- |
| id | String | Y | 报销单主表 ID | Path |
| body | ReimBillSubmitDTO | Y | 报销单提交对象 | JSON |

#### 出参

| 字段名 | 类型 | 是否必填 | 备注 | 格式 |
| --- | --- | --- | --- | --- |
| data | ReimSubmitResultVO | Y | 保存结果 | 对象 |

#### 业务说明

| 项目 | 内容 |
| --- | --- |
| 状态限制 | 仅草稿单据允许保存为草稿 |
| 保存方式 | 覆盖保存主表和明细数据，保留原报销单号 |

### 4.5 新增提交报销单

| 项目 | 内容 |
| --- | --- |
| 接口调用地址 | `ip + 端口 + /api/v1/reim-bills/submit` |
| 请求方式 | POST |
| 接口路径 | `/api/v1/reim-bills/submit` |
| 功能说明 | 新增页面提交报销单，保存主表和全部明细 |

#### 入参

| 字段名 | 类型 | 是否必填 | 备注 | 格式 |
| --- | --- | --- | --- | --- |
| body | ReimBillSubmitDTO | Y | 报销单提交对象 | JSON |

#### 出参

| 字段名 | 类型 | 是否必填 | 备注 | 格式 |
| --- | --- | --- | --- | --- |
| data | ReimSubmitResultVO | Y | 提交结果 | 对象 |

#### 业务说明

| 项目 | 内容 |
| --- | --- |
| 状态 | 提交成功后状态为已完成 |
| 校验范围 | 主表、行程、补助、补助日历、费用分摊全部参与校验 |
| 重复校验 | 不允许重复提交相同报销单 |

### 4.6 编辑提交报销单

| 项目 | 内容 |
| --- | --- |
| 接口调用地址 | `ip + 端口 + /api/v1/reim-bills/{id}/submit` |
| 请求方式 | POST |
| 接口路径 | `/api/v1/reim-bills/{id}/submit` |
| 功能说明 | 编辑已有报销单后重新提交 |

#### 入参

| 字段名 | 类型 | 是否必填 | 备注 | 格式 |
| --- | --- | --- | --- | --- |
| id | String | Y | 报销单主表 ID | Path |
| body | ReimBillSubmitDTO | Y | 报销单提交对象 | JSON |

#### 出参

| 字段名 | 类型 | 是否必填 | 备注 | 格式 |
| --- | --- | --- | --- | --- |
| data | ReimSubmitResultVO | Y | 提交结果 | 对象 |

#### 业务说明

| 项目 | 内容 |
| --- | --- |
| 状态限制 | 已作废单据不允许编辑提交 |
| 保存方式 | 覆盖保存主表和明细数据，保留原报销单号 |

### 4.7 作废报销单

| 项目 | 内容 |
| --- | --- |
| 接口调用地址 | `ip + 端口 + /api/v1/reim-bills/{id}/void` |
| 请求方式 | POST |
| 接口路径 | `/api/v1/reim-bills/{id}/void` |
| 功能说明 | 将报销单状态更新为已作废 |

#### 入参

| 字段名 | 类型 | 是否必填 | 备注 | 格式 |
| --- | --- | --- | --- | --- |
| id | String | Y | 报销单主表 ID | Path |

#### 出参

| 字段名 | 类型 | 是否必填 | 备注 | 格式 |
| --- | --- | --- | --- | --- |
| data | Boolean | Y | 是否作废成功 | `true/false` |

#### 业务说明

| 项目 | 内容 |
| --- | --- |
| 状态限制 | 已作废单据不能重复作废 |
| 删除关系 | 仅更新主表状态，不删除主表和明细 |

### 4.8 复制报销单

| 项目 | 内容 |
| --- | --- |
| 接口调用地址 | `ip + 端口 + /api/v1/reim-bills/{id}/copy` |
| 请求方式 | POST |
| 接口路径 | `/api/v1/reim-bills/{id}/copy` |
| 功能说明 | 复制一份可编辑的报销单详情数据 |

#### 入参

| 字段名 | 类型 | 是否必填 | 备注 | 格式 |
| --- | --- | --- | --- | --- |
| id | String | Y | 被复制的报销单主表 ID | Path |

#### 出参

| 字段名 | 类型 | 是否必填 | 备注 | 格式 |
| --- | --- | --- | --- | --- |
| data | ReimBillDetailVO | Y | 清空数据库 ID、单号和状态后的副本 | 对象 |

#### 业务说明

| 项目 | 内容 |
| --- | --- |
| 用途 | 前端进入新增页面后再次提交 |
| 数据处理 | 清空主表和明细数据库 ID，保留业务内容 |

### 4.9 删除报销单

| 项目 | 内容 |
| --- | --- |
| 接口调用地址 | `ip + 端口 + /api/v1/reim-bills/{id}/delete` |
| 请求方式 | POST |
| 接口路径 | `/api/v1/reim-bills/{id}/delete` |
| 功能说明 | 对草稿或已作废单据执行逻辑删除 |

#### 入参

| 字段名 | 类型 | 是否必填 | 备注 | 格式 |
| --- | --- | --- | --- | --- |
| id | String | Y | 报销单主表 ID | Path |

#### 出参

| 字段名 | 类型 | 是否必填 | 备注 | 格式 |
| --- | --- | --- | --- | --- |
| data | Boolean | Y | 是否删除成功 | `true/false` |

#### 业务说明

| 项目 | 内容 |
| --- | --- |
| 状态限制 | 当前代码只允许草稿或已作废单据删除 |
| 删除方式 | 逻辑删除，列表和详情不再返回 |

### 4.10 新增补录行程

| 项目 | 内容 |
| --- | --- |
| 接口调用地址 | `ip + 端口 + /api/v1/reim-bills/{id}/itineraries` |
| 请求方式 | POST |
| 接口路径 | `/api/v1/reim-bills/{id}/itineraries` |
| 功能说明 | 为指定报销单新增一条补录行程，并自动生成补助信息和补助日历 |

#### 入参

| 字段名 | 类型 | 是否必填 | 备注 | 格式 |
| --- | --- | --- | --- | --- |
| id | String | Y | 报销单主表 ID | Path |
| body.itinerary | ReimItineraryDTO | Y | 补录行程数据 | JSON |

#### 出参

| 字段名 | 类型 | 是否必填 | 备注 | 格式 |
| --- | --- | --- | --- | --- |
| data.itinerary | ReimItineraryVO | Y | 保存后的行程 | 对象 |
| data.subsidy | ReimSubsidyVO | Y | 自动生成的补助信息 | 对象 |
| data.subsidyCalendars | List<SubsidyCalendarVO> | Y | 自动生成的补助日历 | 数组 |
| data.detail | ReimBillDetailVO | N | 最新单据详情，视后端返回实现而定 | 对象 |

#### 业务说明

| 项目 | 内容 |
| --- | --- |
| 状态限制 | 已作废单据不允许操作行程 |
| 日期校验 | 到达日期不能早于出发日期，不能晚于当前日期 |
| 重复校验 | 同一出行人不能存在重叠行程日期 |

### 4.11 编辑补录行程

| 项目 | 内容 |
| --- | --- |
| 接口调用地址 | `ip + 端口 + /api/v1/reim-bills/{id}/itineraries/{itineraryId}/update` |
| 请求方式 | POST |
| 接口路径 | `/api/v1/reim-bills/{id}/itineraries/{itineraryId}/update` |
| 功能说明 | 更新指定补录行程，并根据新的日期和城市重建对应补助信息和补助日历 |

#### 入参

| 字段名 | 类型 | 是否必填 | 备注 | 格式 |
| --- | --- | --- | --- | --- |
| id | String | Y | 报销单主表 ID | Path |
| itineraryId | String | Y | 补录行程 ID | Path |
| body.itinerary | ReimItineraryDTO | Y | 补录行程数据 | JSON |

#### 出参

| 字段名 | 类型 | 是否必填 | 备注 | 格式 |
| --- | --- | --- | --- | --- |
| data | ReimItineraryOperationVO | Y | 行程操作结果 | 对象 |

#### 业务说明

| 项目 | 内容 |
| --- | --- |
| 状态限制 | 已作废单据不允许操作行程 |
| 关联更新 | 更新行程后同步重建补助信息和补助日历 |

### 4.12 删除补录行程

| 项目 | 内容 |
| --- | --- |
| 接口调用地址 | `ip + 端口 + /api/v1/reim-bills/{id}/itineraries/{itineraryId}/delete` |
| 请求方式 | POST |
| 接口路径 | `/api/v1/reim-bills/{id}/itineraries/{itineraryId}/delete` |
| 功能说明 | 删除指定补录行程，并删除关联补助信息和补助日历 |

#### 入参

| 字段名 | 类型 | 是否必填 | 备注 | 格式 |
| --- | --- | --- | --- | --- |
| id | String | Y | 报销单主表 ID | Path |
| itineraryId | String | Y | 补录行程 ID | Path |

#### 出参

| 字段名 | 类型 | 是否必填 | 备注 | 格式 |
| --- | --- | --- | --- | --- |
| data | ReimBillDetailVO | Y | 删除后的最新报销单详情 | 对象 |

#### 业务说明

| 项目 | 内容 |
| --- | --- |
| 状态限制 | 已作废单据不允许操作行程 |
| 关联删除 | 同时删除该行程关联的补助信息和补助日历，并刷新费用合计 |

## 5. 请求对象说明

### 5.1 ReimBillSubmitDTO

| 字段名 | 类型 | 是否必填 | 备注 | 格式 |
| --- | --- | --- | --- | --- |
| main | ReimMainDTO | Y | 主表信息 | 对象 |
| itineraries | List<ReimItineraryDTO> | Y | 补录行程列表，提交时至少 1 条 | 数组 |
| subsidies | List<ReimSubsidyDTO> | Y | 补助信息列表，提交时不能为空 | 数组 |
| subsidyCalendars | List<SubsidyCalendarDTO> | Y | 补助日历列表，提交时不能为空 | 数组 |
| allocations | List<ReimAllocationDTO> | Y | 费用归属及分摊列表，提交时至少 1 条 | 数组 |

### 5.2 ReimMainDTO / ReimMainVO

| 字段名 | 类型 | 是否必填 | 备注 | 格式 |
| --- | --- | --- | --- | --- |
| id | String | N | 主表 ID，新增时可为空 | 字符串 |
| reimNo | String | N | 报销单号，新增时由后端生成 | 字符串 |
| reimTypeCode | String | N | 单据类型编码，默认 `TRAVEL_REIMBURSEMENT` | 字符串 |
| reimTypeName | String | N | 单据类型名称，默认差旅费用报销单 | 字符串 |
| statusCode | String | N | 单据状态编码 | `0/1/2` |
| statusName | String | N | 单据状态名称 | 字符串 |
| submitDate | LocalDate | Y | 提单日期 | `yyyy-MM-dd` |
| reimbursementTitle | String | Y | 报销标题，最多 500 字 | 字符串 |
| reimburserId | String | Y | 报销人 ID | 字符串 |
| reimburserNo | String | Y | 报销人工号 | 字符串 |
| reimburserName | String | Y | 报销人姓名 | 字符串 |
| reimDepartmentId | String | Y | 报销部门 ID | 字符串 |
| reimDepartmentNo | String | Y | 报销部门编号 | 字符串 |
| reimDepartmentName | String | Y | 报销部门名称 | 字符串 |
| reimCompanyId | String | Y | 费用归属公司 ID | 字符串 |
| reimCompanyNo | String | Y | 费用归属公司编号 | 字符串 |
| reimCompanyName | String | Y | 费用归属公司名称 | 字符串 |
| businessTypeId | String | Y | 业务类型 ID | 字符串 |
| businessTypeNo | String | Y | 业务类型编号 | 字符串 |
| businessTypeName | String | Y | 业务类型名称 | 字符串 |
| businessTripReason | String | Y | 出差事由，最多 500 字 | 字符串 |
| subsidyTotal | BigDecimal | Y | 补助总金额，等于补助信息补助金额之和 | 金额 |
| mealAllowance | BigDecimal | Y | 餐费补助，等于补助日历餐费金额之和 | 金额 |
| transportationAllowance | BigDecimal | Y | 交通补助，等于补助日历交通金额之和 | 金额 |
| phoneAllowance | BigDecimal | Y | 通讯补助，等于补助日历通讯金额之和 | 金额 |
| allocationTotal | BigDecimal | Y | 分摊总金额，等于分摊金额合计 | 金额 |
| remarks | String | N | 备注，最多 1000 字 | 字符串 |

### 5.3 ReimItineraryDTO / ReimItineraryVO

| 字段名 | 类型 | 是否必填 | 备注 | 格式 |
| --- | --- | --- | --- | --- |
| id | String | N | 行程 ID，新增时为空 | 字符串 |
| clientItineraryId | String | 新增 Y | 前端临时行程 ID，用于新增时关联补助和日历 | 字符串 |
| travelerId | String | Y | 出行人 ID | 字符串 |
| travelerNo | String | Y | 出行人工号 | 字符串 |
| travelerName | String | Y | 出行人姓名 | 字符串 |
| departureDate | LocalDate | Y | 出发日期 | `yyyy-MM-dd` |
| arrivalDate | LocalDate | Y | 到达日期，不能早于出发日期，不能晚于当前日期 | `yyyy-MM-dd` |
| itineraryDays | Integer | Y | 行程天数，必须等于到达日期 - 出发日期 + 1 | 数字 |
| departureCity | String | Y | 出发城市 | 字符串 |
| departureCityNo | String | Y | 出发城市编号 | 字符串 |
| departureCityType | String | N | 出发城市类型 | 字符串 |
| arrivingCity | String | Y | 到达城市 | 字符串 |
| arrivingCityNo | String | Y | 到达城市编号 | 字符串 |
| arrivingCityType | String | Y | 到达城市类型 | 字符串 |
| itineraryRoute | String | Y | 行程，例如 `武汉-北京` | 字符串 |
| itineraryInstructions | String | Y | 行程说明，最多 500 字 | 字符串 |
| sortNo | Integer | Y | 排序号 | 数字 |

### 5.4 ReimSubsidyDTO / ReimSubsidyVO

| 字段名 | 类型 | 是否必填 | 备注 | 格式 |
| --- | --- | --- | --- | --- |
| id | String | N | 补助信息 ID，新增时为空 | 字符串 |
| clientSubsidyId | String | 新增 Y | 前端临时补助 ID | 字符串 |
| itineraryId | String | 编辑 Y | 关联行程 ID | 字符串 |
| clientItineraryId | String | 新增 Y | 关联前端临时行程 ID | 字符串 |
| travelerId | String | Y | 出行人 ID | 字符串 |
| travelerNo | String | Y | 出行人工号 | 字符串 |
| travelerName | String | Y | 出行人姓名 | 字符串 |
| departureDate | LocalDate | Y | 出发日期，需与关联行程一致 | `yyyy-MM-dd` |
| arrivalDate | LocalDate | Y | 到达日期，需与关联行程一致 | `yyyy-MM-dd` |
| subsidyDays | Integer | Y | 补助天数，需等于行程天数 | 数字 |
| departureCity | String | Y | 出发城市 | 字符串 |
| departureCityNo | String | Y | 出发城市编号 | 字符串 |
| arrivingCity | String | Y | 到达城市 | 字符串 |
| arrivingCityNo | String | Y | 到达城市编号 | 字符串 |
| arrivingCityType | String | Y | 到达城市类型 | 字符串 |
| subsidyCity | String | Y | 补助城市 | 字符串 |
| subsidyCityNo | String | Y | 补助城市编号 | 字符串 |
| subsidyCityType | String | Y | 补助城市类型 | 字符串 |
| itineraryRoute | String | Y | 行程 | 字符串 |
| applicationAmount | BigDecimal | Y | 申请金额 | 金额 |
| subsidyAmount | BigDecimal | Y | 补助金额 | 金额 |
| mealAllowance | BigDecimal | Y | 餐费补助 | 金额 |
| transportationAllowance | BigDecimal | Y | 交通补助 | 金额 |
| phoneAllowance | BigDecimal | Y | 通讯补助 | 金额 |
| businessTypeId | String | Y | 业务类型 ID | 字符串 |
| businessTypeNo | String | Y | 业务类型编号 | 字符串 |
| businessTypeName | String | Y | 业务类型名称 | 字符串 |
| sortNo | Integer | Y | 排序号 | 数字 |

### 5.5 SubsidyCalendarDTO / SubsidyCalendarVO

| 字段名 | 类型 | 是否必填 | 备注 | 格式 |
| --- | --- | --- | --- | --- |
| id | String | N | 补助日历 ID，新增时为空 | 字符串 |
| clientItineraryId | String | 新增 Y | 关联前端临时行程 ID | 字符串 |
| clientSubsidyId | String | 新增 Y | 关联前端临时补助 ID | 字符串 |
| itineraryId | String | 编辑 Y | 关联行程 ID | 字符串 |
| subsidyId | String | 编辑 Y | 关联补助信息 ID | 字符串 |
| travelDate | LocalDate | Y | 出差日期 | `yyyy-MM-dd` |
| travelDateWeek | String | Y | 星期 | 字符串 |
| subsidizedCities | String | Y | 补助城市，需等于行程到达城市 | 字符串 |
| subsidizedCityNumber | String | Y | 补助城市编号 | 字符串 |
| subsidizedCityType | String | Y | 补助城市类型 | `1/2/3` |
| standardMealExpensesAmount | BigDecimal | Y | 餐费标准金额，按城市类型计算 | 金额 |
| standardTrafficAmount | BigDecimal | Y | 交通标准金额，默认 40.00 | 金额 |
| standardCommunicationAmount | BigDecimal | Y | 通讯标准金额，默认 40.00 | 金额 |
| mealSelected | String | Y | 餐费是否选中 | `0` 否，`1` 是 |
| trafficSelected | String | Y | 交通是否选中 | `0` 否，`1` 是 |
| communicationSelected | String | Y | 通讯是否选中 | `0` 否，`1` 是 |
| mealExpensesAmount | BigDecimal | Y | 餐费实际金额，未选中时必须为 0 | 金额 |
| trafficAmount | BigDecimal | Y | 交通实际金额，未选中时必须为 0 | 金额 |
| communicationAmount | BigDecimal | Y | 通讯实际金额，未选中时必须为 0 | 金额 |
| dailyStandardAmount | BigDecimal | Y | 当日标准金额合计 | 金额 |
| dailyActualAmount | BigDecimal | Y | 当日实际金额合计 | 金额 |
| remark | String | N | 备注 | 字符串 |
| sortNo | Integer | Y | 排序号 | 数字 |

### 5.6 ReimAllocationDTO / ReimAllocationVO

| 字段名 | 类型 | 是否必填 | 备注 | 格式 |
| --- | --- | --- | --- | --- |
| id | String | N | 分摊 ID，新增时为空 | 字符串 |
| reimCompanyId | String | Y | 费用归属公司 ID | 字符串 |
| reimCompanyNo | String | Y | 费用归属公司编号 | 字符串 |
| reimCompanyName | String | Y | 费用归属公司名称 | 字符串 |
| projectId | String | N | 项目 ID | 字符串 |
| projectNo | String | N | 项目编号 | 字符串 |
| projectName | String | N | 项目名称 | 字符串 |
| allocationRatio | BigDecimal | Y | 分摊比例，存值区间 0-1，页面展示为百分比 | 小数 |
| allocationAmount | BigDecimal | Y | 分摊金额 | 金额 |
| isFirstRow | String | Y | 是否首行，必须且只能存在一条 `1` | `0/1` |
| sortNo | Integer | Y | 排序号 | 数字 |

## 6. 核心校验规则

| 模块 | 校验规则 |
| --- | --- |
| 主表 | 提交时提单日期、报销标题、报销人、部门、费用归属公司、业务类型、出差事由、金额合计必填 |
| 行程 | 至少一条；同一出行人行程日期不能重叠；到达日期不能早于出发日期且不能晚于当前日期；行程天数必须等于日期差 + 1 |
| 补助 | 提交时不能为空；数量应与行程数量一致；每条行程只能对应一条补助信息；补助人员、日期、天数、城市应与关联行程一致 |
| 补助日历 | 提交时不能为空；每条补助必须覆盖出发日至到达日期间的每一天；城市信息应与补助/行程一致 |
| 补助金额 | 主表补助总金额等于补助信息补助金额之和；餐费、交通、通讯金额等于补助日历对应金额之和 |
| 费用分摊 | 至少一条；费用归属、分摊比例、分摊金额、是否首行必填；比例合计必须等于 1；分摊金额合计必须等于补助总金额；只能存在一条首行 |

