/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CaseFile } from '../types';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteWarningModalProps {
  file: CaseFile | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (suitNumber: string) => void;
}

export const DeleteWarningModal: React.FC<DeleteWarningModalProps> = ({
  file,
  isOpen,
  onClose,
  onConfirmDelete,
}) => {
  const [confirmInput, setConfirmInput] = useState('');
  const [hasAcknowledged, setHasAcknowledged] = useState(false);

  if (!isOpen || !file) return null;

  const handleConfirm = () => {
    onConfirmDelete(file.suitNumber);
    setConfirmInput('');
    setHasAcknowledged(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg border-4 border-black bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <div className="border border-black bg-black p-1 text-white">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold uppercase tracking-tight text-black">
                File Room Registry Deletion Warning
              </h3>
              <p className="text-[11px] uppercase tracking-wider text-black">
                Security Protocol · Kanu G. Agabi & Associates
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

        {/* Warning Message */}
        <div className="mt-4 space-y-3 text-xs">
          <div className="border-2 border-black bg-neutral-100 p-3">
            <div className="font-bold uppercase tracking-wide text-black">
              Irreversible Physical & Database Action
            </div>
            <p className="mt-1 leading-relaxed text-black">
              You are about to permanently purge the index record of the following litigation case file from the central law firm inventory.
            </p>
          </div>

          <div className="border border-black p-3 space-y-1 bg-white">
            <div>
              <span className="font-bold uppercase">Suit Number: </span>
              <span className="font-mono font-bold">{file.suitNumber}</span>
            </div>
            <div>
              <span className="font-bold uppercase">Court: </span>
              <span>{file.courtName}</span>
            </div>
            <div>
              <span className="font-bold uppercase">Case Title: </span>
              <span className="uppercase">{file.caseTitle}</span>
            </div>
            <div>
              <span className="font-bold uppercase">Shelf Location: </span>
              <span className="font-bold">{file.shelfNumber}</span> {file.boxOrBay ? `(${file.boxOrBay})` : ''}
            </div>
            <div>
              <span className="font-bold uppercase">Current Status: </span>
              <span className="font-bold">[{file.status}]</span>
            </div>
          </div>

          <div className="border border-black p-3">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasAcknowledged}
                onChange={(e) => setHasAcknowledged(e.target.checked)}
                className="mt-0.5 border border-black cursor-pointer"
              />
              <span className="text-[11px] font-bold uppercase leading-normal">
                I hereby confirm that I am an authorized Administrator (Head of Chambers or File Room Secretary) and that physical disposition of this case file is verified.
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t-2 border-black pt-4">
          <button
            type="button"
            onClick={onClose}
            className="border border-black bg-white px-4 py-2 text-xs font-bold uppercase text-black hover:bg-neutral-100 cursor-pointer"
          >
            Cancel / Abort
          </button>
          <button
            type="button"
            disabled={!hasAcknowledged}
            onClick={handleConfirm}
            className={`border-2 border-black px-4 py-2 text-xs font-bold uppercase cursor-pointer ${
              hasAcknowledged
                ? 'bg-black text-white hover:bg-neutral-800'
                : 'bg-neutral-200 text-neutral-400 border-neutral-300 cursor-not-allowed'
            }`}
          >
            Confirm Permanent Deletion
          </button>
        </div>
      </div>
    </div>
  );
};
