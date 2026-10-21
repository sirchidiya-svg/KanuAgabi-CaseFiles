/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, X, Filter, Tag } from 'lucide-react';
import { FileStatus } from '../types';

export type RemarkFilterType = 'ALL' | 'NO_ACTION' | 'HAS_ACTION';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: 'ALL' | FileStatus;
  onStatusFilterChange: (status: 'ALL' | FileStatus) => void;
  shelfFilter: string;
  onShelfFilterChange: (shelf: string) => void;
  remarkFilter: RemarkFilterType;
  onRemarkFilterChange: (filter: RemarkFilterType) => void;
  shelves: string[];
  totalResults: number;
  onClearFilters: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  shelfFilter,
  onShelfFilterChange,
  remarkFilter,
  onRemarkFilterChange,
  shelves,
  totalResults,
  onClearFilters,
}) => {
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    statusFilter !== 'ALL' ||
    shelfFilter !== 'ALL' ||
    remarkFilter !== 'ALL';

  return (
    <div className="sticky top-0 z-30 border-b-2 border-black bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
          {/* Main Global Search Input */}
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-black" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search across all courts by Suit Number (e.g. SC/CV/1042), Title, Shelf, Counsel..."
              className="w-full border-2 border-black bg-white py-2 pl-9 pr-9 text-xs sm:text-sm text-black placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-black"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-black hover:opacity-70 cursor-pointer"
                aria-label="Clear search query"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Secondary Controls: Status Filter, Shelf Filter, Remark/Asterisk Tag Filter & Matches */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center gap-1 border border-black bg-white px-2 py-1.5 text-xs flex-1 sm:flex-none justify-between sm:justify-start">
              <span className="flex items-center gap-1">
                <Filter className="h-3 w-3 text-black" />
                <span className="font-bold uppercase text-[11px]">Status:</span>
              </span>
              <select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value as 'ALL' | FileStatus)}
                className="bg-white text-xs font-bold uppercase text-black focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Concluded">Concluded</option>
                <option value="Abandoned">Abandoned</option>
              </select>
            </div>

            {/* Remark / Asterisk Tag Filter */}
            <div className="flex items-center gap-1 border border-black bg-white px-2 py-1.5 text-xs flex-1 sm:flex-none justify-between sm:justify-start">
              <span className="flex items-center gap-1">
                <Tag className="h-3 w-3 text-black" />
                <span className="font-bold uppercase text-[11px]">Remark:</span>
              </span>
              <select
                value={remarkFilter}
                onChange={(e) => onRemarkFilterChange(e.target.value as RemarkFilterType)}
                className="bg-white text-xs font-bold uppercase text-black focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Remarks</option>
                <option value="NO_ACTION">No Remark / Asterisk (*)</option>
                <option value="HAS_ACTION">Action Recorded</option>
              </select>
            </div>

            {/* Shelf Filter */}
            <div className="flex items-center gap-1 border border-black bg-white px-2 py-1.5 text-xs flex-1 sm:flex-none justify-between sm:justify-start">
              <span className="font-bold uppercase text-[11px]">Shelf:</span>
              <select
                value={shelfFilter}
                onChange={(e) => onShelfFilterChange(e.target.value)}
                className="bg-white text-xs font-bold uppercase text-black focus:outline-none cursor-pointer max-w-[120px] truncate"
              >
                <option value="ALL">All Shelves</option>
                {shelves.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="border border-black bg-black px-2.5 py-1.5 text-xs font-bold uppercase text-white hover:bg-neutral-800 cursor-pointer"
              >
                Reset
              </button>
            )}

            <div className="border border-black bg-neutral-100 px-2.5 py-1.5 text-[11px] font-bold uppercase shrink-0">
              Matching: {totalResults}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
