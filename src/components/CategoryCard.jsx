import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const CARD_COLORS = [
  { bg: 'bg-orange-50', border: 'border-orange-100' },
  { bg: 'bg-blue-50', border: 'border-blue-100' },
  { bg: 'bg-emerald-50', border: 'border-emerald-100' },
  { bg: 'bg-violet-50', border: 'border-violet-100' },
  { bg: 'bg-rose-50', border: 'border-rose-100' },
  { bg: 'bg-amber-50', border: 'border-amber-100' },
  { bg: 'bg-cyan-50', border: 'border-cyan-100' },
  { bg: 'bg-pink-50', border: 'border-pink-100' },
];

export default function CategoryCard({ href, icon, name, description, colorIndex = 0 }) {
  const color = CARD_COLORS[colorIndex % CARD_COLORS.length];

  return (
    <Link
      href={href}
      className={`flex items-center gap-4 bg-white border border-slate-200 rounded-xl px-5 py-4 hover:shadow-sm hover:border-slate-300 transition-all group`}
    >
      <div className={`w-14 h-14 rounded-xl ${color.bg} ${color.border} border flex items-center justify-center text-2xl flex-shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-[#0D1B2A] text-base group-hover:text-orange-600 transition-colors leading-snug">
          {name}
        </h3>
        <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{description}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-orange-400 flex-shrink-0 transition-colors" />
    </Link>
  );
}
