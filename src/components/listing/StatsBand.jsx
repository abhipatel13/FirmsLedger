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
      <p style={{ fontSize: 24, fontWeight: 700, color: '#D4A017', margin: 0, fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>
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
        <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: '20px 24px' }}>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>Be the first to get listed in this category.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
      <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: '24px 24px 28px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <StatTile value={stats.totalCount} label="Total Listings" />
          {showStatesCovered ? (
            <StatTile value={stats.statesCovered} label="States Covered" />
          ) : null}
        </div>

        <div style={{
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
          marginTop: 14,
          padding: '12px 16px',
          borderRadius: 10,
          backgroundColor: 'rgba(212,160,23,0.08)',
          border: '1px solid rgba(212,160,23,0.25)',
        }}>
          <ShieldCheck size={16} style={{ color: '#D4A017', flexShrink: 0, marginTop: 2 }} />
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
