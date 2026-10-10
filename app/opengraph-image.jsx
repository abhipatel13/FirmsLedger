import { ImageResponse } from 'next/og';

export const alt = 'FirmsLedger, the US manufacturer directory';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 80, background: '#1A2E4A', color: '#ffffff' }}>
        <div style={{ display: 'flex', fontSize: 88, fontWeight: 700, letterSpacing: -2 }}>
          Firms<span style={{ color: '#F5A623' }}>Ledger</span>
        </div>
        <div style={{ marginTop: 24, fontSize: 40, color: '#cbd5e1' }}>US manufacturers by industry and state</div>
        <div style={{ marginTop: 48, width: 120, height: 8, background: '#F5A623' }} />
      </div>
    ),
    size,
  );
}
