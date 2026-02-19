import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Menu, X, Search, MapPin, ChevronDown, Facebook, Twitter, Linkedin, Instagram, Mail
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ListAgencyDialog from './components/ListAgencyDialog';

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [listAgencyOpen, setListAgencyOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedParentId, setSelectedParentId] = useState(null);
  const navigate = useNavigate();

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.list(),
  });

  const topLocations = ['Mumbai', 'Bangalore', 'Delhi', 'Pune', 'Hyderabad', 'Chennai'];

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedLocation) params.append('location', selectedLocation);
    navigate(createPageUrl('Directory') + '?' + params.toString());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-20 gap-8">
                {/* Modern Logo */}
                <Link to={createPageUrl('Home')} className="flex items-center gap-3 flex-shrink-0">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none">
                        <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" fill="currentColor" opacity="0.3"/>
                        <path d="M8 8h3v3M16 8h3v3M8 19h3v3M16 19h3v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full"></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight tracking-tight">
                      FirmsLedger
                    </span>
                    <span className="text-[10px] text-slate-600 font-semibold leading-tight tracking-wide">
                      BUSINESS DIRECTORY
                    </span>
                  </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-8 flex-1 justify-end">
                  <DropdownMenu>
                            <DropdownMenuTrigger 
                              className="flex items-center gap-1 text-slate-700 hover:text-blue-600 font-semibold transition-colors text-sm"
                              aria-label="Find Services Menu"
                            >
                              Find Services
                              <ChevronDown className="w-4 h-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[600px] p-4" align="start">
                              <div className="grid grid-cols-1 gap-4">
                                {/* Staffing Companies with Subcategories */}
                                {categories
                                  .filter(cat => cat.is_parent && cat.slug === 'staffing-companies')
                                  .map((parent) => {
                                    const subcats = categories.filter(c => c.parent_id === parent.id).sort((a, b) => (a.order || 0) - (b.order || 0));
                                    return (
                                      <div key={parent.id} className="border-b pb-4">
                                        <Link
                                          to={createPageUrl('Directory') + `?category=${parent.slug}`}
                                          className="flex items-start gap-3 px-3 py-3 text-sm text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mb-2"
                                          onClick={(e) => {
                                            e.currentTarget.blur();
                                            document.activeElement?.blur();
                                          }}
                                        >
                                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-bold text-blue-600">{parent.name.charAt(0)}</span>
                                          </div>
                                          <div className="flex flex-col">
                                            <span className="font-semibold text-slate-900">{parent.name}</span>
                                            <span className="text-xs text-slate-500">{parent.description}</span>
                                          </div>
                                        </Link>
                                        {subcats.length > 0 && (
                                          <div className="grid grid-cols-2 gap-2 pl-3 mt-2">
                                            {subcats.map(subcat => (
                                              <Link
                                                key={subcat.id}
                                                to={createPageUrl('Directory') + `?category=${subcat.slug}`}
                                                className="px-3 py-2 text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                onClick={(e) => {
                                                  e.currentTarget.blur();
                                                  document.activeElement?.blur();
                                                }}
                                              >
                                                {subcat.name}
                                              </Link>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}

                                {/* Other Parent Categories */}
                                <div className="grid grid-cols-2 gap-2">
                                  {categories
                                    .filter(cat => cat.is_parent && cat.slug !== 'staffing-companies')
                                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                                    .map((cat) => (
                                      <Link
                                        key={cat.id}
                                        to={createPageUrl('Directory') + `?category=${cat.slug}`}
                                        className="flex items-start gap-3 px-3 py-3 text-sm text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        onClick={(e) => {
                                          e.currentTarget.blur();
                                          document.activeElement?.blur();
                                        }}
                                      >
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                                          <span className="text-xs font-bold text-blue-600">{cat.name.charAt(0)}</span>
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="font-semibold text-slate-900">{cat.name}</span>
                                          <span className="text-xs text-slate-500 line-clamp-1">{cat.description}</span>
                                        </div>
                                      </Link>
                                    ))}
                                </div>
                              </div>
                            </DropdownMenuContent>
                          </DropdownMenu>

                  <Link to={createPageUrl('Blogs')} className="text-slate-700 hover:text-blue-600 font-semibold transition-colors text-sm">
                    Resources
                  </Link>

                  <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && navigate(createPageUrl('Directory') + '?search=' + searchQuery)}
                      className="bg-transparent border-none outline-none text-sm w-32"
                    />
                  </div>

                  <Button 
                    variant="ghost"
                    onClick={() => navigate(createPageUrl('WriteReview'))}
                    className="text-slate-700 hover:text-blue-600 font-semibold"
                  >
                    Write a Review
                  </Button>

                  <Button 
                    variant="outline"
                    onClick={() => base44.auth.redirectToLogin()}
                    className="border-slate-300 text-slate-700 hover:text-blue-600 font-semibold"
                  >
                    Sign In
                  </Button>

                  <Button 
                    data-list-agency-btn
                    onClick={() => setListAgencyOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg px-6 font-semibold"
                  >
                    Get Listed
                  </Button>
                </nav>

                {/* Mobile Menu Button */}
                <button 
                  className="lg:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col gap-3">
                <div className="text-gray-700 font-medium py-2">Find a Service</div>
                <div className="pl-4 flex flex-col gap-2 max-h-64 overflow-y-auto">
                  {categories.filter(cat => cat.is_parent || !cat.parent_id).map((cat) => (
                    <Link
                      key={cat.id}
                      to={createPageUrl('Directory') + `?category=${cat.slug}`}
                      className="text-gray-600 hover:text-blue-600 py-1 text-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
                <Link 
                  to={createPageUrl('Directory')} 
                  className="text-gray-700 hover:text-blue-600 py-2 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse Agencies
                </Link>
                <Button 
                  onClick={() => {
                    setListAgencyOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  List Your Agency
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* List Agency Dialog */}
      <ListAgencyDialog open={listAgencyOpen} onOpenChange={setListAgencyOpen} />

      {/* Modern Footer */}
      <footer className="bg-slate-900 text-white mt-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-slate-900"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            <div className="lg:col-span-2">
              <Link to={createPageUrl('Home')} className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none">
                    <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" fill="currentColor" opacity="0.3"/>
                    <path d="M8 8h3v3M16 8h3v3M8 19h3v3M16 19h3v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  FirmsLedger
                </span>
              </Link>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed max-w-sm">
                India's most trusted platform to discover and connect with verified business service providers. Make confident decisions for your business growth.
              </p>
              <div className="flex items-center gap-3">
                <a href="#" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all hover:-translate-y-1">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all hover:-translate-y-1">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all hover:-translate-y-1">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all hover:-translate-y-1">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-white text-sm uppercase tracking-wider">Platform</h4>
              <div className="flex flex-col gap-3 text-sm">
                <Link to={createPageUrl('Home')} className="text-slate-400 hover:text-blue-400 transition-colors">Home</Link>
                <Link to={createPageUrl('Directory')} className="text-slate-400 hover:text-blue-400 transition-colors">Browse Agencies</Link>
                <Link to={createPageUrl('Blogs')} className="text-slate-400 hover:text-blue-400 transition-colors">Blog</Link>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-white text-sm uppercase tracking-wider">Top Categories</h4>
              <div className="flex flex-col gap-3 text-sm">
                {categories.slice(0, 5).map((cat) => (
                  <Link key={cat.id} to={createPageUrl('Directory') + `?category=${cat.slug}`} className="text-slate-400 hover:text-blue-400 transition-colors">
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-white text-sm uppercase tracking-wider">Top Locations</h4>
              <div className="flex flex-col gap-3 text-sm">
                {topLocations.map((loc) => (
                  <Link key={loc} to={createPageUrl('Directory') + `?location=${loc}`} className="text-slate-400 hover:text-blue-400 transition-colors">
                    {loc}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-slate-500 text-sm">
                © 2026 FirmsLedger. All rights reserved.
              </p>
              <div className="flex items-center gap-6 text-sm">
                <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Terms of Service</a>
                <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Privacy Policy</a>
                <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}