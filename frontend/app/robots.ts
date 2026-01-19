import {MetadataRoute} from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/checkout/cancel', '/api/draft-mode/'],
      },
    ],
    sitemap: 'https://superhotfab.com/sitemap.xml',
  }
}
