import type { RequestFn } from './jobs.js'
import type { UsageResponse } from '../types.js'

export function usageResource(request: RequestFn): Promise<UsageResponse> {
  return request<UsageResponse>('/usage', {
    method: 'GET',
    expectStatus: 200,
  })
}
