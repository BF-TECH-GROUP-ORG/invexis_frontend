import { NextResponse } from 'next/server';

/**
 * API Route: /api/workers/company/[companyId]
 * 
 * This proxy route bypasses CORS issues by making the request server-side.
 * The frontend can call this Next.js API route instead of directly calling
 * the ngrok backend, avoiding CORS restrictions.
 */
export async function GET(request, { params }) {
    try {
        const { companyId } = params;

        if (!companyId) {
            return NextResponse.json(
                { error: 'Company ID is required' },
                { status: 400 }
            );
        }

        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://granitic-jule-haunting.ngrok-free.dev/api';
        const url = `${backendUrl}/auth/company/${companyId}/workers`;

        console.log('🔄 Proxy: Fetching workers from:', url);

        const response = await fetch(url, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
                'User-Agent': 'Mozilla/5.0',
            },
            // Important: Next.js API routes run server-side, so no CORS issues
            cache: 'no-store',
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Backend error:', response.status, errorText);
            return NextResponse.json(
                { error: 'Failed to fetch workers from backend', details: errorText },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log(`✅ Proxy: Successfully fetched ${Array.isArray(data) ? data.length : 0} workers`);

        return NextResponse.json(data);
    } catch (error) {
        console.error('❌ Proxy error:', error);
        return NextResponse.json(
            { error: 'Internal server error', message: error.message },
            { status: 500 }
        );
    }
}
