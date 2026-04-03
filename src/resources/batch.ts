import type { RequestFn } from './jobs.js'
import type { BatchParams, BatchResult } from '../types.js'

export function batchResource(request: RequestFn, params: BatchParams): Promise<BatchResult> {
  return request<BatchResult>('/translate/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: params.items,
      targets: params.targets,
      ...(params.source != null && { source: params.source }),
      ...(params.model != null && { model: params.model }),
    }),
    expectStatus: 200,
  })
}
