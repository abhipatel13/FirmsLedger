import React, { useState } from 'react';
import { MapPin, Users, Star, Filter, X, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { STATES_BY_COUNTRY } from '@/lib/statesByCountry';

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
    <div className="bg-white border-b border-slate-200 sticky top-16 sm:top-20 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Mobile Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="lg:hidden w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-md transition-colors mb-3 border border-slate-200"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="font-semibold text-slate-800 text-sm">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-orange-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </div>
          {isExpanded ? <X className="w-4 h-4 text-slate-400" /> : <span className="text-slate-400 text-xs">▼</span>}
        </button>

        {/* Desktop & Expanded Mobile Filters */}
        <div className={`${isExpanded ? 'block' : 'hidden'} lg:block`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Country */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-widest">Country</label>
              <Select
                value={selectedCountry}
                onValueChange={(val) => {
                  setSelectedCountry(val === '__all__' ? '' : val);
                  setSelectedState('');
                }}
              >
                <SelectTrigger className="w-full bg-white border-slate-200 text-sm h-9 hover:border-orange-400 focus:border-orange-400">
                  <Globe className="w-3.5 h-3.5 mr-2 text-slate-400 flex-shrink-0" />
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Countries</SelectItem>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* State / Region */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-widest">State / Region</label>
              {selectedCountry && STATES_BY_COUNTRY[selectedCountry]?.length > 0 ? (
                <Select
                  value={selectedState}
                  onValueChange={(val) => setSelectedState(val === '__all__' ? '' : val)}
                >
                  <SelectTrigger className="w-full bg-white border-slate-200 text-sm h-9 hover:border-orange-400">
                    <MapPin className="w-3.5 h-3.5 mr-2 text-slate-400 flex-shrink-0" />
                    <SelectValue placeholder="All States" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All States</SelectItem>
                    {STATES_BY_COUNTRY[selectedCountry].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select
                  value={selectedState || '__all__'}
                  onValueChange={(val) => setSelectedState(val === '__all__' ? '' : val)}
                  disabled={!selectedCountry}
                >
                  <SelectTrigger className="w-full bg-white border-slate-200 text-sm h-9 disabled:opacity-40">
                    <MapPin className="w-3.5 h-3.5 mr-2 text-slate-400 flex-shrink-0" />
                    <SelectValue placeholder={selectedCountry ? 'No states available' : 'Select a country first'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All States</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Services */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-widest">Services</label>
              <Select value={selectedService || '__all__'} onValueChange={(val) => setSelectedService(val === '__all__' ? '' : val)}>
                <SelectTrigger className="w-full bg-white border-slate-200 text-sm h-9 hover:border-orange-400">
                  <SelectValue placeholder="All Services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Services</SelectItem>
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
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-widest">Employees</label>
              <Select value={selectedTeamSize || '__all__'} onValueChange={(val) => setSelectedTeamSize(val === '__all__' ? '' : val)}>
                <SelectTrigger className="w-full bg-white border-slate-200 text-sm h-9 hover:border-orange-400">
                  <Users className="w-3.5 h-3.5 mr-2 text-slate-400" />
                  <SelectValue placeholder="All Sizes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Sizes</SelectItem>
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
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-widest">Rating</label>
              <Select value={selectedRating || '__all__'} onValueChange={(val) => setSelectedRating(val === '__all__' ? '' : val)}>
                <SelectTrigger className="w-full bg-white border-slate-200 text-sm h-9 hover:border-orange-400">
                  <Star className="w-3.5 h-3.5 mr-2 text-slate-400" />
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Ratings</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="4.5">4.5+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex gap-2 items-end">
              <Button
                onClick={() => { onApply(); setIsExpanded(false); }}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm h-9 rounded-md"
              >
                Apply
              </Button>
              {activeFiltersCount > 0 && (
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="px-3 h-9 text-sm border-slate-200 text-slate-600 hover:border-slate-300"
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
