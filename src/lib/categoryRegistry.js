import {
  Zap,
  Settings,
  Package,
  Hammer,
  Cpu,
  Car,
  Scissors,
  Armchair,
  Utensils,
  HeartPulse,
} from 'lucide-react';

export const CATEGORY_VISUALS = {
  'electrical-components': {
    icon: Zap,
    hex: { bg: '#fef9ee', border: '#fde68a', color: '#92400e' },
    tw: {
      bg: 'bg-gradient-to-br from-amber-50 to-amber-100',
      border: 'border-amber-200',
      text: 'text-amber-700',
      dot: 'bg-amber-500',
    },
  },
  'mechanical-components': {
    icon: Settings,
    hex: { bg: '#f8fafc', border: '#e2e8f0', color: '#1e3a5f' },
    tw: {
      bg: 'bg-gradient-to-br from-slate-100 to-slate-200',
      border: 'border-slate-300',
      text: 'text-slate-700',
      dot: 'bg-slate-500',
    },
  },
  'plastics-packaging': {
    icon: Package,
    hex: { bg: '#f0fdf4', border: '#bbf7d0', color: '#166534' },
    tw: {
      bg: 'bg-gradient-to-br from-green-50 to-green-100',
      border: 'border-green-200',
      text: 'text-green-700',
      dot: 'bg-green-500',
    },
  },
  'metal-fabrication': {
    icon: Hammer,
    hex: { bg: '#eff6ff', border: '#bfdbfe', color: '#1e3a8a' },
    tw: {
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      border: 'border-blue-200',
      text: 'text-blue-700',
      dot: 'bg-blue-500',
    },
  },
  'electronics-semiconductor': {
    icon: Cpu,
    hex: { bg: '#f5f3ff', border: '#ddd6fe', color: '#4c1d95' },
    tw: {
      bg: 'bg-gradient-to-br from-violet-50 to-violet-100',
      border: 'border-violet-200',
      text: 'text-violet-700',
      dot: 'bg-indigo-500',
    },
  },
  'automotive-parts': {
    icon: Car,
    hex: { bg: '#fff1f2', border: '#fecdd3', color: '#9f1239' },
    tw: {
      bg: 'bg-gradient-to-br from-rose-50 to-rose-100',
      border: 'border-rose-200',
      text: 'text-rose-700',
      dot: 'bg-red-500',
    },
  },
  'textile-apparel': {
    icon: Scissors,
    hex: { bg: '#fdf2f8', border: '#f9a8d4', color: '#831843' },
    tw: {
      bg: 'bg-gradient-to-br from-pink-50 to-pink-100',
      border: 'border-pink-200',
      text: 'text-pink-700',
      dot: 'bg-pink-500',
    },
  },
  'furniture-woodworking': {
    icon: Armchair,
    hex: { bg: '#fffbeb', border: '#fde68a', color: '#78350f' },
    tw: {
      bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
      border: 'border-orange-200',
      text: 'text-orange-800',
      dot: 'bg-orange-400',
    },
  },
  'food-beverage-processing': {
    icon: Utensils,
    hex: { bg: '#fff7ed', border: '#fed7aa', color: '#7c2d12' },
    tw: {
      bg: 'bg-gradient-to-br from-amber-50 to-amber-100',
      border: 'border-amber-200',
      text: 'text-amber-800',
      dot: 'bg-amber-600',
    },
  },
  'medical-devices': {
    icon: HeartPulse,
    hex: { bg: '#f0fdfa', border: '#99f6e4', color: '#134e4a' },
    tw: {
      bg: 'bg-gradient-to-br from-teal-50 to-teal-100',
      border: 'border-teal-200',
      text: 'text-teal-700',
      dot: 'bg-teal-500',
    },
  },
};

export function visualsFor(slugOrName) {
  if (!slugOrName) return null;
  const slug = slugOrName.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-');
  return CATEGORY_VISUALS[slug] || null;
}
