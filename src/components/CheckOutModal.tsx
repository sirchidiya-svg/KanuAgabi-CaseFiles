/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CaseFile, FileMovement } from '../types';
import { ArrowRightLeft, X, Check } from 'lucide-react';

interface CheckOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: CaseFile[];
  preselectedFile: CaseFile | null;
  onConfirmCheckOut: (movement: FileMovement) => void;
}

export const CheckOutModal: React.FC<CheckOutModalProps> = ({
  isOpen,
  onClose,
  files,
  preselectedFile,
  onConfirmCheckOut,
}) => {
  const [selectedSuit, setSelectedSuit] = useState('');
  const [borrowerName, setBorrowerName] = useState('');
  const [chamberUnit, setChamberUnit] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [approvedBy, setApprovedBy] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (preselectedFile) {
      setSelectedSuit(preselectedFile.suitNumber);
    } else if (files.length > 0 && !selectedSuit) {
      setSelectedSuit(files[0].suitNumber);
    }

    setBorrowerName('');
    setChamberUnit('');
    setExpectedReturnDate('');
    setPurpose('');
    setApprovedBy('');
    setError('');
  }, [preselectedFile, files, isOpen]);

  if (!isOpen) return null;

  const targetFile = files.find((f) => f.suitNumber === selectedSuit) || preselectedFile;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetFile) {
      setError('Please select a valid case file to check out.');
      return;
    }
    if (!borrowerName.trim()) {
      setError('Counsel / Borrower Name is required.');
      return;
    }

    const now = new Date();
    const formattedNow = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;

    const movement: FileMovement = {
      id: `mov-${Date.now()}`,
      suitNumber: targetFile.suitNumber,
      caseTitle: targetFile.caseTitle,
      borrowerName: borrowerName.trim(),
      chamberUnit: chamberUnit.trim(),
      dateCheckedOut: formattedNow,
      expectedReturnDate: expectedReturnDate.trim() || 'Within 72 Hours',
      dateReturned: null,
      purpose: purpose.trim(),
      approvedBy: approvedBy.trim() || 'File Room Registry',
    };

    onConfirmCheckOut(movement);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
      <div className="w-full max-w-lg border-4 border-black bg-white p-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <div className="border border-black bg-black p-1 text-white">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold uppercase tracking-tight text-black">
                File Check-Out & Chain of Custody
              </h3>
              <p className="text-[11px] uppercase tracking-wider text-black">
                Central Registry · Kanu G. Agabi & Associates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="border border-black p-1 hover:bg-black hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 border-2 border-black bg-black text-white p-2.5 text-xs font-bold uppercase">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* File Selector */}
          <div>
            <label className="block font-bold uppercase tracking-wider text-black">
              Case File to Check Out *
            </label>
            <select
              value={selectedSuit}
              onChange={(e) => setSelectedSuit(e.target.value)}
              className="mt-1 w-full border-2 border-black bg-white p-2 text-xs font-bold text-black focus:outline-none focus:ring-1 focus:ring-black cursor-pointer"
            >
              {files.map((f) => (
                <option key={f.suitNumber} value={f.suitNumber}>
                  {f.suitNumber} — {f.caseTitle.slice(0, 50)}... ({f.shelfNumber})
                </option>
              ))}
            </select>
          </div>

          {targetFile && (
            <div className="border border-black bg-neutral-50 p-2.5 text-xs">
              <div>
                <span className="font-bold uppercase">Jurisdiction: </span>
                <span>{targetFile.courtName}</span>
              </div>
              <div className="mt-1">
                <span className="font-bold uppercase">Physical Location: </span>
                <span className="font-bold">{targetFile.shelfNumber}</span> {targetFile.boxOrBay ? `· ${targetFile.boxOrBay}` : ''}
              </div>
            </div>
          )}

          {/* Borrower Name */}
          <div>
            <label className="block font-bold uppercase tracking-wider text-black">
              Borrower / Counsel Name *
            </label>
            <input
              type="text"
              value={borrowerName}
              onChange={(e) => setBorrowerName(e.target.value)}
              placeholder="e.g. Barrister N. O. Okon, Esq. or Chamber Intern"
              className="mt-1 w-full border-2 border-black bg-white p-2 text-xs uppercase text-black focus:outline-none focus:ring-1 focus:ring-black"
              required
            />
          </div>

          {/* Chamber Unit */}
          <div>
            <label className="block font-bold uppercase tracking-wider text-black">
              Chamber Division / Unit
            </label>
            <input
              type="text"
              value={chamberUnit}
              onChange={(e) => setChamberUnit(e.target.value)}
              placeholder="e.g. Litigation Unit A, Arbitration Division, Principal Partner Chambers"
              className="mt-1 w-full border-2 border-black bg-white p-2 text-xs text-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Expected Return Date */}
          <div>
            <label className="block font-bold uppercase tracking-wider text-black">
              Expected Date & Time of Return
            </label>
            <input
              type="text"
              value={expectedReturnDate}
              onChange={(e) => setExpectedReturnDate(e.target.value)}
              placeholder="e.g. 2026-10-22 17:00"
              className="mt-1 w-full border-2 border-black bg-white p-2 text-xs font-mono text-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Purpose */}
          <div>
            <label className="block font-bold uppercase tracking-wider text-black">
              Purpose of Removal
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Hearing in Court of Appeal, Settling Notice of Appeal with SAN, Photocopying"
              className="mt-1 w-full border-2 border-black bg-white p-2 text-xs text-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Authorized By */}
          <div>
            <label className="block font-bold uppercase tracking-wider text-black">
              Authorized By (HOC / Secretary)
            </label>
            <input
              type="text"
              value={approvedBy}
              onChange={(e) => setApprovedBy(e.target.value)}
              placeholder="e.g. Head of Chambers (HOC)"
              className="mt-1 w-full border-2 border-black bg-white p-2 text-xs text-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t-2 border-black pt-4">
            <button
              type="button"
              onClick={onClose}
              className="border border-black bg-white px-4 py-2 text-xs font-bold uppercase text-black hover:bg-neutral-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 border-2 border-black bg-black px-5 py-2 text-xs font-bold uppercase text-white hover:bg-neutral-800 cursor-pointer"
            >
              <Check className="h-4 w-4" />
              Authorize & Log Movement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
