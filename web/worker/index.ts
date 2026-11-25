import { Hono } from 'hono'
import { secureHeaders } from 'hono/secure-headers'

type Env = { Bindings: { API: Fetcher; ASSETS: Fetcher } }

const app = new Hono<Env>()

app.use(
  '*',
  secureHeaders({
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      mediaSrc: ["'self'", 'https:'],
      frameSrc: ['https://www.youtube-nocookie.com', 'https://player.vimeo.com'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
    },
    strictTransportSecurity: 'max-age=63072000; includeSubDomains',
    referrerPolicy: 'strict-origin-when-cross-origin',
    xFrameOptions: 'DENY',
    permissionsPolicy: { camera: [], microphone: [], geolocation: [], payment: [] },
  }),
)

app.all('/api/*', async (c) => {
  const req = c.req.raw
  const headers = new Headers(req.headers)
  for (const h of [...headers.keys()]) if (h.startsWith('x-lm-')) headers.delete(h)
  headers.delete('x-forwarded-for')
  const res = await c.env.API.fetch(new Request(req, { headers }))
  if (res.ok && req.method === 'GET' && new URL(req.url).pathname.endsWith('/export.json')) {
    const data = await res.json() as Record<string, unknown>
    const images = new Map<string, Promise<string>>()
    const embed = async (value: unknown): Promise<unknown> => {
      if (Array.isArray(value)) return Promise.all(value.map(embed))
      if (!value || typeof value !== 'object') return value
      return Object.fromEntries(await Promise.all(Object.entries(value).map(async ([key, v]) => {
        if ((key === 'imageUrl' || key === 'coverImage') && typeof v === 'string' && v.startsWith('/') && !v.startsWith('//')) {
          if (!images.has(v)) images.set(v, (async () => {
            const asset = await c.env.ASSETS.fetch(new Request(new URL(v, req.url)))
            const type = asset.headers.get('Content-Type')?.split(';')[0]
            if (!asset.ok || !type || !/^image\/(svg\+xml|png|jpeg|gif|webp|avif)$/.test(type)) return new URL(v, req.url).href
            const bytes = new Uint8Array(await asset.arrayBuffer())
            if (bytes.length > 250000) return new URL(v, req.url).href
            let binary = ''
            for (const byte of bytes) binary += String.fromCharCode(byte)
            return `data:${type};base64,${btoa(binary)}`
          })())
          return [key, await images.get(v)]
        }
        return [key, await embed(v)]
      })))
    }
    const exportHeaders = new Headers(res.headers)
    exportHeaders.delete('Content-Length')
    exportHeaders.delete('ETag')
    return new Response(JSON.stringify(await embed(data), null, 2), { status: res.status, headers: exportHeaders })
  }
  return new Response(res.body, res)
})

app.all('*', async (c) => {
  const res = await c.env.ASSETS.fetch(c.req.raw)
  return new Response(res.body, res)
})

export default app
