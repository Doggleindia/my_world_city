const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/admin', '/dashboard'] }],
    sitemap: `${BASE}/sitemap.xml`,
  }
}
