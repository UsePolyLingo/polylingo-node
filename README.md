# polylingo (Node.js)

Official TypeScript / Node.js SDK for the [PolyLingo](https://usepolylingo.com) translation API.

**Requirements:** Node.js 18+

## Install

```bash
npm install polylingo
```

## Quick start

```typescript
import PolyLingo from 'polylingo'

const client = new PolyLingo({
  apiKey: process.env.POLYLINGO_API_KEY!,
  // baseURL: 'https://api.polylingo.io/v1', // optional
  // timeout: 120_000, // optional, ms
})

const r = await client.translate({
  content: '# Hello',
  targets: ['es', 'fr'],
  format: 'markdown',
})
console.log(r.translations.es)
```

## API

- `client.health()` — `GET /health`
- `client.languages()` — `GET /languages`
- `client.translate({ content, targets, format?, source?, model? })`
- `client.batch({ items, targets, source?, model? })`
- `client.usage()` — account usage
- `client.jobs.create(...)` — async job (202)
- `client.jobs.get(jobId)` — poll status
- `client.jobs.translate({ ...create params, pollInterval?, timeout?, onProgress? })` — submit and poll until done

## Errors

- `PolyLingoError` — base class (`status`, `error`, `message`)
- `AuthError` — 401
- `RateLimitError` — 429 (`retryAfter` seconds when provided)
- `JobFailedError` — job finished with `failed` (`jobId`)

## Documentation

Full reference: [PolyLingo docs — Node SDK](https://usepolylingo.com/en/docs/sdk/node) (when deployed).

## Repository

Source and issues: [UsePolyLingo/polylingo-node](https://github.com/UsePolyLingo/polylingo-node)

## License

MIT
