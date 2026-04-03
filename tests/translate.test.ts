import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { PolyLingo } from '../src/index.js'

describe('translate', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('POSTs /translate with body and returns JSON', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          translations: { es: 'Hola' },
          usage: { total_tokens: 10, input_tokens: 4, output_tokens: 6, model: 'standard' },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    const client = new PolyLingo({ apiKey: 'test-key', baseURL: 'https://api.example.com/v1' })
    const r = await client.translate({ content: 'Hello', targets: ['es'], format: 'plain' })

    expect(fetch).toHaveBeenCalledTimes(1)
    const [url, init] = vi.mocked(fetch).mock.calls[0]!
    expect(url).toBe('https://api.example.com/v1/translate')
    expect(init?.method).toBe('POST')
    const headers = new Headers(init?.headers as HeadersInit)
    expect(headers.get('Authorization')).toBe('Bearer test-key')
    const body = JSON.parse((init?.body as string) ?? '{}')
    expect(body).toMatchObject({ content: 'Hello', targets: ['es'], format: 'plain' })
    expect(r.translations.es).toBe('Hola')
    expect(r.usage.total_tokens).toBe(10)
  })
})
