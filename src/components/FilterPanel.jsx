import React, { useState } from 'react';
import { MapPin, Users, Star, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function FilterPanel({ 
  categories,
  selectedLocation, 
  setSelectedLocation,
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
    setSelectedLocation('');
    setSelectedService('');
    setSelectedTeamSize('');
    setSelectedRating('');
  };

  const activeFiltersCount = [
    selectedLocation,
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-3">
            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Location</label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-full bg-slate-50 border-slate-200 hover:bg-white">
                  <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>All Locations</SelectItem>
                  <SelectItem value="Mumbai">Mumbai</SelectItem>
                  <SelectItem value="Bangalore">Bangalore</SelectItem>
                  <SelectItem value="Delhi">Delhi</SelectItem>
                  <SelectItem value="Pune">Pune</SelectItem>
                  <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                  <SelectItem value="Chennai">Chennai</SelectItem>
                  <SelectItem value="Kolkata">Kolkata</SelectItem>
                  <SelectItem value="Ahmedabad">Ahmedabad</SelectItem>
                  <SelectItem value="Gurgaon">Gurgaon</SelectItem>
                  <SelectItem value="Noida">Noida</SelectItem>
                  <SelectItem value="Chandigarh">Chandigarh</SelectItem>
                  <SelectItem value="Kochi">Kochi</SelectItem>
                </SelectContent>
              </Select>
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