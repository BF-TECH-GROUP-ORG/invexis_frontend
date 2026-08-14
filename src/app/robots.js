export default function robots() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://invexix.com';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/api/',
                '/_next/',
                '/*/inventory/',
                '/*/account/',
                '/inventory/',
                '/account/',
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}

