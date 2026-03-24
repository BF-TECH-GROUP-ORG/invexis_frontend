export default function manifest() {
    return {
        name: 'Invexis',
        short_name: 'Invexis',
        description: 'Inventory and business management dashboard',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ea580c', // Orange-600 from sidebar
        icons: [
            {
                src: '/images/Invexix Logo-Light Mode.png',
                sizes: '64x64',
                type: 'image/png',
            },
        ],
    };
}
