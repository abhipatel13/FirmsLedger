import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const CARD_COLORS = [
  { bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700' },
  { bg: 'bg-slate-50',  border: 'border-slate-200',  text: 'text-slate-700' },
  { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700' },
  { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700' },
  { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' },
  { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700' },
  { bg: 'bg-pink-50',   border: 'border-pink-200',   text: 'text-pink-700' },
  { bg: 'bg-teal-50',   border: 'border-teal-200',   text: 'text-teal-700' },
];

export default function CategoryCard({ href, icon, name, description, colorIndex = 0 }) {
  const color = CARD_COLORS[colorIndex % CARD_COLORS.length];

  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-md"
    >
      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl border text-2xl ${color.bg} ${color.border}`}
      >
        {icon}
      </div>

      <h3 className="mb-1.5 text-[15px] font-semibold leading-snug text-slate-900">
        {name}
      </h3>
      <p className="mb-4 flex-1 text-[13px] leading-relaxed text-slate-500">
        {description}
      </p>

      <div className={`inline-flex items-center gap-1.5 text-[13px] font-semibold ${color.text}`}>
        Browse listings
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
