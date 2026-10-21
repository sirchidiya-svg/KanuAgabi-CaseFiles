/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CaseFile, FileStatus } from '../types';
import { X, FileText, Check, Info } from 'lucide-react';
import { STANDARD_CHAMBERS_COURTS } from '../data/seedData';

interface CaseFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (file: CaseFile) => void;
  initialFile: CaseFile | null;
  defaultCourtName?: string;
  existingSuitNumbers: string[];
}

const COMMON_COURTS = [
  ...STANDARD_CHAMBERS_COURTS,
  'Court of Appeal (Enugu Division)',
  'Court of Appeal (Port Harcourt Division)',
  'Federal High Court (Lagos Division)',
  'Federal High Court (Port Harcourt Division)',
  'High Court of Lagos State',
  'Arbitration & Mediation Center',
];

const COMMON_SHELVES = [
  'Shelf A-01', 'Shelf A-02', 'Shelf A-03', 'Shelf A-04',
  'Shelf B-01', 'Shelf B-02', 'Shelf B-03', 'Shelf B-04',
  'Shelf C-01', 'Shelf C-02', 'Shelf C-03', 'Shelf C-04',
  'Shelf D-01', 'Shelf D-02', 'Shelf D-03', 'Shelf D-04',
  'Shelf E-01', 'Shelf E-02', 'Shelf E-03', 'Shelf E-04',
  'Shelf F-01', 'Shelf F-02', 'Archive Rack 1', 'Archive Rack 2',
];

export const CaseFileModal: React.FC<CaseFileModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialFile,
  defaultCourtName,
  existingSuitNumbers,
}) => {
  const isEditing = !!initialFile;

  const [suitNumber, setSuitNumber] = useState('');
  const [courtName, setCourtName] = useState('');
  const [caseTitle, setCaseTitle] = useState('');
  const [shelfNumber, setShelfNumber] = useState('');
  const [status, setStatus] = useState<FileStatus>('Active');
  const [remark, setRemark] = useState('');
  const [assignedCounsel, setAssignedCounsel] = useState('');
  const [boxOrBay, setBoxOrBay] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialFile) {
      setSuitNumber(initialFile.suitNumber);
      setCourtName(initialFile.courtName);
      setCaseTitle(initialFile.caseTitle);
      setShelfNumber(initialFile.shelfNumber);
      setStatus(initialFile.status);
      setRemark(initialFile.remark || '');
      setAssignedCounsel(initialFile.assignedCounsel || '');
      setBoxOrBay(initialFile.boxOrBay || '');
    } else {
      setSuitNumber('');
      setCourtName(defaultCourtName || '');
      setCaseTitle('');
      setShelfNumber('');
      setStatus('Active');
      setRemark('');
      setAssignedCounsel('');
      setBoxOrBay('');
    }
    setError('');
  }, [initialFile, defaultCourtName, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanSuit = suitNumber.trim();
    const cleanCourt = courtName.trim();
    const cleanTitle = caseTitle.trim();
    const cleanShelf = shelfNumber.trim();

    if (!cleanSuit) {
      setError('Suit Number is required as Primary Key.');
      return;
    }

    if (!cleanCourt) {
      setError('Court / Jurisdiction is required.');
      return;
    }

    if (!cleanTitle) {
      setError('Case Title / Parties is required.');
      return;
    }

    if (!cleanShelf) {
      setError('Shelf Number (Physical Location) is required.');
      return;
    }

    // Check duplicate primary key if adding new file
    if (!isEditing && existingSuitNumbers.includes(cleanSuit.toUpperCase())) {
      setError(`A case file with Suit Number [${cleanSuit}] is already registered in the inventory.`);
      return;
    }

    const savedFile: CaseFile = {
      suitNumber: cleanSuit,
      courtName: cleanCourt,
      caseTitle: cleanTitle,
      shelfNumber: cleanShelf,
      status,
      remark: remark.trim(),
      assignedCounsel: assignedCounsel.trim() || undefined,
      boxOrBay: boxOrBay.trim() || undefined,
      dateAdded: initialFile?.dateAdded || new Date().toISOString().split('T')[0],
    };

    onSave(savedFile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl border-4 border-black bg-white p-5 sm:p-6 shadow-2xl my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-black" />
            <h3 className="text-base sm:text-lg font-bold uppercase tracking-tight text-black">
              {isEditing ? `Edit Case File [${initialFile?.suitNumber}]` : 'Index New Case File Record'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="border border-black p-1 text-black hover:bg-black hover:text-white transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Subtitle */}
        <p className="mt-2 text-xs uppercase tracking-wider text-black">
          Kanu G. Agabi & Associates · Case File Inventory & Physical Registry
        </p>

        {error && (
          <div className="mt-3 border-2 border-black bg-neutral-100 p-2.5 text-xs font-bold text-black uppercase">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Suit Number (Primary Key) & Court */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block font-bold uppercase tracking-wider text-black">
                Suit Number (Primary Key) *
              </label>
              <input
                type="text"
                value={suitNumber}
                onChange={(e) => setSuitNumber(e.target.value)}
                disabled={isEditing}
                placeholder="e.g. SC/CV/1042/2021, CA/ABJ/CV/312/2023"
                className={`mt-1 w-full border-2 border-black p-2 text-xs font-mono font-bold text-black focus:outline-none focus:ring-1 focus:ring-black ${
                  isEditing ? 'bg-neutral-100 cursor-not-allowed text-neutral-600' : 'bg-white'
                }`}
                required
              />
              <span className="text-[10px] text-neutral-500 uppercase mt-0.5 block">
                {isEditing ? 'Primary key cannot be modified' : 'Must be unique across the firm inventory'}
              </span>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-black">
                Court Jurisdiction *
              </label>
              <input
                type="text"
                list="court-options"
                value={courtName}
                onChange={(e) => setCourtName(e.target.value)}
                placeholder="Select or enter court..."
                className="mt-1 w-full border-2 border-black bg-white p-2 text-xs font-bold uppercase text-black focus:outline-none focus:ring-1 focus:ring-black"
                required
              />
              <datalist id="court-options">
                {COMMON_COURTS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Case Title / Parties */}
          <div>
            <label className="block font-bold uppercase tracking-wider text-black">
              Case Title / Parties to the Suit *
            </label>
            <input
              type="text"
              value={caseTitle}
              onChange={(e) => setCaseTitle(e.target.value)}
              placeholder="e.g. Federal Republic of Nigeria v. Standard Chartered Oil & Gas Ltd & 2 Ors"
              className="mt-1 w-full border-2 border-black bg-white p-2 text-xs font-bold uppercase text-black focus:outline-none focus:ring-1 focus:ring-black"
              required
            />
          </div>

          {/* Shelf Number (Physical Location) & Status */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block font-bold uppercase tracking-wider text-black">
                Shelf Number (Physical Location) *
              </label>
              <input
                type="text"
                list="shelf-options"
                value={shelfNumber}
                onChange={(e) => setShelfNumber(e.target.value)}
                placeholder="e.g. Shelf A-01, Shelf B-12"
                className="mt-1 w-full border-2 border-black bg-white p-2 text-xs uppercase font-bold text-black focus:outline-none focus:ring-1 focus:ring-black"
                required
              />
              <datalist id="shelf-options">
                {COMMON_SHELVES.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-black">
                File Status (Inventory State) *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as FileStatus)}
                className="mt-1 w-full border-2 border-black bg-white p-2 text-xs font-bold uppercase text-black focus:outline-none focus:ring-1 focus:ring-black cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Concluded">Concluded</option>
                <option value="Abandoned">Abandoned</option>
              </select>
            </div>
          </div>

          {/* Room / Bay & Assigned Counsel */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block font-bold uppercase tracking-wider text-black">
                Chamber File Room / Bay Unit
              </label>
              <input
                type="text"
                value={boxOrBay}
                onChange={(e) => setBoxOrBay(e.target.value)}
                placeholder="e.g. File Room 1 / Bay 2, Archive Bay"
                className="mt-1 w-full border-2 border-black bg-white p-2 text-xs text-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-black">
                Assigned Counsel / Unit
              </label>
              <input
                type="text"
                value={assignedCounsel}
                onChange={(e) => setAssignedCounsel(e.target.value)}
                placeholder="e.g. Kanu G. Agabi, SAN / N. O. Okon, Esq."
                className="mt-1 w-full border-2 border-black bg-white p-2 text-xs text-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block font-bold uppercase tracking-wider text-black">
              Remarks, Physical Notes & Chamber Instructions
            </label>
            <textarea
              rows={3}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Record brief stages, hearing dates, bundles condition, or special archiving notes..."
              className="mt-1 w-full border-2 border-black bg-white p-2 text-xs text-black focus:outline-none focus:ring-1 focus:ring-black leading-relaxed"
            />
            <div className="mt-1 flex items-start gap-1 text-[11px] text-neutral-600">
              <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-black" />
              <span>
                Note: Files without remarks or containing asterisks (*) will be tagged automatically in the inventory as <strong>[NO ACTION RECORDED / PENDING ENTRY]</strong>.
              </span>
            </div>
          </div>

          {/* Footer Actions */}
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
              {isEditing ? 'Save Changes' : 'Register File Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
