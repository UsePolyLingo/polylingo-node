import type { RequestFn } from './jobs.js'
import type { TranslateParams, TranslateResult } from '../types.js'

export function translateResource(request: RequestFn, params: TranslateParams): Promise<TranslateResult> {
  return request<TranslateResult>('/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: params.content,
      targets: params.targets,
      ...(params.format != null && { format: params.format }),
      ...(params.source != null && { source: params.source }),
      ...(params.model != null && { model: params.model }),
    }),
    expectStatus: 200,
  })
}
