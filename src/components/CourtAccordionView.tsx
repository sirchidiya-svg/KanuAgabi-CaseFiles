/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { CaseFile, CourtSummary, UserSession, FileStatus } from '../types';
import { RemarkDisplay, isRemarkEmptyOrAsterisk } from '../utils/remarkHelper';
import {
  Edit2,
  Trash2,
  ExternalLink,
  ArrowRightLeft,
  Copy,
  Check,
  Search,
  X,
  ArrowLeft,
  ArrowRight,
  Filter,
  Plus,
  Building2,
  FileText,
  Tag,
} from 'lucide-react';

interface CourtAccordionViewProps {
  courtSummaries: CourtSummary[];
  searchQuery: string;
  session: UserSession;
  onEditFile: (file: CaseFile) => void;
  onDeleteFile: (file: CaseFile) => void;
  onCheckOutFile: (file: CaseFile) => void;
  onViewDocket: (file: CaseFile) => void;
  onOpenAddModal?: (courtName?: string) => void;
}

export const CourtAccordionView: React.FC<CourtAccordionViewProps> = ({
  courtSummaries,
  searchQuery: _searchQuery,
  session,
  onEditFile,
  onDeleteFile,
  onCheckOutFile,
  onViewDocket,
  onOpenAddModal,
}) => {
  const isAdmin = session.role === 'ADMIN' || session.role === 'SUPER_ADMIN';

  // Active Court Webpage State: null = Directory of all courts, string = dedicated court page
  const [selectedCourtName, setSelectedCourtName] = useState<string | null>(null);

  // In-court local filters
  const [inCourtSearch, setInCourtSearch] = useState('');
  const [inCourtStatus, setInCourtStatus] = useState<'ALL' | FileStatus>('ALL');
  const [inCourtShelf, setInCourtShelf] = useState('ALL');
  const [inCourtRemark, setInCourtRemark] = useState<'ALL' | 'NO_ACTION' | 'HAS_ACTION'>('ALL');

  const [copiedSuit, setCopiedSuit] = useState<string | null>(null);

  // Reset local filters when switching courts
  useEffect(() => {
    setInCourtSearch('');
    setInCourtStatus('ALL');
    setInCourtShelf('ALL');
    setInCourtRemark('ALL');
  }, [selectedCourtName]);

  const handleCopy = (suitNumber: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(suitNumber);
    setCopiedSuit(suitNumber);
    setTimeout(() => setCopiedSuit(null), 1800);
  };

  // Find the selected court summary object
  const activeCourt = useMemo(() => {
    if (!selectedCourtName) return null;
    return courtSummaries.find((c) => c.courtName === selectedCourtName) || null;
  }, [selectedCourtName, courtSummaries]);

  // Unique shelves in the active court
  const activeCourtShelves = useMemo(() => {
    if (!activeCourt) return [];
    const set = new Set<string>();
    activeCourt.files.forEach((f) => {
      if (f.shelfNumber?.trim()) set.add(f.shelfNumber.trim());
    });
    return Array.from(set).sort();
  }, [activeCourt]);

  // Filtered files in the active court
  const activeCourtDisplayFiles = useMemo(() => {
    if (!activeCourt) return [];
    const q = inCourtSearch.toLowerCase().trim();

    return activeCourt.files.filter((file) => {
      if (q) {
        const suit = (file.suitNumber || '').toLowerCase();
        const title = (file.caseTitle || '').toLowerCase();
        const shelf = (file.shelfNumber || '').toLowerCase();
        const remark = (file.remark || '').toLowerCase();
        const counsel = (file.assignedCounsel || '').toLowerCase();
        const matches =
          suit.includes(q) ||
          title.includes(q) ||
          shelf.includes(q) ||
          remark.includes(q) ||
          counsel.includes(q);
        if (!matches) return false;
      }

      if (inCourtStatus !== 'ALL' && file.status !== inCourtStatus) {
        return false;
      }

      if (inCourtShelf !== 'ALL' && file.shelfNumber !== inCourtShelf) {
        return false;
      }

      // Filter by Remark / Asterisk status
      if (inCourtRemark === 'NO_ACTION' && !isRemarkEmptyOrAsterisk(file.remark)) {
        return false;
      }
      if (inCourtRemark === 'HAS_ACTION' && isRemarkEmptyOrAsterisk(file.remark)) {
        return false;
      }

      return true;
    });
  }, [activeCourt, inCourtSearch, inCourtStatus, inCourtShelf, inCourtRemark]);

  // =========================================================================
  // VIEW 1: DEDICATED COURT JURISDICTION WEBPAGE (When court is clicked)
  // =========================================================================
  if (selectedCourtName && activeCourt) {
    const hasLocalFilters =
      inCourtSearch !== '' ||
      inCourtStatus !== 'ALL' ||
      inCourtShelf !== 'ALL' ||
      inCourtRemark !== 'ALL';

    return (
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-5">
        {/* Navigation Breadcrumb & Back Bar */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-3">
          <button
            onClick={() => setSelectedCourtName(null)}
            className="flex items-center gap-2 border-2 border-black bg-black px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 transition cursor-pointer self-start sm:self-auto min-h-[38px]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to All Jurisdictions
          </button>

          <div className="text-[11px] uppercase font-bold text-neutral-600 flex items-center gap-1.5 flex-wrap">
            <span>Chambers Registry</span>
            <span>/</span>
            <span>Jurisdictions</span>
            <span>/</span>
            <span className="text-black underline">{activeCourt.courtName}</span>
          </div>
        </div>

        {/* Dedicated Court Webpage Header Banner */}
        <div className="border-4 border-black bg-white p-5 sm:p-7 shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b-2 border-black pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="border border-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-neutral-100">
                  Jurisdiction Webpage
                </span>
                <span className="text-xs uppercase tracking-widest text-black">
                  Kanu G. Agabi & Associates
                </span>
              </div>
              <h2 className="mt-1 text-xl sm:text-2xl lg:text-3xl font-bold uppercase tracking-tight text-black">
                {activeCourt.courtName}
              </h2>
              <p className="text-xs uppercase tracking-wider text-neutral-700 mt-0.5">
                Central Registry · Physical File Inventory & Active Cause Docket
              </p>
            </div>

            {isAdmin && onOpenAddModal && (
              <button
                onClick={() => onOpenAddModal(activeCourt.courtName)}
                className="flex items-center justify-center gap-1.5 border-2 border-black bg-black px-4 py-2.5 text-xs font-bold uppercase text-white hover:bg-neutral-800 transition cursor-pointer self-start lg:self-auto min-h-[40px]"
              >
                <Plus className="h-4 w-4" />
                Add Case File in this Court
              </button>
            )}
          </div>

          {/* Court Metrics Breakdown */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs uppercase font-bold text-center">
            <div className="border border-black p-2 bg-neutral-50">
              <div className="text-[10px] text-neutral-600">Total Files</div>
              <div className="text-base sm:text-lg font-bold text-black mt-0.5">{activeCourt.totalCount}</div>
            </div>
            <div className="border border-black p-2 bg-white">
              <div className="text-[10px] text-neutral-600">Active Matters</div>
              <div className="text-base sm:text-lg font-bold text-black mt-0.5">{activeCourt.activeCount}</div>
            </div>
            <div className="border border-black p-2 bg-white">
              <div className="text-[10px] text-neutral-600">Pending Appeals</div>
              <div className="text-base sm:text-lg font-bold text-black mt-0.5">{activeCourt.pendingCount}</div>
            </div>
            <div className="border border-black p-2 bg-white">
              <div className="text-[10px] text-neutral-600">Concluded</div>
              <div className="text-base sm:text-lg font-bold text-black mt-0.5">{activeCourt.concludedCount}</div>
            </div>
            <div className="border border-black p-2 bg-white col-span-2 sm:col-span-1">
              <div className="text-[10px] text-neutral-600">Abandoned</div>
              <div className="text-base sm:text-lg font-bold text-black mt-0.5">{activeCourt.abandonedCount}</div>
            </div>
          </div>
        </div>

        {/* Dedicated Court Webpage In-Jurisdiction Search & Filters Bar */}
        <div className="border-2 border-black bg-neutral-100 p-3 sm:p-4 mb-5 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-black" />
              </div>
              <input
                type="text"
                value={inCourtSearch}
                onChange={(e) => setInCourtSearch(e.target.value)}
                placeholder={`Search specifically within ${activeCourt.courtName} (Suit #, Title, Shelf, Counsel, Remarks)...`}
                className="w-full border-2 border-black bg-white py-2 pl-9 pr-9 text-xs sm:text-sm text-black placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-black"
              />
              {inCourtSearch && (
                <button
                  onClick={() => setInCourtSearch('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-black hover:opacity-70 cursor-pointer"
                  aria-label="Clear in-court search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* In-court status, shelf, and remark filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 border border-black bg-white px-2.5 py-1.5 text-xs flex-1 sm:flex-none justify-between sm:justify-start">
                <span className="flex items-center gap-1">
                  <Filter className="h-3 w-3 text-black" />
                  <span className="font-bold uppercase text-[11px]">Status:</span>
                </span>
                <select
                  value={inCourtStatus}
                  onChange={(e) => setInCourtStatus(e.target.value as 'ALL' | FileStatus)}
                  className="bg-white text-xs font-bold uppercase text-black focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Concluded">Concluded</option>
                  <option value="Abandoned">Abandoned</option>
                </select>
              </div>

              {/* In-Court Remark / Asterisk Filter */}
              <div className="flex items-center gap-1 border border-black bg-white px-2.5 py-1.5 text-xs flex-1 sm:flex-none justify-between sm:justify-start">
                <span className="flex items-center gap-1">
                  <Tag className="h-3 w-3 text-black" />
                  <span className="font-bold uppercase text-[11px]">Remark:</span>
                </span>
                <select
                  value={inCourtRemark}
                  onChange={(e) => setInCourtRemark(e.target.value as 'ALL' | 'NO_ACTION' | 'HAS_ACTION')}
                  className="bg-white text-xs font-bold uppercase text-black focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Remarks</option>
                  <option value="NO_ACTION">No Remark / Asterisk (*)</option>
                  <option value="HAS_ACTION">Action Recorded</option>
                </select>
              </div>

              {activeCourtShelves.length > 0 && (
                <div className="flex items-center gap-1 border border-black bg-white px-2.5 py-1.5 text-xs flex-1 sm:flex-none justify-between sm:justify-start">
                  <span className="font-bold uppercase text-[11px]">Shelf:</span>
                  <select
                    value={inCourtShelf}
                    onChange={(e) => setInCourtShelf(e.target.value)}
                    className="bg-white text-xs font-bold uppercase text-black focus:outline-none cursor-pointer max-w-[120px] truncate"
                  >
                    <option value="ALL">All Shelves</option>
                    {activeCourtShelves.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {hasLocalFilters && (
                <button
                  onClick={() => {
                    setInCourtSearch('');
                    setInCourtStatus('ALL');
                    setInCourtShelf('ALL');
                    setInCourtRemark('ALL');
                  }}
                  className="border border-black bg-black px-2.5 py-1.5 text-xs font-bold uppercase text-white hover:bg-neutral-800 cursor-pointer"
                >
                  Reset
                </button>
              )}

              <div className="border border-black bg-white px-3 py-1.5 text-[11px] font-bold uppercase shrink-0">
                Displaying {activeCourtDisplayFiles.length} of {activeCourt.totalCount} Cases
              </div>
            </div>
          </div>
        </div>

        {/* Case Files Records */}
        {activeCourtDisplayFiles.length === 0 ? (
          <div className="border-2 border-black bg-white p-8 text-center text-xs uppercase text-black shadow-sm">
            <FileText className="mx-auto h-8 w-8 text-neutral-400 mb-2" />
            <div className="font-bold text-sm">
              {activeCourt.totalCount === 0
                ? `No Case Files Currently Indexed Under ${activeCourt.courtName}`
                : `No Matching Case Files Found Under ${activeCourt.courtName}`}
            </div>
            <p className="mt-1 text-neutral-600 max-w-md mx-auto">
              {activeCourt.totalCount === 0
                ? 'This jurisdiction is established in the registry and ready. You can index case files into this court from your typed document.'
                : hasLocalFilters
                ? 'Try clearing or resetting active status, shelf, or search filters.'
                : 'No files are currently active under this filter.'}
            </p>
            {isAdmin && onOpenAddModal && (
              <button
                onClick={() => onOpenAddModal(activeCourt.courtName)}
                className="mt-4 inline-flex items-center gap-1.5 border-2 border-black bg-black px-4 py-2 text-xs font-bold uppercase text-white hover:bg-neutral-800 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Index Case File in {activeCourt.courtName}
              </button>
            )}
          </div>
        ) : (
          <>
            {/* MOBILE CARD VIEW (< 640px) */}
            <div className="sm:hidden space-y-3">
              {activeCourtDisplayFiles.map((file, idx) => (
                <div
                  key={file.id || `${file.suitNumber}-${idx}`}
                  className="border-2 border-black p-3.5 bg-white space-y-2.5 shadow-sm"
                >
                  {/* Header: Suit & Status */}
                  <div className="flex items-start justify-between gap-2 border-b border-black pb-2">
                    <div>
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-black">
                        <span>{file.suitNumber}</span>
                        <button
                          onClick={(e) => handleCopy(file.suitNumber, e)}
                          title="Copy Suit Number"
                          className="p-1 hover:opacity-60 cursor-pointer"
                        >
                          {copiedSuit === file.suitNumber ? (
                            <Check className="h-3.5 w-3.5 text-black" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-black" />
                          )}
                        </button>
                      </div>
                      {file.dateAdded && (
                        <div className="text-[10px] uppercase text-neutral-600 mt-0.5">
                          Enrolled: {file.dateAdded}
                        </div>
                      )}
                    </div>

                    <span className="border border-black px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-black text-white shrink-0">
                      {file.status}
                    </span>
                  </div>

                  {/* Case Title */}
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                      Case Title / Parties
                    </div>
                    <div className="text-sm font-bold uppercase text-black leading-snug mt-0.5">
                      {file.caseTitle}
                    </div>
                  </div>

                  {/* Meta: Shelf & Counsel */}
                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-black/30 pt-2">
                    <div>
                      <span className="font-bold uppercase text-neutral-600">Physical Shelf:</span>
                      <div className="font-bold text-black">{file.shelfNumber}</div>
                      {file.boxOrBay && (
                        <div className="text-[10px] text-neutral-600 uppercase">{file.boxOrBay}</div>
                      )}
                    </div>
                    <div>
                      <span className="font-bold uppercase text-neutral-600">Counsel:</span>
                      <div className="text-black leading-tight">{file.assignedCounsel || 'Registry'}</div>
                    </div>
                  </div>

                  {/* Remarks with requested tag */}
                  <div className="text-xs text-black border-t border-black/30 pt-2 leading-relaxed">
                    <span className="font-bold uppercase text-[10px] text-neutral-600 block mb-1">Remarks:</span>
                    <RemarkDisplay remark={file.remark} />
                  </div>

                  {/* Action Buttons */}
                  <div className="border-t-2 border-black pt-2 flex flex-wrap gap-1.5">
                    <button
                      onClick={() => onViewDocket(file)}
                      className="flex-1 min-h-[38px] border border-black bg-white px-2.5 py-1.5 text-xs font-bold uppercase text-black hover:bg-neutral-100 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Docket
                    </button>
                    <button
                      onClick={() => onCheckOutFile(file)}
                      className="flex-1 min-h-[38px] border border-black bg-white px-2.5 py-1.5 text-xs font-bold uppercase text-black hover:bg-neutral-100 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ArrowRightLeft className="h-3.5 w-3.5" />
                      Move
                    </button>
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => onEditFile(file)}
                          className="flex-1 min-h-[38px] border border-black bg-white px-2.5 py-1.5 text-xs font-bold uppercase text-black hover:bg-neutral-100 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => onDeleteFile(file)}
                          className="flex-1 min-h-[38px] border border-black bg-black px-2.5 py-1.5 text-xs font-bold uppercase text-white hover:bg-neutral-800 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* TABLET & PC TABLE VIEW (>= 640px) */}
            <div className="hidden sm:block border-2 border-black bg-white overflow-x-auto shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-black bg-black text-white uppercase tracking-wider">
                    <th className="py-2.5 px-3 font-bold w-44">Suit Number</th>
                    <th className="py-2.5 px-3 font-bold">Case Title & Parties</th>
                    <th className="py-2.5 px-3 font-bold w-36">Physical Shelf</th>
                    <th className="py-2.5 px-3 font-bold w-28">Status</th>
                    <th className="py-2.5 px-3 font-bold">Remarks & Instructions</th>
                    <th className="py-2.5 px-3 font-bold w-40 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black">
                  {activeCourtDisplayFiles.map((file, idx) => (
                    <tr
                      key={file.id || `${file.suitNumber}-${idx}`}
                      className="hover:bg-neutral-50 transition"
                    >
                      {/* Suit Number */}
                      <td className="py-3 px-3 align-top font-bold text-black border-r border-black/30">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono tracking-tight text-xs font-bold">
                            {file.suitNumber}
                          </span>
                          <button
                            onClick={(e) => handleCopy(file.suitNumber, e)}
                            title="Copy Suit Number"
                            className="p-0.5 hover:opacity-60 cursor-pointer"
                          >
                            {copiedSuit === file.suitNumber ? (
                              <Check className="h-3 w-3 text-black" />
                            ) : (
                              <Copy className="h-3 w-3 text-black" />
                            )}
                          </button>
                        </div>
                        {file.dateAdded && (
                          <div className="text-[10px] uppercase text-neutral-600 mt-1">
                            Enrolled: {file.dateAdded}
                          </div>
                        )}
                      </td>

                      {/* Case Title */}
                      <td className="py-3 px-3 align-top border-r border-black/30">
                        <div className="font-bold text-black uppercase leading-tight">
                          {file.caseTitle}
                        </div>
                        {file.assignedCounsel && (
                          <div className="text-[11px] text-neutral-700 mt-1">
                            <span className="font-bold uppercase">Counsel:</span> {file.assignedCounsel}
                          </div>
                        )}
                      </td>

                      {/* Physical Shelf */}
                      <td className="py-3 px-3 align-top border-r border-black/30">
                        <div className="border border-black bg-white px-2 py-1 text-center font-bold uppercase tracking-wider text-black">
                          {file.shelfNumber}
                        </div>
                        {file.boxOrBay && (
                          <div className="text-[10px] text-center text-neutral-600 uppercase mt-1">
                            {file.boxOrBay}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 align-top border-r border-black/30">
                        <div className="font-bold uppercase tracking-wider border-b border-black pb-0.5 inline-block">
                          [{file.status.toUpperCase()}]
                        </div>
                      </td>

                      {/* Remark with Tag */}
                      <td className="py-3 px-3 align-top text-black border-r border-black/30">
                        <RemarkDisplay remark={file.remark} />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 align-top text-right space-y-1">
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onViewDocket(file)}
                              title="Print or View File Jacket Docket"
                              className="border border-black bg-white px-2 py-1 text-[11px] font-bold uppercase text-black hover:bg-black hover:text-white cursor-pointer flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Docket
                            </button>
                            <button
                              onClick={() => onCheckOutFile(file)}
                              title="Check-Out / Track Movement"
                              className="border border-black bg-white px-2 py-1 text-[11px] font-bold uppercase text-black hover:bg-black hover:text-white cursor-pointer flex items-center gap-1"
                            >
                              <ArrowRightLeft className="h-3 w-3" />
                              Move
                            </button>
                          </div>

                          {isAdmin && (
                            <div className="flex items-center gap-1 mt-1">
                              <button
                                onClick={() => onEditFile(file)}
                                title="Edit Case File"
                                className="border border-black bg-white px-2 py-1 text-[11px] font-bold uppercase text-black hover:bg-black hover:text-white cursor-pointer flex items-center gap-1"
                              >
                                <Edit2 className="h-3 w-3" />
                                Edit
                              </button>
                              <button
                                onClick={() => onDeleteFile(file)}
                                title="Delete Case File"
                                className="border border-black bg-black px-2 py-1 text-[11px] font-bold uppercase text-white hover:bg-white hover:text-black cursor-pointer flex items-center gap-1"
                              >
                                <Trash2 className="h-3 w-3" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Bottom Return Button */}
        <div className="mt-6 border-t-2 border-black pt-4 flex justify-between items-center">
          <button
            onClick={() => setSelectedCourtName(null)}
            className="flex items-center gap-2 border-2 border-black bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-black hover:bg-neutral-100 transition cursor-pointer min-h-[38px]"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to All Jurisdictions Directory
          </button>
          <div className="text-[11px] uppercase font-bold text-neutral-600">
            {activeCourt.courtName} · Central Registry
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ALL COURTS DIRECTORY (When no court is opened)
  // Clicking any court opens its dedicated webpage
  // =========================================================================
  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-5">
      {/* Overview Bar */}
      <div className="mb-5 border-b-2 border-black pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-xl font-bold uppercase tracking-tight text-black">
            Court Jurisdictions ({courtSummaries.length} Courts Indexed)
          </h2>
          <p className="text-xs uppercase tracking-wider text-black mt-0.5">
            Select any court below to enter directly into that court&apos;s dedicated webpage and view its individual litigation case files.
          </p>
        </div>

        {isAdmin && onOpenAddModal && (
          <button
            onClick={() => onOpenAddModal()}
            className="flex items-center justify-center gap-1.5 border-2 border-black bg-black px-4 py-2 text-xs font-bold uppercase text-white hover:bg-neutral-800 transition cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Plus className="h-4 w-4" />
            Index Case File
          </button>
        )}
      </div>

      {/* Grid of Courts: Tapping any enters into that court's dedicated webpage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courtSummaries.map((summary) => (
          <div
            key={summary.courtName}
            onClick={() => setSelectedCourtName(summary.courtName)}
            className="border-2 border-black bg-white p-5 hover:bg-neutral-50 transition cursor-pointer shadow-sm hover:shadow flex flex-col justify-between group"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedCourtName(summary.courtName);
              }
            }}
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b-2 border-black pb-3">
                <div className="flex items-start gap-2.5">
                  <div className="p-1 border border-black bg-black text-white shrink-0 mt-0.5">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold uppercase tracking-tight text-black group-hover:underline">
                      {summary.courtName}
                    </h3>
                    <div className="text-[11px] uppercase tracking-wider text-neutral-600 mt-0.5">
                      Jurisdiction Registry Division
                    </div>
                  </div>
                </div>

                <span className="border border-black px-2 py-0.5 text-xs font-bold uppercase bg-neutral-100 shrink-0">
                  {summary.totalCount} {summary.totalCount === 1 ? 'File' : 'Files'}
                </span>
              </div>

              {/* Status Breakdown */}
              <div className="mt-3 grid grid-cols-4 gap-1.5 text-center text-xs">
                <div className="border border-black/40 p-1.5 bg-neutral-50">
                  <div className="text-[10px] uppercase font-bold text-neutral-600">Active</div>
                  <div className="font-bold text-black text-xs sm:text-sm mt-0.5">{summary.activeCount}</div>
                </div>
                <div className="border border-black/40 p-1.5 bg-neutral-50">
                  <div className="text-[10px] uppercase font-bold text-neutral-600">Pending</div>
                  <div className="font-bold text-black text-xs sm:text-sm mt-0.5">{summary.pendingCount}</div>
                </div>
                <div className="border border-black/40 p-1.5 bg-neutral-50">
                  <div className="text-[10px] uppercase font-bold text-neutral-600">Concluded</div>
                  <div className="font-bold text-black text-xs sm:text-sm mt-0.5">{summary.concludedCount}</div>
                </div>
                <div className="border border-black/40 p-1.5 bg-neutral-50">
                  <div className="text-[10px] uppercase font-bold text-neutral-600">Abandoned</div>
                  <div className="font-bold text-black text-xs sm:text-sm mt-0.5">{summary.abandonedCount}</div>
                </div>
              </div>
            </div>

            {/* Call to action bar */}
            <div className="mt-4 pt-3 border-t border-black flex items-center justify-between text-xs font-bold uppercase">
              <span className="text-neutral-700">Enter Jurisdiction Webpage</span>
              <span className="flex items-center gap-1 border border-black bg-black text-white px-3 py-1.5 group-hover:bg-neutral-800 transition">
                Open Court <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
