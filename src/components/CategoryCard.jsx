import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { pickCategoryIcon, colorFor } from '@/lib/categoryIcon';

export default function CategoryCard({ href, cat, name, description }) {
  const Icon = pickCategoryIcon(cat || { name });
  const { bg: bgClass, border: borderClass, text: textClass } = colorFor(cat?.slug || name);

  return (
    <Link
      href={href}
      className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl px-6 py-5 hover:shadow-sm hover:border-slate-300 transition-all group"
    >
      <div className={`w-16 h-16 rounded-xl ${bgClass} ${borderClass} border flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-7 h-7 ${textClass}`} />
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
