import { JobFailedError } from '../errors.js'
import type {
  CreateJobParams,
  Job,
  JobsTranslateParams,
  TranslateResult,
} from '../types.js'

export type RequestFn = <T>(
  path: string,
  init: RequestInit & { expectStatus?: number | number[] },
) => Promise<T>

const DEFAULT_POLL_MS = 5_000
const DEFAULT_JOB_TIMEOUT_MS = 20 * 60 * 1_000

export class JobsResource {
  constructor(private readonly request: RequestFn) {}

  async create(params: CreateJobParams): Promise<Job> {
    return this.request<Job>('/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: params.content,
        targets: params.targets,
        ...(params.format != null && { format: params.format }),
        ...(params.source != null && { source: params.source }),
        ...(params.model != null && { model: params.model }),
      }),
      expectStatus: 202,
    })
  }

  async get(jobId: string): Promise<Job> {
    return this.request<Job>(`/jobs/${encodeURIComponent(jobId)}`, {
      method: 'GET',
      expectStatus: 200,
    })
  }

  /**
   * Submit a translation job and poll until it completes or fails.
   */
  async translate(params: JobsTranslateParams): Promise<TranslateResult> {
    const job = await this.create({
      content: params.content,
      targets: params.targets,
      format: params.format,
      source: params.source,
      model: params.model,
    })
    const pollInterval = params.pollInterval ?? DEFAULT_POLL_MS
    const deadline = Date.now() + (params.timeout ?? DEFAULT_JOB_TIMEOUT_MS)

    while (Date.now() < deadline) {
      const status = await this.get(job.job_id)
      if ((status.status === 'pending' || status.status === 'processing') && params.onProgress) {
        params.onProgress(status.queue_position)
      }
      if (status.status === 'completed') {
        if (!status.translations || !status.usage) {
          throw new JobFailedError(
            job.job_id,
            500,
            'invalid_response',
            'Job completed but translations or usage was missing',
          )
        }
        return { translations: status.translations, usage: status.usage }
      }
      if (status.status === 'failed') {
        throw new JobFailedError(
          job.job_id,
          200,
          status.error ?? 'job_failed',
          status.message ?? status.error ?? 'Translation job failed',
        )
      }
      await sleep(pollInterval)
    }

    throw new JobFailedError(
      job.job_id,
      408,
      'timeout',
      'Job polling exceeded the configured timeout',
    )
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
