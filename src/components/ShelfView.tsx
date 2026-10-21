/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CaseFile, UserSession } from '../types';
import { RemarkDisplay } from '../utils/remarkHelper';
import { Layers, MapPin, ExternalLink, ArrowRightLeft } from 'lucide-react';

interface ShelfViewProps {
  files: CaseFile[];
  session: UserSession;
  onViewDocket: (file: CaseFile) => void;
  onCheckOutFile: (file: CaseFile) => void;
  onEditFile: (file: CaseFile) => void;
}

export const ShelfView: React.FC<ShelfViewProps> = ({
  files,
  session,
  onViewDocket,
  onCheckOutFile,
  onEditFile,
}) => {
  const isAdmin = session.role === 'ADMIN' || session.role === 'SUPER_ADMIN';

  // Group files by ShelfNumber
  const shelfMap: Record<string, CaseFile[]> = {};

  files.forEach((file) => {
    const shelf = file.shelfNumber?.trim() || 'Unassigned Shelf';
    if (!shelfMap[shelf]) {
      shelfMap[shelf] = [];
    }
    shelfMap[shelf].push(file);
  });

  // If no files present, provide standard file room defaults
  if (Object.keys(shelfMap).length === 0) {
    ['Shelf A1', 'Shelf A2', 'Shelf B1', 'Shelf B2', 'Shelf C1', 'Archive Rack 1'].forEach((s) => {
      shelfMap[s] = [];
    });
  }

  const sortedShelves = Object.keys(shelfMap).sort((a, b) => a.localeCompare(b));
  const [selectedShelf, setSelectedShelf] = useState<string>(sortedShelves[0] || 'Shelf A1');

  // Keep selected shelf valid if shelves change
  const currentShelf = shelfMap[selectedShelf] ? selectedShelf : (sortedShelves[0] || 'Shelf A1');
  const activeShelfFiles = shelfMap[currentShelf] || [];

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-5">
      {/* Title */}
      <div className="mb-5 border-b-2 border-black pb-4">
        <h2 className="text-base sm:text-xl font-bold uppercase tracking-tight text-black">
          Physical File Room & Shelf Inventory
        </h2>
        <p className="text-xs uppercase tracking-wider text-black mt-0.5">
          Physical Rack Location Navigator · Map files to tangible shelves in File Room 1, File Room 2 & Archive Bins
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        {/* Left: Shelf Directory List */}
        <div className="border-2 border-black bg-white p-3 lg:col-span-1">
          <div className="border-b border-black pb-2 text-xs font-bold uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layers className="h-4 w-4" />
              Physical Shelves ({sortedShelves.length})
            </span>
          </div>

          <div className="mt-3 space-y-1 max-h-[600px] overflow-y-auto">
            {sortedShelves.map((shelf) => {
              const count = (shelfMap[shelf] || []).length;
              const isSelected = selectedShelf === shelf;
              return (
                <button
                  key={shelf}
                  onClick={() => setSelectedShelf(shelf)}
                  className={`w-full text-left px-3 py-2 text-xs font-bold uppercase transition flex items-center justify-between cursor-pointer border ${
                    isSelected
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-black/30 hover:bg-neutral-100'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {shelf}
                  </span>
                  <span className="text-[11px]">
                    {count} {count === 1 ? 'file' : 'files'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Files on Selected Shelf */}
        <div className="border-2 border-black bg-white p-5 lg:col-span-3">
          <div className="border-b-2 border-black pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-xs uppercase font-bold text-neutral-500">
                Current Inspected Location
              </div>
              <h3 className="text-xl font-bold uppercase tracking-tight text-black flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {selectedShelf || 'No Shelf Selected'}
              </h3>
            </div>
            <div className="border border-black px-3 py-1 text-xs font-bold uppercase bg-white">
              Total Housed: {activeShelfFiles.length} Physical Records
            </div>
          </div>

          {activeShelfFiles.length === 0 ? (
            <div className="p-8 text-center text-xs uppercase text-black border-2 border-black mt-4 bg-neutral-50">
              <div className="font-bold text-sm">No Files Currently Registered on {selectedShelf}</div>
              <p className="mt-1 text-neutral-600">
                This shelf location is active and ready to house physical jackets indexed from your typed case file records.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {activeShelfFiles.map((file, idx) => (
                <div
                  key={file.id || `${file.suitNumber}-${idx}`}
                  className="border border-black p-4 hover:bg-neutral-50 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-black pb-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-black border border-black px-1.5 py-0.5 bg-neutral-100">
                        {file.suitNumber}
                      </span>
                      <h4 className="mt-1 text-sm font-bold uppercase tracking-wide text-black">
                        {file.caseTitle}
                      </h4>
                      <div className="text-xs uppercase text-black font-semibold mt-0.5">
                        {file.courtName}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="border border-black px-2 py-0.5 text-xs font-bold uppercase">
                        [{file.status}]
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-bold uppercase">File Room / Bay: </span>
                      <span>{file.boxOrBay || 'General Stacks'}</span>
                    </div>
                    <div>
                      <span className="font-bold uppercase">Assigned Counsel: </span>
                      <span>{file.assignedCounsel || 'Unassigned'}</span>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-black border-t border-black/20 pt-2">
                    <span className="font-bold uppercase text-[10px] text-neutral-600 block mb-1">
                      Physical Notes & Remarks:
                    </span>
                    <RemarkDisplay remark={file.remark} />
                  </div>

                  <div className="mt-3 flex items-center justify-end gap-2 border-t border-black pt-2">
                    <button
                      onClick={() => onViewDocket(file)}
                      className="border border-black px-2.5 py-1 text-xs font-bold uppercase text-black hover:bg-black hover:text-white cursor-pointer flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Docket
                    </button>
                    <button
                      onClick={() => onCheckOutFile(file)}
                      className="border border-black px-2.5 py-1 text-xs font-bold uppercase text-black hover:bg-black hover:text-white cursor-pointer flex items-center gap-1"
                    >
                      <ArrowRightLeft className="h-3 w-3" />
                      Check Out
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => onEditFile(file)}
                        className="border border-black bg-black px-2.5 py-1 text-xs font-bold uppercase text-white hover:bg-neutral-800 cursor-pointer"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
