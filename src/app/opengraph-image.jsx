import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Invexis - Smart Business Management';
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 128,
                    background: 'linear-gradient(to bottom right, #ea580c, #c2410c)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontFamily: 'sans-serif',
                }}
            >
                <div style={{ fontWeight: 'bold' }}>Invexis</div>
                <div style={{ fontSize: 48, marginTop: 24, opacity: 0.9 }}>
                    Smart Business Management
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
