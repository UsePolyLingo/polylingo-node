import { AuthError, PolyLingoError, RateLimitError } from './errors.js'
import { batchResource } from './resources/batch.js'
import { healthResource } from './resources/health.js'
import { JobsResource } from './resources/jobs.js'
import { languagesResource } from './resources/languages.js'
import { translateResource } from './resources/translate.js'
import { usageResource } from './resources/usage.js'
import type {
  BatchParams,
  BatchResult,
  HealthResponse,
  LanguagesResponse,
  PolyLingoOptions,
  TranslateParams,
  TranslateResult,
  UsageResponse,
} from './types.js'

const DEFAULT_BASE_URL = 'https://api.polylingo.io/v1'

export class PolyLingo {
  private readonly apiKey: string
  private readonly baseURL: string
  private readonly timeout: number
  readonly jobs: JobsResource

  constructor(options: PolyLingoOptions) {
    if (!options?.apiKey || typeof options.apiKey !== 'string') {
      throw new TypeError('PolyLingo: apiKey is required')
    }
    this.apiKey = options.apiKey
    this.baseURL = (options.baseURL ?? DEFAULT_BASE_URL).replace(/\/$/, '')
    this.timeout = options.timeout ?? 120_000
    this.jobs = new JobsResource((path, init) => this.request(path, init))
  }

  async health(): Promise<HealthResponse> {
    return healthResource((path, init) => this.request(path, init))
  }

  async languages(): Promise<LanguagesResponse> {
    return languagesResource((path, init) => this.request(path, init))
  }

  async translate(params: TranslateParams): Promise<TranslateResult> {
    return translateResource((path, init) => this.request(path, init), params)
  }

  async batch(params: BatchParams): Promise<BatchResult> {
    return batchResource((path, init) => this.request(path, init), params)
  }

  async usage(): Promise<UsageResponse> {
    return usageResource((path, init) => this.request(path, init))
  }

  private async request<T>(
    path: string,
    init: RequestInit & { expectStatus?: number | number[] },
  ): Promise<T> {
    const url = `${this.baseURL}${path.startsWith('/') ? path : `/${path}`}`
    const headers = new Headers(init.headers)
    headers.set('Authorization', `Bearer ${this.apiKey}`)
    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json')
    }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeout)

    let res: Response
    try {
      res = await fetch(url, {
        ...init,
        headers,
        signal: controller.signal,
      })
    } catch (e) {
      clearTimeout(timer)
      if (e instanceof Error && e.name === 'AbortError') {
        throw new PolyLingoError(408, 'timeout', `Request timed out after ${this.timeout}ms`)
      }
      throw e
    } finally {
      clearTimeout(timer)
    }

    const expect = init.expectStatus
    const ok =
      expect == null
        ? res.ok
        : Array.isArray(expect)
          ? expect.includes(res.status)
          : res.status === expect

    const text = await res.text()
    let body: unknown
    try {
      body = text ? JSON.parse(text) : {}
    } catch {
      body = { message: text }
    }

    if (!ok) {
      throw errorFromResponse(res.status, body, res.headers)
    }

    return body as T
  }
}

function errorFromResponse(status: number, body: unknown, headers?: Headers): PolyLingoError {
  const obj = body && typeof body === 'object' ? (body as Record<string, unknown>) : {}
  const code = typeof obj.error === 'string' ? obj.error : 'unknown_error'
  const message =
    typeof obj.message === 'string' ? obj.message : `Request failed with status ${status}`

  if (status === 401) {
    return new AuthError(status, code, message)
  }
  if (status === 429) {
    const retryRaw = obj.retry_after
    let retryAfter =
      typeof retryRaw === 'number'
        ? retryRaw
        : typeof retryRaw === 'string'
          ? Number.parseInt(retryRaw, 10)
          : undefined
    if (!Number.isFinite(retryAfter) && headers) {
      const h = headers.get('retry-after')
      if (h) retryAfter = Number.parseInt(h, 10)
    }
    return new RateLimitError(
      status,
      code,
      message,
      Number.isFinite(retryAfter) ? retryAfter : undefined,
    )
  }
  return new PolyLingoError(status, code, message)
}
