import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://skilledresume.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/questions', '/questions/*'],
        disallow: [
          '/analysis/',
          '/dashboard',
          '/dashboard/*',
          '/verify-email',
          '/verification-pending',
          '/forgot-password',
          '/reset-password',
          '/login',
          '/register',
          '/api/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
