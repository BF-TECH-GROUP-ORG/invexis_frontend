import { routing } from '@/i18n/routing';

export default function sitemap() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://invexix.com';

    // Public indexable marketing & authentication routes ONLY
    const publicRoutes = [
        '', // Main landing page (includes #about, #features, #pricing, #how, #faq, #contact)
        '/welcome',
        '/auth/login',
        '/auth/signup',
        '/auth/otp-login/request',
        '/auth/reset-password/request',
        '/checkout/basic',
        '/checkout/mid',
        '/checkout/pro',
    ];

    const sitemapEntries = [];

    publicRoutes.forEach((route) => {
        routing.locales.forEach((locale) => {
            sitemapEntries.push({
                url: `${baseUrl}/${locale}${route}`,
                lastModified: new Date(),
                changeFrequency: route === '' ? 'weekly' : 'monthly',
                priority: route === '' ? 1.0 : 0.8,
            });
        });
    });

    return sitemapEntries;
}


