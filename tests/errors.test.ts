import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { PolyLingo, AuthError, RateLimitError, PolyLingoError } from '../src/index.js'

describe('errors', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: 'invalid_api_key', message: 'Bad key' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('throws AuthError on 401', async () => {
    const client = new PolyLingo({ apiKey: 'bad' })
    await expect(client.translate({ content: 'hi', targets: ['es'] })).rejects.toBeInstanceOf(AuthError)
  })

  it('throws RateLimitError on 429 with retry_after', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'rate_limited', message: 'Slow down' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Retry-After': '42' },
      }),
    )
    const client = new PolyLingo({ apiKey: 'k' })
    try {
      await client.translate({ content: 'hi', targets: ['es'] })
      expect.fail('expected throw')
    } catch (e) {
      expect(e).toBeInstanceOf(RateLimitError)
      expect((e as RateLimitError).retryAfter).toBe(42)
    }
  })

  it('throws PolyLingoError on other errors', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'invalid_request', message: 'Nope' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const client = new PolyLingo({ apiKey: 'k' })
    await expect(client.translate({ content: 'hi', targets: ['es'] })).rejects.toBeInstanceOf(PolyLingoError)
  })
})
