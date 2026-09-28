'use client';

import React from 'react';

/**
 * Company logo <img> with a broken-image fallback.
 *
 * Exists because the fallback needs an onError handler, and a Server Component
 * may not pass event handlers to the client — rendering one throws
 * "Event handlers cannot be passed to Client Component props" and 500s the
 * whole route. CompanyCard and AgencyCard are both server components, so the
 * handler has to live behind this client boundary rather than in the cards.
 *
 * The bug stayed hidden while every company had logo_url = null: the cards only
 * reach the <img> branch once a logo exists, so populating logos is what set it
 * off. Any new caller rendering a remote logo should use this component.
 */
export default function LogoImage({ src, alt = '', className, width, height, fallbackSrc = '/logo-icon.svg', hideOnError = false }) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      className={className}
      onError={(e) => {
        // Clear the handler first so a failing fallback can't loop.
        e.currentTarget.onerror = null;
        if (hideOnError) {
          e.currentTarget.style.display = 'none';
        } else {
          e.currentTarget.src = fallbackSrc;
        }
      }}
    />
  );
}
