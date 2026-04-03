import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { PolyLingo, JobFailedError } from '../src/index.js'

describe('jobs', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('create returns 202 body', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ job_id: 'j1', status: 'pending', created_at: 't' }), {
        status: 202,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const client = new PolyLingo({ apiKey: 'k', baseURL: 'https://x/v1' })
    const job = await client.jobs.create({ content: 'a', targets: ['de'] })
    expect(job.job_id).toBe('j1')
    expect(job.status).toBe('pending')
  })

  it('translate polls until completed', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ job_id: 'j1', status: 'pending', created_at: 't' }), {
          status: 202,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            job_id: 'j1',
            status: 'completed',
            translations: { de: 'Hi' },
            usage: { total_tokens: 5, input_tokens: 2, output_tokens: 3 },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )

    const client = new PolyLingo({ apiKey: 'k', baseURL: 'https://x/v1', timeout: 60_000 })
    const p = client.jobs.translate({
      content: 'Hello',
      targets: ['de'],
      pollInterval: 100,
      timeout: 10_000,
    })
    await vi.advanceTimersByTimeAsync(150)
    const done = await p
    expect(done.translations.de).toBe('Hi')
  })

  it('translate throws JobFailedError when job failed', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ job_id: 'j1', status: 'pending' }), {
          status: 202,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ job_id: 'j1', status: 'failed', error: 'boom' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )

    const client = new PolyLingo({ apiKey: 'k', baseURL: 'https://x/v1', timeout: 60_000 })
    await expect(
      client.jobs.translate({ content: 'x', targets: ['de'], pollInterval: 10, timeout: 5000 }),
    ).rejects.toBeInstanceOf(JobFailedError)
  })
})
