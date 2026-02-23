'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getDirectoryUrl, getDirectoryStaffingUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';

/** Category icon: simple grid (4 squares) – clear “what are you looking for” with no location pin */
function CategoryIcon({ className = 'w-5 h-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </svg>
  );
}

const LOCATIONS = [
  'Mumbai',
  'Bangalore',
  'Delhi',
  'Pune',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'Gurgaon',
  'Noida',
  'Chandigarh',
  'Kochi',
];

export default function SearchBar() {
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const router = useRouter();

  const { data: categoriesRaw = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.entities.Category.list(),
  });

  const { categoriesForDropdown, staffingParentId } = useMemo(() => {
    const seen = new Set();
    const list = categoriesRaw.filter((c) => {
      if (seen.has(c.slug)) return false;
      seen.add(c.slug);
      return true;
    });
    const staffingId = list.find((c) => c.slug === 'staffing-companies')?.id;
    const staffingSub = staffingId
      ? list
          .filter((c) => (c.parent_id ?? c.parentId) === staffingId)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      : [];
    const others = list.filter(
      (c) => (c.is_parent ?? c.isParent) && c.slug !== 'staffing-companies'
    );
    const categoriesForDropdown = [
      ...(staffingId ? [list.find((c) => c.id === staffingId)].filter(Boolean) : []),
      ...staffingSub,
      ...others,
    ].filter(Boolean);
    return { categoriesForDropdown, staffingParentId: staffingId };
  }, [categoriesRaw]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const slug = (selectedCategorySlug || '').trim();
    const base = !slug
      ? getDirectoryUrl()
      : slug === 'staffing-companies'
        ? getDirectoryStaffingUrl()
        : getDirectoryUrl(slug, {
            underStaffing:
              staffingParentId &&
              categoriesForDropdown.some(
                (c) => c.slug === slug && (c.parent_id ?? c.parentId) === staffingParentId
              ),
          });
    const params = new URLSearchParams();
    if (selectedLocation?.trim()) params.set('location', selectedLocation.trim());
    const url = params.toString() ? `${base}?${params.toString()}` : base;
    router.push(url);
  };

  const hasCategory = !!selectedCategorySlug?.trim();
  const locationDisabled = !hasCategory;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full"
    >
      {/* Category - "What are you looking for?" */}
      <div className="flex-1 min-w-0">
        <Select
          value={selectedCategorySlug || '__none__'}
          onValueChange={(v) => setSelectedCategorySlug(v === '__none__' ? '' : v)}
        >
          <SelectTrigger
            className="relative flex h-12 items-center gap-3 bg-white/95 border-white/20 text-slate-900 rounded-xl pl-3 pr-9 focus:ring-2 focus:ring-white/30"
            aria-label="Category"
          >
            <span className="shrink-0 text-amber-600/80">
              <CategoryIcon />
            </span>
            <span className="flex-1 min-w-0 text-left">
              <SelectValue placeholder="What are you looking for?" />
            </span>
          </SelectTrigger>
          <SelectContent className="max-h-[280px]">
            <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b mb-1">
              Popular categories
            </div>
            {categoriesForDropdown.map((cat) => (
              <SelectItem
                key={cat.id}
                value={cat.slug}
                className="cursor-pointer"
              >
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Location - disabled until category selected */}
      <div className="flex-1 min-w-0">
        <Select
          value={selectedLocation || '__none__'}
          onValueChange={(v) => setSelectedLocation(v === '__none__' ? '' : v)}
          disabled={locationDisabled}
        >
          <SelectTrigger
            className={`relative flex h-12 items-center gap-3 rounded-xl pl-3 pr-9 ${
              locationDisabled
                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-white/95 border-white/20 text-slate-900'
            }`}
            aria-label="Location"
          >
            <MapPin className="w-5 h-5 shrink-0 text-amber-600/80" />
            <span className="flex-1 min-w-0 text-left">
              <SelectValue
                placeholder={
                  locationDisabled ? 'Select a category first' : 'Location'
                }
              />
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">All locations</SelectItem>
            {LOCATIONS.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {loc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {locationDisabled && (
          <p className="text-xs text-amber-200/90 mt-1 px-1">
            Select a category first
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="h-12 px-6 sm:px-8 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold shrink-0 shadow-lg"
        aria-label="Search"
      >
        <ArrowRight className="w-5 h-5 sm:ml-1" />
      </Button>
    </form>
  );
}
