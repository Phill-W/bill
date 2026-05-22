import axios from 'axios'
import type { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { ElLoading, ElMessage } from 'element-plus'

import type { ApiResult } from '@/types/reimBill'

interface RequestConfig extends AxiosRequestConfig {
  loading?: boolean
}

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
    Accept: 'application/json, text/plain, */*',
  },
})

let loadingInstance: ReturnType<typeof ElLoading.service> | null = null

function showLoading() {
  loadingInstance = ElLoading.service({
    lock: true,
    text: '加载中...',
    background: 'rgba(255,255,255,0.45)',
  })
}

function hideLoading() {
  loadingInstance?.close()
  loadingInstance = null
}

export function isApiSuccess(result: Pick<ApiResult<unknown>, 'code'> | null | undefined) {
  return result?.code === 200
}

export function getApiErrorMessage(result: Partial<ApiResult<unknown>> | null | undefined) {
  return result?.errors?.[0]?.message || result?.message || '请求失败'
}

function getAxiosErrorMessage(error: AxiosError<ApiResult<unknown>>) {
  if (error.response?.data) return getApiErrorMessage(error.response.data)
  if (error.message?.includes('timeout')) return '请求超时'
  return '服务连接失败'
}

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig & { loading?: boolean }) => {
    if (config.loading) showLoading()
    const token = localStorage.getItem('VETOKEN')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => {
    hideLoading()
    ElMessage.error('请求失败')
    return Promise.reject(error)
  },
)

instance.interceptors.response.use(
  (response) => {
    hideLoading()
    const result = response.data as ApiResult<unknown>
    if (isApiSuccess(result)) return result.data as AxiosResponse
    ElMessage.error(getApiErrorMessage(result))
    return Promise.reject(result)
  },
  (error: AxiosError<ApiResult<unknown>>) => {
    hideLoading()
    ElMessage.error(getAxiosErrorMessage(error))
    return Promise.reject(error)
  },
)

export default {
  request<T = unknown>(config: RequestConfig) {
    return instance.request<unknown, T>(config)
  },
  get<T = unknown>(url: string, config?: RequestConfig) {
    return instance.get<unknown, T>(url, config)
  },
  post<T = unknown>(url: string, data?: unknown, config?: RequestConfig) {
    return instance.post<unknown, T>(url, data, config)
  },
  put<T = unknown>(url: string, data?: unknown, config?: RequestConfig) {
    return instance.put<unknown, T>(url, data, config)
  },
  delete<T = unknown>(url: string, config?: RequestConfig) {
    return instance.delete<unknown, T>(url, config)
  },
}
