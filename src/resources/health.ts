import type { RequestFn } from './jobs.js'
import type { HealthResponse } from '../types.js'

export function healthResource(request: RequestFn): Promise<HealthResponse> {
  return request<HealthResponse>('/health', {
    method: 'GET',
    expectStatus: 200,
  })
}
