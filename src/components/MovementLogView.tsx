/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FileMovement, UserSession } from '../types';
import { ArrowRightLeft, CheckCircle2, Clock } from 'lucide-react';

interface MovementLogViewProps {
  movements: FileMovement[];
  session: UserSession;
  onMarkReturned: (movementId: string) => void;
  onNewMovementModal: () => void;
}

export const MovementLogView: React.FC<MovementLogViewProps> = ({
  movements,
  session,
  onMarkReturned,
  onNewMovementModal,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'OUT' | 'RETURNED'>('ALL');

  const filteredMovements = movements.filter((m) => {
    if (filterType === 'OUT') return m.dateReturned === null;
    if (filterType === 'RETURNED') return m.dateReturned !== null;
    return true;
  });

  const currentlyOutCount = movements.filter((m) => m.dateReturned === null).length;

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-5">
      {/* Title & Controls */}
      <div className="mb-5 flex flex-col justify-between gap-3 border-b-2 border-black pb-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base sm:text-xl font-bold uppercase tracking-tight text-black">
            File Room Check-Out & Chain of Custody Log
          </h2>
          <p className="text-xs uppercase tracking-wider text-black mt-0.5">
            Physical Custody Tracking · Monitor case files removed from shelves for Court Hearings or Conferences
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNewMovementModal}
            className="w-full sm:w-auto border-2 border-black bg-black px-4 py-2 text-xs font-bold uppercase text-white hover:bg-neutral-800 cursor-pointer flex items-center justify-center gap-1.5 min-h-[38px]"
          >
            <ArrowRightLeft className="h-4 w-4" />
            Check Out File
          </button>
        </div>
      </div>

      {/* Filter Tabs & Stats (Responsive) */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 border border-black p-1 bg-white">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 text-xs font-bold uppercase cursor-pointer flex-1 sm:flex-none text-center ${
              filterType === 'ALL' ? 'bg-black text-white' : 'text-black hover:bg-neutral-100'
            }`}
          >
            All Logs ({movements.length})
          </button>
          <button
            onClick={() => setFilterType('OUT')}
            className={`px-3 py-1.5 text-xs font-bold uppercase cursor-pointer flex-1 sm:flex-none text-center ${
              filterType === 'OUT' ? 'bg-black text-white' : 'text-black hover:bg-neutral-100'
            }`}
          >
            Out ({currentlyOutCount})
          </button>
          <button
            onClick={() => setFilterType('RETURNED')}
            className={`px-3 py-1.5 text-xs font-bold uppercase cursor-pointer flex-1 sm:flex-none text-center ${
              filterType === 'RETURNED' ? 'bg-black text-white' : 'text-black hover:bg-neutral-100'
            }`}
          >
            Returned ({movements.length - currentlyOutCount})
          </button>
        </div>

        <div className="border border-black px-3 py-1.5 text-[11px] sm:text-xs uppercase font-bold bg-neutral-100">
          Custody Status: {currentlyOutCount > 0 ? `${currentlyOutCount} Files Outside File Room` : 'All Files On Physical Shelves'}
        </div>
      </div>

      {/* MOBILE CARD VIEW (< 640px) */}
      <div className="sm:hidden space-y-3">
        {filteredMovements.length === 0 ? (
          <div className="p-6 text-center text-xs uppercase text-neutral-500 border-2 border-black bg-white">
            No movement logs under selected filter.
          </div>
        ) : (
          filteredMovements.map((m) => {
            const isOut = m.dateReturned === null;
            return (
              <div key={m.id} className="border-2 border-black p-3.5 bg-white space-y-2">
                <div className="flex items-start justify-between gap-2 border-b border-black pb-2">
                  <div className="font-mono text-xs font-bold text-black">{m.suitNumber}</div>
                  {isOut ? (
                    <span className="border border-black bg-black text-white px-2 py-0.5 text-[10px] font-bold uppercase flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Checked Out
                    </span>
                  ) : (
                    <span className="border border-black bg-neutral-100 text-black px-2 py-0.5 text-[10px] font-bold uppercase flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Returned
                    </span>
                  )}
                </div>

                <div className="font-bold text-xs uppercase text-black">{m.caseTitle}</div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-neutral-50 border border-black/40 p-2">
                  <div>
                    <span className="font-bold uppercase text-neutral-600">Borrower:</span>
                    <div className="font-bold text-black uppercase">{m.borrowerName}</div>
                    <div className="text-[10px] text-neutral-600 uppercase">{m.chamberUnit}</div>
                  </div>
                  <div>
                    <span className="font-bold uppercase text-neutral-600">Dates:</span>
                    <div className="text-[10px]">Out: {m.dateCheckedOut}</div>
                    <div className="text-[10px] font-bold">Return: {m.expectedReturnDate}</div>
                  </div>
                </div>

                <div className="text-xs text-black border-t border-black/30 pt-1.5">
                  <span className="font-bold uppercase text-[10px] text-neutral-600">Purpose: </span>
                  {m.purpose}
                  <div className="text-[10px] text-neutral-600 uppercase mt-0.5">
                    Authorized By: {m.approvedBy}
                  </div>
                </div>

                {isOut && (
                  <div className="border-t border-black pt-2">
                    <button
                      onClick={() => onMarkReturned(m.id)}
                      className="w-full border-2 border-black bg-black py-2 text-xs font-bold uppercase text-white hover:bg-neutral-800 cursor-pointer min-h-[38px]"
                    >
                      Mark Returned to Physical Shelf
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* TABLET & PC TABLE VIEW (>= 640px) */}
      <div className="hidden sm:block border-2 border-black bg-white overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b-2 border-black bg-black text-white uppercase tracking-wider">
              <th className="py-2.5 px-3 font-bold w-40">Suit Number</th>
              <th className="py-2.5 px-3 font-bold">Case Title</th>
              <th className="py-2.5 px-3 font-bold w-44">Counsel / Borrower</th>
              <th className="py-2.5 px-3 font-bold w-36">Checked Out</th>
              <th className="py-2.5 px-3 font-bold w-36">Expected Return</th>
              <th className="py-2.5 px-3 font-bold w-32">Custody</th>
              <th className="py-2.5 px-3 font-bold">Purpose / Destination</th>
              <th className="py-2.5 px-3 font-bold text-right w-32">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black">
            {filteredMovements.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center uppercase text-neutral-500">
                  No movement logs found under selected filter.
                </td>
              </tr>
            ) : (
              filteredMovements.map((m) => {
                const isOut = m.dateReturned === null;
                return (
                  <tr key={m.id} className="hover:bg-neutral-50 transition">
                    <td className="py-3 px-3 align-top font-mono font-bold text-black border-r border-black/30">
                      {m.suitNumber}
                    </td>
                    <td className="py-3 px-3 align-top border-r border-black/30 font-bold uppercase">
                      {m.caseTitle}
                    </td>
                    <td className="py-3 px-3 align-top border-r border-black/30">
                      <div className="font-bold text-black uppercase">{m.borrowerName}</div>
                      <div className="text-[10px] text-neutral-600 uppercase">{m.chamberUnit}</div>
                    </td>
                    <td className="py-3 px-3 align-top border-r border-black/30 text-black text-[11px]">
                      {m.dateCheckedOut}
                    </td>
                    <td className="py-3 px-3 align-top border-r border-black/30 text-black text-[11px]">
                      {m.expectedReturnDate}
                    </td>
                    <td className="py-3 px-3 align-top border-r border-black/30 font-bold uppercase">
                      {isOut ? (
                        <span className="flex items-center gap-1 border border-black bg-black text-white px-1.5 py-0.5 text-[10px]">
                          <Clock className="h-3 w-3" />
                          Checked Out
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 border border-black bg-white text-black px-1.5 py-0.5 text-[10px]">
                          <CheckCircle2 className="h-3 w-3" />
                          Returned
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 align-top border-r border-black/30 text-black leading-relaxed">
                      {m.purpose}
                      <div className="text-[10px] text-neutral-500 mt-1 uppercase">
                        Authorized: {m.approvedBy}
                      </div>
                    </td>
                    <td className="py-3 px-3 align-top text-right">
                      {isOut ? (
                        <button
                          onClick={() => onMarkReturned(m.id)}
                          className="border border-black bg-black px-2 py-1 text-[11px] font-bold uppercase text-white hover:bg-white hover:text-black cursor-pointer"
                        >
                          Mark Returned
                        </button>
                      ) : (
                        <span className="text-[10px] uppercase font-bold text-neutral-500">
                          Back on Shelf
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
