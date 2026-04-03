/** Base error for all PolyLingo API failures. */
export class PolyLingoError extends Error {
  readonly status: number
  readonly error: string

  constructor(status: number, error: string, message: string) {
    super(message)
    this.name = 'PolyLingoError'
    this.status = status
    this.error = error
  }
}

/** Invalid or missing API key (HTTP 401). */
export class AuthError extends PolyLingoError {
  constructor(status: number, error: string, message: string) {
    super(status, error, message)
    this.name = 'AuthError'
  }
}

/** Rate limited (HTTP 429). */
export class RateLimitError extends PolyLingoError {
  readonly retryAfter?: number

  constructor(status: number, error: string, message: string, retryAfter?: number) {
    super(status, error, message)
    this.name = 'RateLimitError'
    this.retryAfter = retryAfter
  }
}

/** Async job finished with status `failed`. */
export class JobFailedError extends PolyLingoError {
  readonly jobId: string

  constructor(jobId: string, status: number, error: string, message: string) {
    super(status, error, message)
    this.name = 'JobFailedError'
    this.jobId = jobId
  }
}
