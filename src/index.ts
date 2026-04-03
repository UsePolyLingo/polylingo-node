import { PolyLingo } from './client.js'

export { PolyLingo }
export default PolyLingo
export { PolyLingoError, AuthError, RateLimitError, JobFailedError } from './errors.js'
export type {
  PolyLingoOptions,
  ContentFormat,
  ModelTier,
  TranslateParams,
  TranslateResult,
  BatchParams,
  BatchItem,
  BatchItemResult,
  BatchResult,
  CreateJobParams,
  JobsTranslateParams,
  Job,
  JobStatus,
  HealthResponse,
  LanguageEntry,
  LanguagesResponse,
  UsageResponse,
  TranslateUsage,
  BatchUsage,
} from './types.js'
