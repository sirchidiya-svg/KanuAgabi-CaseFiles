/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CourtSummary } from '../types';
import { Printer, X, RotateCcw, ListOrdered, CheckCircle2, Info } from 'lucide-react';

interface PrintLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  courtSummaries: CourtSummary[];
  onExecutePrint: (orderedCourtNames: string[]) => void;
}

export const PrintLedgerModal: React.FC<PrintLedgerModalProps> = ({
  isOpen,
  onClose,
  courtSummaries,
  onExecutePrint,
}) => {
  // selectedOrder stores the court names in the order they were tapped
  // Initially empty: NONE ARE HIGHLIGHTED as requested
  const [selectedOrder, setSelectedOrder] = useState<string[]>([]);

  if (!isOpen) return null;

  const allCourtNames = courtSummaries.map((c) => c.courtName);

  const toggleCourtSelection = (courtName: string) => {
    if (selectedOrder.includes(courtName)) {
      // Remove from selection and shift the numbers of subsequent items
      setSelectedOrder(selectedOrder.filter((name) => name !== courtName));
    } else {
      // Add to selection at next position
      setSelectedOrder([...selectedOrder, courtName]);
    }
  };

  const handleSelectAllDefault = () => {
    setSelectedOrder([...allCourtNames]);
  };

  const handleClear = () => {
    setSelectedOrder([]);
  };

  const handlePrint = () => {
    // If user highlighted any courts, use their chosen order
    // If none are highlighted, print all courts in default legal hierarchy
    const finalOrder = selectedOrder.length > 0 ? selectedOrder : allCourtNames;
    onExecutePrint(finalOrder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-2xl border-4 border-black bg-white p-5 sm:p-7 shadow-2xl my-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-black pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="border border-black px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider">
                Print Setup
              </span>
              <span className="text-[11px] uppercase tracking-wider text-black">
                Physical Hard-Copy Registry
              </span>
            </div>
            <h3 className="mt-1 text-lg sm:text-xl font-bold uppercase tracking-tight text-black">
              Print Master Suit Ledger
            </h3>
            <p className="text-xs uppercase tracking-wider text-black">
              Chambers Cause Register · Hard-Copy Filing Binder Format
            </p>
          </div>
          <button
            onClick={onClose}
            className="border border-black p-1 hover:bg-black hover:text-white cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Instructions Block (Mandated by user prompt) */}
        <div className="mt-4 border-2 border-black bg-neutral-100 p-3 sm:p-4 text-xs">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wide text-black text-xs sm:text-sm">
            <Info className="h-4 w-4 shrink-0" />
            Instructions for Custom Jurisdiction Order
          </div>
          <p className="mt-1.5 text-xs text-black leading-relaxed">
            Tap any court below to set the exact sequence it will appear in the printed physical ledger.
            Each tap highlights the court and tags it with its print order number (e.g. <strong>[Order 1]</strong>, <strong>[Order 2]</strong>, etc.).
            To remove or alter the sequence, tap the highlighted court again to unhighlight it.
          </p>
          <div className="mt-2 border-t border-black/40 pt-1.5 text-[11px] font-bold uppercase text-neutral-800">
            * Note: If you do not highlight any courts, the ledger will automatically print all jurisdictions in the default Nigerian legal hierarchy (Supreme Court → Court of Appeal → Federal High Court → FCT High Court → National Industrial Court → Tribunals).
          </div>
        </div>

        {/* Quick Toolbar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-b border-black pb-2 text-xs">
          <div className="font-bold uppercase tracking-wider text-black">
            Available Courts ({courtSummaries.length}) ·{' '}
            {selectedOrder.length > 0 ? (
              <span className="font-bold underline">{selectedOrder.length} Highlighted in Order</span>
            ) : (
              <span className="text-neutral-600">None Highlighted (Default Order Active)</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAllDefault}
              className="border border-black px-2.5 py-1 text-[11px] font-bold uppercase hover:bg-black hover:text-white cursor-pointer"
            >
              Highlight All (Default)
            </button>
            {selectedOrder.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1 border border-black px-2.5 py-1 text-[11px] font-bold uppercase hover:bg-black hover:text-white cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                Clear Selection
              </button>
            )}
          </div>
        </div>

        {/* List of Courts (Initially NONE Highlighted) */}
        <div className="mt-3 space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {courtSummaries.map((summary) => {
            const indexInSelected = selectedOrder.indexOf(summary.courtName);
            const isHighlighted = indexInSelected !== -1;
            const orderNumber = isHighlighted ? indexInSelected + 1 : null;

            return (
              <button
                key={summary.courtName}
                type="button"
                onClick={() => toggleCourtSelection(summary.courtName)}
                className={`w-full text-left p-3 border-2 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                  isHighlighted
                    ? 'border-black bg-black text-white'
                    : 'border-black bg-white text-black hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Sequence Indicator */}
                  <div
                    className={`h-7 w-7 border flex items-center justify-center text-xs font-bold shrink-0 ${
                      isHighlighted
                        ? 'border-white bg-white text-black'
                        : 'border-black bg-white text-black'
                    }`}
                  >
                    {isHighlighted ? orderNumber : '—'}
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm uppercase tracking-wide">
                      {summary.courtName}
                    </div>
                    <div
                      className={`text-[10px] uppercase tracking-wider ${
                        isHighlighted ? 'text-neutral-300' : 'text-neutral-600'
                      }`}
                    >
                      {summary.totalCount} {summary.totalCount === 1 ? 'file' : 'files'} indexed
                      ({summary.activeCount} active · {summary.pendingCount} pending)
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="text-[11px] font-bold uppercase tracking-wider sm:text-right">
                  {isHighlighted ? (
                    <span className="border border-white px-2 py-0.5 text-white">
                      Print Position #{orderNumber}
                    </span>
                  ) : (
                    <span className="text-neutral-500">Tap to Highlight</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Selection Summary */}
        <div className="mt-4 border-t border-black pt-3 text-xs">
          <div className="font-bold uppercase tracking-wider text-black">
            Ledger Output Preview:
          </div>
          <div className="mt-1 text-[11px] uppercase text-black leading-relaxed">
            {selectedOrder.length > 0 ? (
              <span>
                <strong>Custom Order: </strong>
                {selectedOrder.map((name, i) => `${i + 1}. ${name}`).join('  ➔  ')}
              </span>
            ) : (
              <span className="text-neutral-600">
                <strong>Standard Hierarchy: </strong>
                Supreme Court of Nigeria ➔ Court of Appeal ➔ Federal High Court ➔ High Court of the FCT ➔ National Industrial Court ➔ Election Petitions Tribunal
              </span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3 border-t-2 border-black pt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto border border-black bg-white px-5 py-2.5 text-xs font-bold uppercase text-black hover:bg-neutral-100 cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto flex items-center justify-center gap-2 border-2 border-black bg-black px-6 py-2.5 text-xs font-bold uppercase text-white hover:bg-neutral-800 cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            {selectedOrder.length > 0
              ? `Print Ledger (${selectedOrder.length} Selected)`
              : 'Print Ledger (Default Order)'}
          </button>
        </div>
      </div>
    </div>
  );
};
