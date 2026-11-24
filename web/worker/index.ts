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
  const cf = (req as Request & { cf?: IncomingRequestCfProperties }).cf
  if (cf?.country) headers.set('x-lm-country', String(cf.country))
  if (cf?.region) headers.set('x-lm-region', encodeURIComponent(String(cf.region)))
  if (cf?.city) headers.set('x-lm-city', encodeURIComponent(String(cf.city)))
  if (cf?.latitude && cf?.longitude) {
    headers.set('x-lm-lat', String(cf.latitude))
    headers.set('x-lm-lon', String(cf.longitude))
  }
  const res = await c.env.API.fetch(new Request(req, { headers }))
  return new Response(res.body, res)
})

app.all('*', async (c) => {
  const res = await c.env.ASSETS.fetch(c.req.raw)
  return new Response(res.body, res)
})

export default app
