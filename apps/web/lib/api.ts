import axios, { AxiosError, AxiosInstance } from 'axios'
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  User,
  Customer,
  Regulation,
  Material,
  Model,
  Quotation,
  ListResponse,
  CreateUserRequest,
  UpdateUserRequest,
  CreateRegulationRequest,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CreateMaterialRequest,
  UpdateMaterialRequest,
  CreateModelRequest,
  UpdateModelRequest,
  CreateBomMaterialRequest,
  UpdateBomMaterialRequest,
  CreatePackagingConfigRequest,
  UpdatePackagingConfigRequest,
  CreateProcessConfigRequest,
  UpdateProcessConfigRequest,
  CreatePackagingMaterialRequest,
  UpdatePackagingMaterialRequest,
  CreateQuotationRequest,
  UpdateQuotationRequest,
  ReviewQuotationRequest,
  CalculateCostRequest,
  CalculateCostResponse,
  CreateStandardCostRequest,
  DashboardStatsDto,
} from '@cost/shared-types'

// 创建 axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: typeof window === 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1'
    : '/api/v1', // 浏览器端使用相对路径，通过 Next.js rewrite 代理
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// 请求拦截器 - 添加 token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器 - 统一错误处理
apiClient.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<ApiResponse<unknown>>) => {
    if (error.response?.status === 401) {
      // Token 过期或无效，清除本地存储并重定向到登录页
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }

    const errorMessage = error.response?.data?.error?.message || '网络请求失败'
    return Promise.reject(new Error(errorMessage))
  }
)

// 认证 API
export const authApi = {
  login: (data: LoginRequest): Promise<ApiResponse<LoginResponse>> =>
    apiClient.post('/auth/login', data),

  logout: (): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post('/auth/logout'),

  me: (): Promise<
    ApiResponse<{
      id: string
      username: string
      name: string
      email: string
      role: string
      status: string
      createdAt: string
    }>
  > => apiClient.get('/auth/me'),
}

// 用户 API
export const userApi = createCrudApi<User, CreateUserRequest, UpdateUserRequest>('/users')

// 法规 API - 注意：getList 返回的是 Regulation[] 而非 ListResponse<Regulation>
export const regulationApi = createCrudApi<
  Regulation,
  CreateRegulationRequest,
  CreateRegulationRequest,
  Regulation[]
>('/regulations', {
  getList: (): Promise<ApiResponse<Regulation[]>> =>
    apiClient.get('/regulations'),
})

// 客户 API
export const customerApi = createCrudApi<Customer, CreateCustomerRequest, UpdateCustomerRequest>('/customers')

// 原材料 API
export const materialApi = createCrudApi<Material, CreateMaterialRequest, UpdateMaterialRequest>('/materials')

// 型号 API
const modelCrud = createCrudApi<Model, CreateModelRequest, UpdateModelRequest>('/models')
export const modelApi = {
  ...modelCrud,
  getPackagingConfigs: (id: string): Promise<ApiResponse<unknown[]>> =>
    apiClient.get(`/models/${id}/packaging-configs`),
  getBom: (id: string): Promise<ApiResponse<unknown[]>> =>
    apiClient.get(`/models/${id}/bom`),
}

// BOM API - 非标准 CRUD，保留自定义实现
export const bomApi = {
  getByModel: (modelId: string): Promise<ApiResponse<unknown[]>> =>
    apiClient.get('/bom', { params: { modelId } }),
  create: (data: CreateBomMaterialRequest): Promise<ApiResponse<unknown>> =>
    apiClient.post('/bom', data),
  update: (id: string, data: UpdateBomMaterialRequest): Promise<ApiResponse<unknown>> =>
    apiClient.put(`/bom/${id}`, data),
  delete: (id: string): Promise<ApiResponse<void>> =>
    apiClient.delete(`/bom/${id}`),
}

// 包装配置 API - 注意：getList 返回的是 unknown[] 而非 ListResponse
const packagingCrud = createCrudApi<unknown, CreatePackagingConfigRequest, UpdatePackagingConfigRequest, unknown[]>('/packaging-configs', {
  getList: (params?: object): Promise<ApiResponse<unknown[]>> =>
    apiClient.get('/packaging-configs', { params }),
})
export const packagingApi = {
  ...packagingCrud,
  // 工序配置
  getProcesses: (packagingConfigId: string): Promise<ApiResponse<unknown[]>> =>
    apiClient.get(`/packaging-configs/${packagingConfigId}/processes`),
  createProcess: (packagingConfigId: string, data: CreateProcessConfigRequest): Promise<ApiResponse<unknown>> =>
    apiClient.post(`/packaging-configs/${packagingConfigId}/processes`, data),
  updateProcess: (processId: string, data: UpdateProcessConfigRequest): Promise<ApiResponse<unknown>> =>
    apiClient.put(`/packaging-configs/processes/${processId}`, data),
  deleteProcess: (processId: string): Promise<ApiResponse<void>> =>
    apiClient.delete(`/packaging-configs/processes/${processId}`),
  // 包材配置
  getMaterials: (packagingConfigId: string): Promise<ApiResponse<unknown[]>> =>
    apiClient.get(`/packaging-configs/${packagingConfigId}/materials`),
  createMaterial: (packagingConfigId: string, data: CreatePackagingMaterialRequest): Promise<ApiResponse<unknown>> =>
    apiClient.post(`/packaging-configs/${packagingConfigId}/materials`, data),
  updateMaterial: (materialId: string, data: UpdatePackagingMaterialRequest): Promise<ApiResponse<unknown>> =>
    apiClient.put(`/packaging-configs/materials/${materialId}`, data),
  deleteMaterial: (materialId: string): Promise<ApiResponse<void>> =>
    apiClient.delete(`/packaging-configs/materials/${materialId}`),
}

// 报价单 API
const quotationCrud = createCrudApi<Quotation, CreateQuotationRequest, UpdateQuotationRequest>('/quotations')
export const quotationApi = {
  ...quotationCrud,
  submit: (id: string): Promise<ApiResponse<Quotation>> =>
    apiClient.post(`/quotations/${id}/submit`),
  approve: (id: string, note?: string): Promise<ApiResponse<Quotation>> =>
    apiClient.post(`/quotations/${id}/approve`, { note }),
  reject: (id: string, note?: string): Promise<ApiResponse<Quotation>> =>
    apiClient.post(`/quotations/${id}/reject`, { note }),
  calculate: (data: CalculateCostRequest): Promise<ApiResponse<CalculateCostResponse>> =>
    apiClient.post('/quotations/calculate', data),
}

// 标准成本 API - 注意：getList 返回的是 unknown[] 而非 ListResponse
const standardCostCrud = createCrudApi<unknown, CreateStandardCostRequest, unknown, unknown[]>('/standard-costs', {
  getList: (params?: object): Promise<ApiResponse<unknown[]>> =>
    apiClient.get('/standard-costs', { params }),
})
export const standardCostApi = {
  ...standardCostCrud,
  setCurrent: (id: string): Promise<ApiResponse<unknown>> =>
    apiClient.put(`/standard-costs/${id}/set-current`),
}

// 通知 API - 注意：getList 返回的是 unknown[] 而非 ListResponse
const notificationCrud = createCrudApi<unknown, unknown, unknown, unknown[]>('/notifications', {
  getList: (params?: object): Promise<ApiResponse<unknown[]>> =>
    apiClient.get('/notifications', { params }),
})
export const notificationApi = {
  ...notificationCrud,
  getUnreadCount: (): Promise<ApiResponse<{ count: number }>> =>
    apiClient.get('/notifications/unread-count'),
  process: (id: string): Promise<ApiResponse<unknown>> =>
    apiClient.put(`/notifications/${id}/process`),
}

// 仪表盘 API
export const dashboardApi = {
  getStats: (): Promise<ApiResponse<DashboardStatsDto>> =>
    apiClient.get('/dashboard/stats'),
}

// CRUD API 工厂函数 - 简化重复的 API 定义模式
// 支持自定义列表返回类型（如 Regulation[] 或 ListResponse<T>）
interface CrudApiOptions<T, CreateReq, UpdateReq, ListType = ListResponse<T>> {
  getList?: (params?: object) => Promise<ApiResponse<ListType>>
  getById?: (id: string) => Promise<ApiResponse<T>>
  create?: (data: CreateReq) => Promise<ApiResponse<T>>
  update?: (id: string, data: UpdateReq) => Promise<ApiResponse<T>>
  delete?: (id: string) => Promise<ApiResponse<void>>
}

function createCrudApi<T, CreateReq = unknown, UpdateReq = unknown, ListType = ListResponse<T>>(
  basePath: string,
  options?: CrudApiOptions<T, CreateReq, UpdateReq, ListType>
) {
  return {
    getList: options?.getList ??
      ((params?: object): Promise<ApiResponse<ListType>> =>
        apiClient.get(basePath, { params })),
    getById: options?.getById ??
      ((id: string): Promise<ApiResponse<T>> =>
        apiClient.get(`${basePath}/${id}`)),
    create: options?.create ??
      ((data: CreateReq): Promise<ApiResponse<T>> =>
        apiClient.post(basePath, data)),
    update: options?.update ??
      ((id: string, data: UpdateReq): Promise<ApiResponse<T>> =>
        apiClient.put(`${basePath}/${id}`, data)),
    delete: options?.delete ??
      ((id: string): Promise<ApiResponse<void>> =>
        apiClient.delete(`${basePath}/${id}`)),
  }
}

export default apiClient
