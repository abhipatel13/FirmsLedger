'use client';

import { useRouter } from 'next/navigation';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { geoCentroid } from 'd3-geo';
import geoData from 'us-atlas/states-10m.json';

// USPS abbreviations keyed by us-atlas geography name.
const STATE_ABBR = {
  Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA',
  Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE', 'District of Columbia': 'DC',
  Florida: 'FL', Georgia: 'GA', Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL',
  Indiana: 'IN', Iowa: 'IA', Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA',
  Maine: 'ME', Maryland: 'MD', Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN',
  Mississippi: 'MS', Missouri: 'MO', Montana: 'MT', Nebraska: 'NE', Nevada: 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
  'North Carolina': 'NC', 'North Dakota': 'ND', Ohio: 'OH', Oklahoma: 'OK',
  Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT', Vermont: 'VT',
  Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV', Wisconsin: 'WI', Wyoming: 'WY',
};

// Interactive US map for the homepage "Browse by State" panel (desktop only —
// the mobile experience keeps the list/dropdown, which is easier to tap and
// screen-reader friendly). Clicking/hovering a state drives the same
// `selectedState` used by the list, so the right-hand category panel updates
// identically. Territories without a slug render as inert grey shapes.
export default function USStateMap({ nameToSlug, selectedSlug, onSelect }) {
  const router = useRouter();
  return (
    <div className="w-full" aria-hidden={false}>
      <ComposableMap
        projection="geoAlbersUsa"
        width={640}
        height={400}
        style={{ width: '100%', height: 'auto' }}
      >
        <Geographies geography={geoData}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const slug = nameToSlug[geo.properties.name];
              const clickable = Boolean(slug);
              const active = clickable && slug === selectedSlug;
              const href = clickable ? `/states/${slug}` : null;
              const pick = () => {
                if (!clickable) return;
                onSelect(slug);
                router.prefetch(href); // warm the target so the click navigates instantly
              };
              const go = () => clickable && router.push(href);
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={pick}
                  onClick={go}
                  onKeyDown={(e) => {
                    if (clickable && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      go();
                    }
                  }}
                  tabIndex={clickable ? 0 : -1}
                  role={clickable ? 'button' : undefined}
                  aria-label={clickable ? geo.properties.name : undefined}
                  style={{
                    default: {
                      fill: active ? '#1A2E4A' : '#E2E8F0',
                      stroke: '#F8F5EF',
                      strokeWidth: 0.75,
                      outline: 'none',
                      cursor: clickable ? 'pointer' : 'default',
                      transition: 'fill 150ms',
                    },
                    hover: {
                      fill: active ? '#1A2E4A' : clickable ? '#D4A017' : '#E2E8F0',
                      stroke: '#F8F5EF',
                      strokeWidth: 0.75,
                      outline: 'none',
                      cursor: clickable ? 'pointer' : 'default',
                    },
                    pressed: { fill: '#1A2E4A', stroke: '#F8F5EF', strokeWidth: 0.75, outline: 'none' },
                  }}
                />
              );
            })
          }
        </Geographies>
        {/* Abbreviation badge for the hovered/active state only */}
        <Geographies geography={geoData}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const slug = nameToSlug[geo.properties.name];
              if (!slug || slug !== selectedSlug) return null;
              const abbr = STATE_ABBR[geo.properties.name];
              if (!abbr) return null;
              return (
                <Marker key={`lbl-${geo.rsmKey}`} coordinates={geoCentroid(geo)}>
                  <text
                    textAnchor="middle"
                    y={3.5}
                    style={{
                      fontFamily: 'inherit',
                      fontSize: 10,
                      fontWeight: 700,
                      fill: '#F8F5EF',
                      pointerEvents: 'none',
                      userSelect: 'none',
                    }}
                  >
                    {abbr}
                  </text>
                </Marker>
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
}
