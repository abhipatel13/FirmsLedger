import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import FilterBar from '@/components/listing/FilterBar';
import JsonLd from '@/components/JsonLd';
import { BASE_URL, SITE_NAME, OG_IMAGES } from '@/lib/seo';
import { stateHubSeo } from '@/lib/pageSeo';
import { companyCity } from '@/lib/listingFacts';
import { InlineMarkdown, SeoFaqs } from '@/components/seo/SeoBlocks';
import CtaBand from '@/components/listing/CtaBand';
import { ArrowRight } from 'lucide-react';

// 50 prebuilt state hubs re-rendering hourly was up to 1,200 revalidations/day,
// each calling fetchStateHubStats(). The homepage US map links straight here, so
// they get real traffic.
// `false`, not an hourly window. These pages are prebuilt, but a time-based
// revalidate makes them re-render AT RUNTIME on expiry, and a runtime render
// hits Postgres. Every wake costs Neon's full 300s suspend timeout regardless
// of how little work it does, so runtime re-renders are the cost driver.
// Freshness comes from rebuilds. See HISTORY.md 2026-09-09.
export const revalidate = false;

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

const ALL_STATES = [
  { name: 'Alabama',        slug: 'alabama',        region: 'South'     },
  { name: 'Alaska',         slug: 'alaska',         region: 'West'      },
  { name: 'Arizona',        slug: 'arizona',        region: 'West'      },
  { name: 'Arkansas',       slug: 'arkansas',       region: 'South'     },
  { name: 'California',     slug: 'california',     region: 'West'      },
  { name: 'Colorado',       slug: 'colorado',       region: 'West'      },
  { name: 'Connecticut',    slug: 'connecticut',    region: 'Northeast' },
  { name: 'Delaware',       slug: 'delaware',       region: 'Northeast' },
  { name: 'Florida',        slug: 'florida',        region: 'South'     },
  { name: 'Georgia',        slug: 'georgia',        region: 'South'     },
  { name: 'Hawaii',         slug: 'hawaii',         region: 'West'      },
  { name: 'Idaho',          slug: 'idaho',          region: 'West'      },
  { name: 'Illinois',       slug: 'illinois',       region: 'Midwest'   },
  { name: 'Indiana',        slug: 'indiana',        region: 'Midwest'   },
  { name: 'Iowa',           slug: 'iowa',           region: 'Midwest'   },
  { name: 'Kansas',         slug: 'kansas',         region: 'Midwest'   },
  { name: 'Kentucky',       slug: 'kentucky',       region: 'South'     },
  { name: 'Louisiana',      slug: 'louisiana',      region: 'South'     },
  { name: 'Maine',          slug: 'maine',          region: 'Northeast' },
  { name: 'Maryland',       slug: 'maryland',       region: 'Northeast' },
  { name: 'Massachusetts',  slug: 'massachusetts',  region: 'Northeast' },
  { name: 'Michigan',       slug: 'michigan',       region: 'Midwest'   },
  { name: 'Minnesota',      slug: 'minnesota',      region: 'Midwest'   },
  { name: 'Mississippi',    slug: 'mississippi',    region: 'South'     },
  { name: 'Missouri',       slug: 'missouri',       region: 'Midwest'   },
  { name: 'Montana',        slug: 'montana',        region: 'West'      },
  { name: 'Nebraska',       slug: 'nebraska',       region: 'Midwest'   },
  { name: 'Nevada',         slug: 'nevada',         region: 'West'      },
  { name: 'New Hampshire',  slug: 'new-hampshire',  region: 'Northeast' },
  { name: 'New Jersey',     slug: 'new-jersey',     region: 'Northeast' },
  { name: 'New Mexico',     slug: 'new-mexico',     region: 'West'      },
  { name: 'New York',       slug: 'new-york',       region: 'Northeast' },
  { name: 'North Carolina', slug: 'north-carolina', region: 'South'     },
  { name: 'North Dakota',   slug: 'north-dakota',   region: 'Midwest'   },
  { name: 'Ohio',           slug: 'ohio',           region: 'Midwest'   },
  { name: 'Oklahoma',       slug: 'oklahoma',       region: 'South'     },
  { name: 'Oregon',         slug: 'oregon',         region: 'West'      },
  { name: 'Pennsylvania',   slug: 'pennsylvania',   region: 'Northeast' },
  { name: 'Rhode Island',   slug: 'rhode-island',   region: 'Northeast' },
  { name: 'South Carolina', slug: 'south-carolina', region: 'South'     },
  { name: 'South Dakota',   slug: 'south-dakota',   region: 'Midwest'   },
  { name: 'Tennessee',      slug: 'tennessee',      region: 'South'     },
  { name: 'Texas',          slug: 'texas',          region: 'South'     },
  { name: 'Utah',           slug: 'utah',           region: 'West'      },
  { name: 'Vermont',        slug: 'vermont',        region: 'Northeast' },
  { name: 'Virginia',       slug: 'virginia',       region: 'South'     },
  { name: 'Washington',     slug: 'washington',     region: 'West'      },
  { name: 'West Virginia',  slug: 'west-virginia',  region: 'South'     },
  { name: 'Wisconsin',      slug: 'wisconsin',      region: 'Midwest'   },
  { name: 'Wyoming',        slug: 'wyoming',        region: 'West'      },
  { name: 'District of Columbia', slug: 'district-of-columbia', region: 'Northeast' },
];

const CATEGORIES = [
  { slug: 'electrical-components',     name: 'Electrical Components Manufacturers',          shortDesc: 'Wiring, switchgear & components',          dot: '#eab308', icon: '⚡' },
  { slug: 'mechanical-components',     name: 'Mechanical Components Manufacturers',          shortDesc: 'CNC machining & precision parts',           dot: '#64748b', icon: '⚙️' },
  { slug: 'plastics-packaging',        name: 'Plastics & Packaging Manufacturers',           shortDesc: 'Injection molding & packaging',             dot: '#22c55e', icon: '📦' },
  { slug: 'metal-fabrication',         name: 'Metal Fabrication & Machining',                shortDesc: 'Sheet metal, welding & stamping',           dot: '#3b82f6', icon: '🔧' },
  { slug: 'electronics-semiconductor', name: 'Electronics & Semiconductor Manufacturers',    shortDesc: 'PCBs, chips & assemblies',                  dot: '#6366f1', icon: '🖥️' },
  { slug: 'automotive-parts',          name: 'Automotive Parts Manufacturers',               shortDesc: 'OEM & aftermarket components',              dot: '#ef4444', icon: '🚗' },
  { slug: 'textile-apparel',           name: 'Textile & Apparel Manufacturers',              shortDesc: 'Fabric & garment manufacturing',            dot: '#ec4899', icon: '🧵' },
  { slug: 'furniture-woodworking',     name: 'Furniture & Woodworking Manufacturers',        shortDesc: 'Custom furniture & cabinetry',              dot: '#f59e0b', icon: '🪵' },
  { slug: 'food-beverage-processing',  name: 'Food & Beverage Processing Equipment Manufacturers', shortDesc: 'Processing & packaging lines',         dot: '#84cc16', icon: '🍽️' },
  { slug: 'medical-devices',           name: 'Medical Device Manufacturers',                 shortDesc: 'Diagnostic & surgical equipment',           dot: '#14b8a6', icon: '🩺' },
];

const STATE_MAP = Object.fromEntries(ALL_STATES.map((s) => [s.slug, s]));

export function generateStaticParams() {
  return ALL_STATES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const state = STATE_MAP[slug];
  if (!state) return { title: 'State' };

  const { stats, seo } = await stateHubSeo({ stateSlug: slug, stateName: state.name });
  const title = seo?.title || `Manufacturers in ${state.name}`;
  const description = seo?.description || (stats.totalCount > 0
    ? `Browse ${stats.totalCount} manufacturers in ${state.name}${stats.topCategories[0] ? `, led by ${stats.topCategories[0].name.toLowerCase()}` : ''}. Compare suppliers by category, city, and certifications.`
    : `Find manufacturers in ${state.name}. Browse electrical components, mechanical components, automotive, electronics, and more.`);
  const canonical   = `${_BASE}/states/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { images: OG_IMAGES, title: `${title} | ${SITE_NAME}`, description, type: 'website', url: canonical },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function StateHubPage({ params }) {
  const { slug } = await params;
  const state = STATE_MAP[slug];
  if (!state) notFound();

  const { stats, sections, seo } = await stateHubSeo({ stateSlug: slug, stateName: state.name });
  const topCities = stats.topCities.slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Manufacturers in ${state.name}`,
    description: `Browse ${stats.totalCount} manufacturers across all categories in ${state.name}.`,
    url: `${_BASE}/states/${slug}`,
    provider: { '@type': 'Organization', name: SITE_NAME, url: _BASE },
    about: {
      '@type': 'AdministrativeArea',
      name: state.name,
      containedInPlace: { '@type': 'Country', name: 'United States' },
    },
  };

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Manufacturing categories in ${state.name}`,
    itemListElement: CATEGORIES.map((cat, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: cat.name,
      url: `${_BASE}/${cat.slug}/${slug}`,
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: _BASE },
      { '@type': 'ListItem', position: 2, name: 'Locations', item: `${_BASE}/locations` },
      { '@type': 'ListItem', position: 3, name: state.name, item: `${_BASE}/states/${slug}` },
    ],
  };

  const otherStates = ALL_STATES.filter((s) => s.slug !== slug).slice(0, 24);

  const cities = stats.topCities.slice(0, 5);
  const lead = `FirmsLedger lists ${stats.totalCount} manufacturer${stats.totalCount === 1 ? '' : 's'} headquartered in ${state.name} across ${sections.length} industr${sections.length === 1 ? 'y' : 'ies'}. Every profile shows the company's city, website and phone number for free.`;
  const about = seo?.intro.length ? seo.intro : [`${state.name} is part of the ${state.region} region. Each industry list above shows ${state.name}-based companies with their city, specialties, certifications and website, with no paid placements.`];

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd data={itemListJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <div className="bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[var(--max-width)] px-4 py-8 sm:px-6 sm:py-10">
            <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
              <Link href="/" className="hover:text-slate-900">Home</Link>
              <span className="text-slate-300">/</span>
              <Link href="/locations" className="hover:text-slate-900">Locations</Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900">{state.name}</span>
            </nav>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <h1 className="text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl">{seo?.h1 || `Manufacturers in ${state.name}`}</h1>
                <p className="mt-2 text-sm text-slate-500">
                  {[`${stats.totalCount} manufacturers`, `${sections.length} industries`, ...cities.slice(0, 3).map((c) => `${c.city} ${c.count}`)].join(' · ')}
                </p>
                <p className="mt-4 text-[15px] leading-relaxed text-slate-600">{lead}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-3">
                <Link href="/RequestProposal" className="rounded-md bg-[#1A2E4A] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0f172a]">Request quotes</Link>
                <Link href="/list-your-company" className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50">List your company</Link>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[var(--max-width)] px-4 py-8 sm:px-6">
          <div className="mb-8">
          <Suspense fallback={null}>
            <FilterBar showStateFilter currentState={slug} />
          </Suspense>
          </div>
          <h2 className="mb-4 text-lg font-semibold text-[#1A2E4A]">Browse {state.name} manufacturers by industry</h2>
          {sections.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sections.map(({ cat, companies }) => (
                <section key={cat.slug} className="flex min-w-0 flex-col rounded-lg border border-slate-200 bg-white p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-base font-semibold text-[#1A2E4A]">
                      <Link href={`/${cat.slug}/${slug}`} className="hover:underline">{cat.titleNoun} in {state.name}</Link>
                    </h3>
                    <span className="shrink-0 text-xs tabular-nums text-slate-500">{companies.length}</span>
                  </div>
                  <ul className="mt-3 flex-1 space-y-1.5 text-sm">
                    {companies.slice(0, 3).map((c) => (
                      <li key={c.slug} className="truncate">
                        <Link href={`/company/${c.slug}`} className="text-slate-800 hover:underline">{c.name}</Link>
                        {companyCity(c) && <span className="text-slate-500"> · {companyCity(c)}</span>}
                      </li>
                    ))}
                  </ul>
                  <Link href={`/${cat.slug}/${slug}`} className="mt-4 text-sm font-semibold text-[#1A2E4A] hover:underline">
                    All {companies.length} {cat.noun} →
                  </Link>
                </section>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-600">No manufacturers listed in {state.name} yet.</p>
          )}

          {cities.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Top cities in {state.name}</h2>
              <ul className="flex flex-wrap gap-2">
                {cities.map((c) => (
                  <li key={c.city} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700">
                    {c.city} <span className="text-slate-400">{c.count}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <CtaBand title={`Looking for a manufacturer in ${state.name}?`} text="Tell us what you need. The FirmsLedger team will point you to matching manufacturers, free of charge." />

          <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="mb-3 text-lg font-bold text-slate-900">About manufacturing in {state.name}</h2>
            <div className="space-y-3 text-[15px] leading-relaxed text-slate-600">
              {about.map((p) => <p key={p}><InlineMarkdown text={p} /></p>)}
            </div>
          </section>

          {seo && <div className="mt-8"><SeoFaqs faqs={seo.faqs} /></div>}

          <section className="mt-10">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Other states</h2>
            <div className="flex flex-wrap gap-2">
              {otherStates.map((s) => (
                <Link key={s.slug} href={`/states/${s.slug}`} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 hover:border-slate-400">{s.name}</Link>
              ))}
              <Link href="/locations" className="inline-flex items-center gap-1 rounded-full bg-[#0f172a] px-3 py-1 text-sm font-semibold text-white">
                All 50 states <ArrowRight className="size-3" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
