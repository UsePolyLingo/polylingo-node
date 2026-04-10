export type ContentFormat = 'plain' | 'markdown' | 'json' | 'html'
export type ModelTier = 'standard' | 'advanced'

export interface PolyLingoOptions {
  /** PolyLingo API key (required). */
  apiKey: string
  /** API base URL, e.g. `https://api.usepolylingo.com/v1`. */
  baseURL?: string
  /** Request timeout in milliseconds. */
  timeout?: number
}

/** Token usage as returned by translate and async job results. */
export interface TranslateUsage {
  total_tokens: number
  input_tokens: number
  output_tokens: number
  model?: string
  detected_format?: string
  detection_confidence?: number
}

export interface TranslateResult {
  translations: Record<string, string>
  usage: TranslateUsage
}

export interface TranslateParams {
  content: string
  targets: string[]
  format?: ContentFormat
  source?: string
  model?: ModelTier
}

export interface BatchItem {
  id: string
  content: string
  format?: ContentFormat
  source?: string
}

export interface BatchItemResult {
  id: string
  translations: Record<string, string>
}

export interface BatchUsage {
  total_tokens: number
  input_tokens: number
  output_tokens: number
  model?: string
}

export interface BatchResult {
  results: BatchItemResult[]
  usage: BatchUsage
}

export interface BatchParams {
  items: BatchItem[]
  targets: string[]
  source?: string
  model?: ModelTier
}

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed'

/** Polling response from `GET /jobs/:id`. Completed jobs include `translations` and `usage` at the top level. */
export interface Job {
  job_id: string
  status: JobStatus
  queue_position?: number
  translations?: Record<string, string>
  usage?: TranslateUsage
  error?: string
  message?: string
  created_at?: string
  updated_at?: string
  completed_at?: string | null
}

export interface CreateJobParams {
  content: string
  targets: string[]
  format?: ContentFormat
  source?: string
  model?: ModelTier
}

export interface JobsTranslateParams extends CreateJobParams {
  /** Polling interval in ms (default 5000). */
  pollInterval?: number
  /** Total time budget in ms (default 20 minutes). */
  timeout?: number
  /** Called with queue position when status is `queued`. */
  onProgress?: (queuePosition: number | undefined) => void
}

export interface HealthResponse {
  status: string
  timestamp: string
}

export interface LanguageEntry {
  code: string
  name: string
}

export interface LanguagesResponse {
  languages: LanguageEntry[]
}

export interface UsageResponse {
  usage: {
    period_start: string
    period_end: string
    translations_used: number
    translations_limit: number | null
    tokens_used: number
    tokens_limit: number | null
  }
}
