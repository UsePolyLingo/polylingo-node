# polylingo (Node.js)

TypeScript / Node.js client for the [PolyLingo](https://usepolylingo.com) translation API.

Requires Node.js 18+.

## Install

```bash
npm install polylingo
```

## Quick start

```typescript
import PolyLingo from 'polylingo'

const client = new PolyLingo({
  apiKey: process.env.POLYLINGO_API_KEY!,
  // baseURL: 'https://api.usepolylingo.com/v1',
  // timeout: 120_000,
})

const r = await client.translate({
  content: '# Hello',
  targets: ['es', 'fr'],
  format: 'markdown',
})
console.log(r.translations.es)
```

## API

| Method | Notes |
|--------|--------|
| `client.health()` | `GET /health` |
| `client.languages()` | `GET /languages` |
| `client.translate({ ... })` | `POST /translate` |
| `client.batch({ ... })` | `POST /translate/batch` |
| `client.usage()` | `GET /usage` |
| `client.jobs.create(...)` | `POST /jobs` (202) |
| `client.jobs.get(jobId)` | `GET /jobs/:id` |
| `client.jobs.translate({ ... })` | Submit job, poll until done (`pollInterval`, `timeout`, `onProgress`) |

## Errors

`PolyLingoError` is the base type (`status`, `error`, `message`). Subclasses: `AuthError` (401), `RateLimitError` (429, optional `retryAfter`), `JobFailedError` (failed job, includes `jobId`).

## Documentation

[Node SDK on usepolylingo.com](https://usepolylingo.com/en/docs/sdk/node)

## Repository

[github.com/UsePolyLingo/polylingo-node](https://github.com/UsePolyLingo/polylingo-node)

## Publishing from GitHub Actions

The workflow expects a repository secret **`NPM_TOKEN`**. If `npm publish` fails with **404** on `PUT …/polylingo`, npm is almost always rejecting the token: the account returned by `npm whoami` in the job logs must be a **maintainer** of the [`polylingo`](https://www.npmjs.com/package/polylingo/access) package, and the token must allow **publish** (use an **Automation** classic token, or a **granular** token with **Read and write** for that package).

## License

MIT
