import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Helper to handle proxy requests
 */
async function handleProxy(req, { params }) {
    const { path } = params;
    const pathString = path ? path.join('/') : '';
    const url = new URL(req.url);
    const searchParams = url.searchParams.toString();

    // Construct the target URL
    const targetUrl = `${API_URL}/${pathString}${searchParams ? `?${searchParams}` : ''}`;

    if (process.env.NODE_ENV === 'development') {
        console.log(`[Proxy] ${req.method} ${req.url} -> ${targetUrl}`);
    }

    // Clone headers and remove ones that might conflict
    const headers = new Headers(req.headers);
    headers.delete('host');
    headers.delete('connection');

    // SERVER-SIDE TOKEN INJECTION
    // Get the session server-side to extract the token
    const session = await getServerSession(authOptions);
    if (session?.accessToken) {
        headers.set('Authorization', `Bearer ${session.accessToken}`);
    }

    // Ensure ngrok skip header is present if targeting ngrok
    if (targetUrl.includes('ngrok')) {
        headers.set('ngrok-skip-browser-warning', 'true');
    }

    try {
        const options = {
            method: req.method,
            headers,
            // For GET/HEAD, body must be null
            body: ['GET', 'HEAD'].includes(req.method) ? null : await req.blob(),
            cache: 'no-store',
        };

        const response = await fetch(targetUrl, options);

        // Get response body as blob or arrayBuffer
        const data = await response.blob();

        // Create response headers, excluding problematic ones
        const resHeaders = new Headers(response.headers);
        resHeaders.delete('content-encoding');
        resHeaders.delete('content-length');
        resHeaders.delete('transfer-encoding');

        return new NextResponse(data, {
            status: response.status,
            headers: resHeaders,
        });
    } catch (error) {
        console.error('[Proxy Error]', error);
        return NextResponse.json(
            { message: 'Proxy request failed', error: error.message },
            { status: 502 }
        );
    }
}

export async function GET(req, context) { return handleProxy(req, context); }
export async function POST(req, context) { return handleProxy(req, context); }
export async function PUT(req, context) { return handleProxy(req, context); }
export async function PATCH(req, context) { return handleProxy(req, context); }
export async function DELETE(req, context) { return handleProxy(req, context); }
