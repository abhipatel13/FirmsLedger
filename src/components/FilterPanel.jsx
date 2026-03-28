import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MapPin, Users, Star, Filter, X, Globe, ChevronDown, ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { STATES_BY_COUNTRY } from '@/lib/statesByCountry';
import { CITIES_BY_STATE } from '@/lib/citiesByState';

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

function ServiceProductSelect({ categories, selectedService, setSelectedService }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedParents, setExpandedParents] = useState(new Set());
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Focus search when opened
  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  const { parentCategories, standaloneCategories } = useMemo(() => {
    const parents = categories.filter((c) => c.is_parent || c.isParent);
    const standalone = categories.filter(
      (c) => !(c.is_parent || c.isParent) && !(c.parent_id || c.parentId)
    );
    return { parentCategories: parents, standaloneCategories: standalone };
  }, [categories]);

  const getSubcategories = (parentId) =>
    categories.filter((c) => (c.parent_id ?? c.parentId) === parentId);

  // Auto-expand the parent of the currently selected service
  useEffect(() => {
    if (!selectedService) return;
    const selectedCat = categories.find((c) => c.slug === selectedService);
    if (selectedCat && (selectedCat.parent_id || selectedCat.parentId)) {
      setExpandedParents((prev) => {
        const next = new Set(prev);
        next.add(selectedCat.parent_id ?? selectedCat.parentId);
        return next;
      });
    }
  }, [selectedService, categories]);

  const searchLower = search.toLowerCase();

  // Filter: show parents that match or have matching children
  const filteredParents = parentCategories.filter((p) => {
    if (!search) return true;
    if (p.name.toLowerCase().includes(searchLower)) return true;
    return getSubcategories(p.id).some((c) => c.name.toLowerCase().includes(searchLower));
  });
  const filteredStandalone = standaloneCategories.filter((c) => {
    if (!search) return true;
    return c.name.toLowerCase().includes(searchLower);
  });

  // When searching, auto-expand matching parents
  const effectiveExpanded = useMemo(() => {
    if (!search) return expandedParents;
    const expanded = new Set(expandedParents);
    filteredParents.forEach((p) => expanded.add(p.id));
    return expanded;
  }, [search, expandedParents, filteredParents]);

  const toggleParent = (parentId) => {
    setExpandedParents((prev) => {
      const next = new Set(prev);
      if (next.has(parentId)) next.delete(parentId);
      else next.add(parentId);
      return next;
    });
  };

  const selectValue = (slug) => {
    setSelectedService(slug);
    setOpen(false);
    setSearch('');
  };

  // Get display name for trigger
  const selectedName = useMemo(() => {
    if (!selectedService) return null;
    return categories.find((c) => c.slug === selectedService)?.name || null;
  }, [selectedService, categories]);

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background hover:border-orange-400 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <span className={selectedName ? 'text-foreground truncate' : 'text-muted-foreground truncate'}>
          {selectedName || 'All Businesses'}
        </span>
        <ChevronDown className={`h-4 w-4 opacity-50 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 mt-1 w-72 sm:w-80 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-[50vh] flex flex-col">
          {/* Search */}
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-orange-400 bg-slate-50 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Options list */}
          <div className="overflow-y-auto flex-1 p-1">
            {/* All Businesses option */}
            <button
              type="button"
              onClick={() => selectValue('')}
              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                !selectedService ? 'bg-orange-50 text-orange-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              All Businesses
            </button>

            {/* Parent categories with collapsible subcategories */}
            {filteredParents.map((parent) => {
              const subs = getSubcategories(parent.id);
              const isExpanded = effectiveExpanded.has(parent.id);
              const filteredSubs = search
                ? subs.filter((s) => s.name.toLowerCase().includes(searchLower))
                : subs;
              const displaySubs = search && filteredSubs.length > 0 ? filteredSubs : subs;

              return (
                <div key={parent.id} className="mt-0.5">
                  {/* Parent row */}
                  <div className="flex items-center">
                    {subs.length > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleParent(parent.id)}
                        className="p-1 rounded hover:bg-slate-100 flex-shrink-0"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => selectValue(parent.slug)}
                      className={`flex-1 text-left px-2 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                        selectedService === parent.slug
                          ? 'bg-orange-50 text-orange-700'
                          : 'text-[#0D1B2A] hover:bg-slate-50'
                      }`}
                    >
                      {parent.name}
                    </button>
                  </div>

                  {/* Subcategories (collapsible) */}
                  {isExpanded && displaySubs.length > 0 && (
                    <div className="ml-5 border-l-2 border-slate-100 pl-1 mb-1">
                      {displaySubs.map((sub) => (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => selectValue(sub.slug)}
                          className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${
                            selectedService === sub.slug
                              ? 'bg-orange-50 text-orange-700 font-medium'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Standalone categories */}
            {filteredStandalone.length > 0 && (
              <>
                {filteredParents.length > 0 && <div className="border-t border-slate-100 my-1.5" />}
                {filteredStandalone.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => selectValue(cat.slug)}
                    className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${
                      selectedService === cat.slug
                        ? 'bg-orange-50 text-orange-700 font-medium'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </>
            )}

            {filteredParents.length === 0 && filteredStandalone.length === 0 && (
              <p className="text-center text-sm text-slate-400 py-4">No categories found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FilterPanel({
  categories,
  selectedCountry,
  setSelectedCountry,
  selectedState,
  setSelectedState,
  selectedCity,
  setSelectedCity,
  selectedService,
  setSelectedService,
  selectedTeamSize,
  setSelectedTeamSize,
  selectedRating,
  setSelectedRating,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleReset = () => {
    setSelectedCountry('');
    setSelectedState('');
    setSelectedCity('');
    setSelectedService('');
    setSelectedTeamSize('');
    setSelectedRating('');
  };

  const activeFiltersCount = [
    selectedCountry,
    selectedState,
    selectedCity,
    selectedService,
    selectedTeamSize,
    selectedRating,
  ].filter(Boolean).length;

  return (
    <div className="bg-white border-b border-slate-200 sticky top-16 sm:top-20 z-40">
      <div className="w-full px-4 sm:px-6 lg:px-10 py-3">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
            {/* Country */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-widest">Country</label>
              <Select
                value={selectedCountry}
                onValueChange={(val) => {
                  setSelectedCountry(val === '__all__' ? '' : val);
                  setSelectedState('');
                  setSelectedCity('');
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
                  onValueChange={(val) => {
                    setSelectedState(val === '__all__' ? '' : val);
                    setSelectedCity('');
                  }}
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

            {/* City */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-widest">City</label>
              {selectedState && CITIES_BY_STATE[selectedState]?.length > 0 ? (
                <Select
                  value={selectedCity}
                  onValueChange={(val) => setSelectedCity(val === '__all__' ? '' : val)}
                >
                  <SelectTrigger className="w-full bg-white border-slate-200 text-sm h-9 hover:border-orange-400">
                    <MapPin className="w-3.5 h-3.5 mr-2 text-slate-400 flex-shrink-0" />
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All Cities</SelectItem>
                    {CITIES_BY_STATE[selectedState].map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select disabled={!selectedState}>
                  <SelectTrigger className="w-full bg-white border-slate-200 text-sm h-9 disabled:opacity-40">
                    <MapPin className="w-3.5 h-3.5 mr-2 text-slate-400 flex-shrink-0" />
                    <SelectValue placeholder={selectedState ? 'No cities available' : 'Select a state first'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All Cities</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Services / Products */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-widest">Services / Products</label>
              <ServiceProductSelect
                categories={categories}
                selectedService={selectedService}
                setSelectedService={setSelectedService}
              />
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
            {activeFiltersCount > 0 && (
              <div className="flex gap-2 items-end">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="px-3 h-9 text-sm border-slate-200 text-slate-600 hover:border-slate-300"
                  title="Reset filters"
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
