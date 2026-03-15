import React, { useState } from 'react';
import { MapPin, Users, Star, Filter, X, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Singapore',
  'United Arab Emirates',
  'India',
  'Germany',
  'France',
  'Netherlands',
  'Japan',
  'Sweden',
  'Switzerland',
  'Ireland',
  'New Zealand',
  'South Africa',
  'Brazil',
  'Mexico',
  'Other',
];

export default function FilterPanel({
  categories,
  selectedCountry,
  setSelectedCountry,
  selectedState,
  setSelectedState,
  selectedService,
  setSelectedService,
  selectedTeamSize,
  setSelectedTeamSize,
  selectedRating,
  setSelectedRating,
  onApply
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleReset = () => {
    setSelectedCountry('');
    setSelectedState('');
    setSelectedService('');
    setSelectedTeamSize('');
    setSelectedRating('');
  };

  const activeFiltersCount = [
    selectedCountry,
    selectedState,
    selectedService,
    selectedTeamSize,
    selectedRating
  ].filter(Boolean).length;

  return (
    <div className="bg-white border-b py-4 sticky top-16 sm:top-20 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="lg:hidden w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors mb-4"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="font-semibold text-slate-900">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </div>
          {isExpanded ? <X className="w-4 h-4" /> : <span className="text-slate-400">▼</span>}
        </button>

        {/* Desktop & Expanded Mobile Filters */}
        <div className={`${isExpanded ? 'block' : 'hidden'} lg:block`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-3">
            {/* Country */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Country</label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="w-full bg-slate-50 border-slate-200 hover:bg-white">
                  <Globe className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" />
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>All Countries</SelectItem>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* State / Region */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">State / Region</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  placeholder="e.g. California"
                  className="pl-9 bg-slate-50 border-slate-200 hover:bg-white"
                />
              </div>
            </div>

            {/* Services */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Services</label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger className="w-full bg-slate-50 border-slate-200 hover:bg-white">
                  <SelectValue placeholder="All Services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>All Services</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Team Size */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Employees</label>
              <Select value={selectedTeamSize} onValueChange={setSelectedTeamSize}>
                <SelectTrigger className="w-full bg-slate-50 border-slate-200 hover:bg-white">
                  <Users className="w-4 h-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="All Sizes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>All Sizes</SelectItem>
                  <SelectItem value="1-10">1-10</SelectItem>
                  <SelectItem value="11-50">11-50</SelectItem>
                  <SelectItem value="51-200">51-200</SelectItem>
                  <SelectItem value="201-500">201-500</SelectItem>
                  <SelectItem value="500+">500+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Reviews</label>
              <Select value={selectedRating} onValueChange={setSelectedRating}>
                <SelectTrigger className="w-full bg-slate-50 border-slate-200 hover:bg-white">
                  <Star className="w-4 h-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>All Ratings</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="4.5">4.5+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex gap-2 items-end">
              <Button
                onClick={() => {
                  onApply();
                  setIsExpanded(false);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Apply
              </Button>
              {activeFiltersCount > 0 && (
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="px-3"
                  title="Reset filters"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
