import { ImageResponse } from 'next/og';

// Sitewide social preview. Every page declared twitter:card
// summary_large_image but no image existed, so shares rendered as bare links.
// File-based metadata applies to every route below app/ unless a segment
// ships its own opengraph-image.
export const alt = 'FirmsLedger: the US manufacturer directory';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px 96px',
          background: '#1A2E4A',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 88, fontWeight: 700, letterSpacing: '-0.03em' }}>FirmsLedger</div>
        <div style={{ marginTop: 24, fontSize: 40, color: '#cbd5e1', lineHeight: 1.3 }}>
          Find US manufacturers by capability and state.
        </div>
        <div style={{ marginTop: 48, fontSize: 28, color: '#94a3b8' }}>
          Metal fabrication · Electronics · Plastics · Medical devices · and more
        </div>
      </div>
    ),
    size,
  );
}
