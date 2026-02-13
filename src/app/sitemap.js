import { routing } from '@/i18n/routing';

export default function sitemap() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://invexix.com';

    // Core routes from SideBar.jsx
    const routes = [
        '', // Landing page
        '/auth/login',
        '/auth/register',
        '/inventory/dashboard',
        '/inventory/notifications',
        '/inventory/reports',
        '/inventory/workers/list',
        '/inventory/companies',
        '/inventory/Overview',
        '/inventory/categories',
        '/inventory/products',
        '/inventory/transfer',
        '/inventory/stock',
        '/inventory/sales/history',
        '/inventory/sales/sellProduct/sale',
        '/inventory/debts',
        '/inventory/billing/invoices',
        '/inventory/billing/payments',
        '/inventory/billing/transactions',
        '/inventory/documents',
        '/inventory/logs',
    ];

    const sitemapEntries = [];

    routes.forEach((route) => {
        routing.locales.forEach((locale) => {
            sitemapEntries.push({
                url: `${baseUrl}/${locale}${route}`,
                lastModified: new Date(),
                changeFrequency: route === '' ? 'yearly' : 'daily',
                priority: route === '' ? 1 : 0.8,
            });
        });
    });

    return sitemapEntries;
}
