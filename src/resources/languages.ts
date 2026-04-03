import type { RequestFn } from './jobs.js'
import type { LanguagesResponse } from '../types.js'

export function languagesResource(request: RequestFn): Promise<LanguagesResponse> {
  return request<LanguagesResponse>('/languages', {
    method: 'GET',
    expectStatus: 200,
  })
}
