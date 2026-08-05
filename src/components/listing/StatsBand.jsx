import { ShieldCheck } from 'lucide-react';

function StatTile({ value, label }) {
  return (
    <div style={{
      flex: '1 1 140px',
      textAlign: 'center',
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: 10,
      padding: '16px 12px',
    }}>
      <p style={{ fontSize: 24, fontWeight: 700, color: '#1A2E4A', margin: 0, fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </p>
      <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0', whiteSpace: 'nowrap' }}>{label}</p>
    </div>
  );
}

export default function StatsBand({ stats, categoryNoun, stateName, showStatesCovered }) {
  if (stats.totalCount === 0) {
    return (
      <div style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <div className="mx-auto max-w-[var(--max-width)] px-4 py-5 sm:px-6 sm:py-6">
          <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>Be the first to get listed in this category.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
      <div className="mx-auto max-w-[var(--max-width)] px-4 pt-4 pb-5 sm:px-6 sm:pt-6 sm:pb-7">
        <div 
          className="grid gap-3 sm:flex sm:flex-wrap"
          style={{
            gridTemplateColumns: showStatesCovered ? '1fr 1fr' : '1fr',
          }}
        >
          <StatTile value={stats.totalCount} label="Total Listings" />
          {showStatesCovered ? (
            <StatTile value={stats.statesCovered} label="States Covered" />
          ) : null}
        </div>

        <div style={{
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
          marginTop: 12,
          padding: '12px 14px',
          borderRadius: 10,
          backgroundColor: 'rgba(26, 46, 74, 0.04)',
          border: '1px solid rgba(26, 46, 74, 0.12)',
        }}>
          <ShieldCheck size={16} style={{ color: '#1A2E4A', flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 13, lineHeight: 1.6, color: '#475569', margin: 0 }}>
            <strong style={{ color: '#0f172a' }}>How this list is built:</strong> companies are grouped by category
            and location. No company can pay for a higher position.
            {stats.topSpecialties.length > 0 ? ` Top specialties: ${stats.topSpecialties.join(', ')}.` : ''}
            {' '}Browse {stats.totalCount} {categoryNoun}{stateName ? ` in ${stateName}` : ' across the US'}.
          </p>
        </div>
      </div>
    </div>
  );
}

