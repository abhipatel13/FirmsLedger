/**
 * Renders a JSON-LD <script> tag for structured data (Schema.org).
 * Safe to use in both Server and Client components.
 */
export default function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
