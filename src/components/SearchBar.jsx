'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createPageUrl, getDirectoryUrl } from '@/utils';

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    router.push(getDirectoryUrl() + (params.toString() ? '?' + params.toString() : ''));
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full">
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          type="text"
          placeholder="Search agencies, services, or locations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12 bg-white/95 border-white/20 text-slate-900 placeholder:text-slate-500 rounded-xl"
        />
      </div>
      <Button
        type="submit"
        className="h-12 px-8 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-semibold shrink-0"
      >
        Search
      </Button>
    </form>
  );
}
