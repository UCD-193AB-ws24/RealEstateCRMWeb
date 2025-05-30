"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState, useEffect } from "react";

const LEAD_STATUSES = [
  { value: "all", label: "All Statuses" },
  { value: "lead", label: "Lead" },
  { value: "contact", label: "Contact" },
  { value: "offer", label: "Offer" },
  { value: "sale", label: "Sale" },
];

export default function SearchAndFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(searchParams.get('search') ?? '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchValue);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  // Handle debounced search
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      params.set('search', debouncedSearch);
    } else {
      params.delete('search');
    }
    router.push(`/leads?${params.toString()}`);
  }, [debouncedSearch, router, searchParams]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set('status', value);
    } else {
      params.delete('status');
    }
    router.push(`/leads?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('status');
    params.delete('search');
    setSearchValue('');
    router.push(`/leads?${params.toString()}`);
  };

  const hasActiveFilters = searchParams.get('status') || searchParams.get('search');

  return (
    <div className="space-y-4 mb-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-xl">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search leads by name, address, city, state, or owner..."
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 h-11 w-full rounded-lg border-slate-200 focus:border-[#7C3AED] focus:ring-2 focus:ring-[#926bf4] transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            {searchValue && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`h-11 px-4 gap-2 ${isFilterOpen ? 'bg-[#926bf4]/20 border-[#926bf4]/50' : ''}`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="ml-1 px-2 py-0.5 text-xs font-medium bg-[#926bf4]/20 text-[#7C3AED] rounded-full">
                Active
              </span>
            )}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="h-11 px-4 text-slate-600 hover:text-slate-900"
            >
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {isFilterOpen && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <Select
                defaultValue={searchParams.get('status') ?? 'all'}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchParams.get('search') && (
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-[#926bf4]/20 text-[#7C3AED] rounded-full text-sm">
              <span>Search: {searchParams.get('search')}</span>
              <button
                onClick={() => handleSearch('')}
                className="ml-1 hover:text-[#6b31ce]"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {searchParams.get('status') && searchParams.get('status') !== 'all' && (
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-[#926bf4]/20 text-[#7C3AED] rounded-full text-sm">
              <span>Status: {LEAD_STATUSES.find(s => s.value === searchParams.get('status'))?.label}</span>
              <button
                onClick={() => handleStatusChange('all')}
                className="ml-1 hover:text-[#6b31ce]"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 