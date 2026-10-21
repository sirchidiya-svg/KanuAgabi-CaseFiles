/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CaseFile } from '../types';
import { Printer, X } from 'lucide-react';
import { RemarkDisplay } from '../utils/remarkHelper';

interface FileDocketModalProps {
  file: CaseFile | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FileDocketModal: React.FC<FileDocketModalProps> = ({
  file,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !file) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
      <div className="w-full max-w-3xl border-4 border-black bg-white p-6 shadow-2xl my-8">
        {/* Modal Controls (Hidden in Print) */}
        <div className="no-print flex items-center justify-between border-b-2 border-black pb-3 mb-6">
          <div className="text-xs font-bold uppercase tracking-wider text-black">
            Physical File Jacket Docket & Archival Label
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="border border-black bg-black px-3 py-1.5 text-xs font-bold uppercase text-white hover:bg-neutral-800 cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="h-4 w-4" />
              Print File Jacket
            </button>
            <button
              onClick={onClose}
              className="border border-black p-1 hover:bg-black hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Physical File Docket */}
        <div className="border-4 border-black p-8 bg-white font-sans text-black">
          {/* Law Firm Header */}
          <div className="text-center border-b-2 border-black pb-4">
            <h2 className="text-2xl font-bold uppercase tracking-wider">
              Kanu G. Agabi & Associates
            </h2>
            <p className="text-xs font-bold uppercase tracking-widest mt-0.5">
              Legal Practitioners, Arbitrators & Notaries Public
            </p>
            <p className="text-[11px] uppercase tracking-wider text-black mt-0.5">
              Central Registry & Archives · File Room Inventory Management
            </p>
          </div>

          {/* Primary Identifier Box */}
          <div className="mt-6 border-2 border-black p-4 text-center bg-neutral-50">
            <div className="text-xs font-bold uppercase tracking-widest text-neutral-600">
              Primary Suit Identifier
            </div>
            <div className="text-3xl font-mono font-bold uppercase tracking-tight text-black mt-1">
              {file.suitNumber}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-black mt-1">
              {file.courtName}
            </div>
          </div>

          {/* Parties to the Suit */}
          <div className="mt-6 border-2 border-black p-4">
            <div className="text-xs font-bold uppercase tracking-wider border-b border-black pb-1 mb-2">
              Case Title / Parties to Suit
            </div>
            <div className="text-lg font-bold uppercase leading-snug">
              {file.caseTitle}
            </div>
          </div>

          {/* Physical Inventory Location & State */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="border-2 border-black p-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                Physical Inventory Location
              </div>
              <div className="text-xl font-bold uppercase text-black mt-0.5">
                {file.shelfNumber}
              </div>
              <div className="text-xs uppercase text-neutral-700 mt-1">
                Room/Bay: {file.boxOrBay || 'General Stacks'}
              </div>
            </div>

            <div className="border-2 border-black p-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                Current Inventory Status
              </div>
              <div className="text-xl font-bold uppercase text-black mt-0.5">
                [{file.status}]
              </div>
              <div className="text-xs uppercase text-neutral-700 mt-1">
                Registry Date: {file.dateAdded || 'Archived'}
              </div>
            </div>
          </div>

          {/* Counsel & Chamber Division */}
          <div className="mt-4 border-2 border-black p-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
              Assigned Counsel / Handling Department
            </div>
            <div className="text-sm font-bold uppercase text-black mt-0.5">
              {file.assignedCounsel || 'Unassigned / Chambers Registry'}
            </div>
          </div>

          {/* Remarks & Physical Condition */}
          <div className="mt-4 border-2 border-black p-3 min-h-[100px]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 border-b border-black pb-1 mb-2">
              Physical Remarks, Hearing Notes & Archival Instructions
            </div>
            <div className="py-1">
              <RemarkDisplay remark={file.remark} />
            </div>
          </div>

          {/* Verification Footer for File Room Clerk */}
          <div className="mt-6 border-t-2 border-black pt-4 grid grid-cols-3 gap-4 text-[10px] uppercase font-bold text-center">
            <div className="border border-black p-2">
              <div>Checked By:</div>
              <div className="mt-4 border-t border-black/40 pt-1 font-mono">FILE ROOM CLERK</div>
            </div>
            <div className="border border-black p-2">
              <div>Approved By:</div>
              <div className="mt-4 border-t border-black/40 pt-1 font-mono">HEAD OF CHAMBERS</div>
            </div>
            <div className="border border-black p-2">
              <div>Physical Stamp:</div>
              <div className="mt-4 border-t border-black/40 pt-1 font-mono">OFFICIAL REGISTRY</div>
            </div>
          </div>
        </div>

        {/* Modal Footer (Hidden in Print) */}
        <div className="no-print mt-6 flex items-center justify-end gap-3 border-t-2 border-black pt-4">
          <button
            onClick={onClose}
            className="border border-black bg-white px-4 py-2 text-xs font-bold uppercase text-black hover:bg-neutral-100 cursor-pointer"
          >
            Close Docket
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 border-2 border-black bg-black px-5 py-2 text-xs font-bold uppercase text-white hover:bg-neutral-800 cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            Print Physical Label
          </button>
        </div>
      </div>
    </div>
  );
};
