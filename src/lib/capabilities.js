// Manufacturing capabilities shown on /capabilities.
//
// These are *processes*, not industries — the page is named "Capabilities" and
// previously listed the ten top-level industry categories, which duplicated
// /browse ("Browse All Industries") and left the page's own name unexplained.
//
// ORDER AND MEMBERSHIP COME FROM INVENTORY, NOT FROM IMAGERY.
// The first cut of this list was chosen by which stock photos could be found,
// which quietly pushed the two largest capabilities on the site off the page
// (electrical-wire-cable, 577 companies; solar-panels, 536) while promoting
// CNC machining and laser cutting — ranks 18 and 19 — because a competitor
// features them. Everything below is ordered by approved company count, and a
// capability with no usable photo renders a typographic tile rather than
// borrowing an unrelated one or being dropped.
//
// `href` is the parent-prefixed route. A bare /cnc-machining 404s —
// app/[category]/page.jsx only accepts the ten top-level slugs.
//
// Counts in comments are approved companies as of Aug 2026, for ordering only;
// the page renders live counts.

export const CAPABILITIES = [
  { slug: 'electrical-wire-cable',   parent: 'electrical-components',     name: 'Electrical Wire & Cable',
    desc: 'Wire, cable and conductor manufacturing for power and signal.',                     image: false }, // 577
  { slug: 'solar-panels',            parent: 'electrical-components',     name: 'Solar Panels',
    desc: 'Photovoltaic module manufacture, assembly and mounting systems.',                   image: true  }, // 536
  { slug: 'injection-molding',       parent: 'plastics-packaging',        name: 'Injection Molding',
    desc: 'Volume production of plastic parts from custom tooling.',                           image: true  }, // 403
  { slug: 'welding',                 parent: 'metal-fabrication',         name: 'Welding',
    desc: 'Structural and precision welding across steel, stainless and aluminium.',           image: true  }, // 365
  { slug: 'sheet-metal-fabrication', parent: 'metal-fabrication',         name: 'Sheet Metal Fabrication',
    desc: 'Cutting, punching and forming of sheet and plate to spec.',                         image: true  }, // 346
  { slug: 'garment-manufacturing',   parent: 'textile-apparel',           name: 'Garment Manufacturing',
    desc: 'Cut-and-sew production, from sampling through to full runs.',                       image: true  }, // 284
  { slug: 'switchgear',              parent: 'electrical-components',     name: 'Switchgear',
    desc: 'Distribution and control assemblies for industrial power systems.',                 image: true  }, // 180
  { slug: 'fabric-manufacturing',    parent: 'textile-apparel',           name: 'Fabric Manufacturing',
    desc: 'Weaving, knitting and finishing of technical and apparel textiles.',                 image: false }, // 169
  { slug: 'structural-steel',        parent: 'metal-fabrication',         name: 'Structural Steel',
    desc: 'Beams, columns and frames fabricated for construction and heavy industry.',         image: true  }, // 164
  { slug: 'millwork',                parent: 'furniture-woodworking',     name: 'Millwork',
    desc: 'Custom architectural woodwork, mouldings and finished timber components.',          image: true  }, // 122
  { slug: 'aluminum-fabrication',    parent: 'metal-fabrication',         name: 'Aluminum Fabrication',
    desc: 'Extrusion, forming and finishing of aluminium components.',                          image: true  }, // 115
  { slug: 'custom-cabinetry',        parent: 'furniture-woodworking',     name: 'Custom Cabinetry',
    desc: 'Built-to-order casework for residential and commercial interiors.',                  image: true  }, // 113
  { slug: 'aftermarket-parts',       parent: 'automotive-parts',          name: 'Aftermarket Parts',
    desc: 'Replacement and performance components for vehicles in service.',                    image: true  }, // 111
  { slug: 'semiconductor-packaging', parent: 'electronics-semiconductor', name: 'Semiconductor Packaging',
    desc: 'Die attach, wire bond and encapsulation of finished silicon.',                        image: true  }, // 107
  { slug: 'pcb-manufacturing',       parent: 'electronics-semiconductor', name: 'PCB Manufacturing',
    desc: 'Bare board fabrication, from single-layer to complex multilayer stacks.',            image: true  }, // 106
  { slug: 'powder-coating',          parent: 'metal-fabrication',         name: 'Powder Coating',
    desc: 'Durable electrostatic finishing for metal components.',                               image: false }, // 86
];

export const CAPABILITY_SLUGS = CAPABILITIES.map((c) => c.slug);
export const capabilityHref = (c) => `/${c.parent}/${c.slug}`;
export const capabilityImage = (c) => (c.image ? `/capabilities/${c.slug}.webp` : null);
