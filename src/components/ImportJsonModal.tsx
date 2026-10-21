/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { CaseFile, FileMovement } from '../types';
import { Upload, FileText, CheckCircle2, AlertTriangle, X, Database, ArrowRight } from 'lucide-react';

interface ImportJsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (importedFiles: CaseFile[], importedMovements?: FileMovement[], mode?: 'overwrite' | 'merge') => void;
  currentTotalFiles: number;
}

interface ParsedBackup {
  lawFirm?: string;
  system?: string;
  exportedAt?: string;
  cases: CaseFile[];
  movements: FileMovement[];
  rawText: string;
}

export const ImportJsonModal: React.FC<ImportJsonModalProps> = ({
  isOpen,
  onClose,
  onImport,
  currentTotalFiles,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedBackup | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'overwrite' | 'merge'>('overwrite');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProcessJsonString = (content: string, filename: string) => {
    setErrorMessage(null);
    try {
      const data = JSON.parse(content);
      let cases: CaseFile[] = [];
      let movements: FileMovement[] = [];

      // Check format
      if (Array.isArray(data)) {
        // Direct array of case files
        cases = data;
      } else if (typeof data === 'object' && data !== null) {
        if (Array.isArray(data.caseFiles)) {
          cases = data.caseFiles;
        } else if (Array.isArray(data.cases)) {
          cases = data.cases;
        }

        if (Array.isArray(data.movements)) {
          movements = data.movements;
        } else if (Array.isArray(data.fileMovements)) {
          movements = data.fileMovements;
        }
      }

      // Validate that at least some cases have suitNumber or caseTitle
      const validCases = cases.filter(
        (c) => c && typeof c === 'object' && (c.suitNumber || c.caseTitle)
      );

      if (validCases.length === 0) {
        setErrorMessage(
          'No valid case file records found in this JSON file. Ensure the file contains case records with suitNumber or caseTitle.'
        );
        setParsedData(null);
        return;
      }

      setParsedData({
        lawFirm: data.lawFirm || data.system || filename,
        exportedAt: data.exportedAt || data.exportDate || 'Unknown date',
        cases: validCases,
        movements: movements,
        rawText: content,
      });
    } catch {
      setErrorMessage('Failed to parse JSON file. Please ensure the file contains valid JSON.');
      setParsedData(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      handleProcessJsonString(text, file.name);
    };
    reader.onerror = () => {
      setErrorMessage('Could not read the selected file.');
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        handleProcessJsonString(text, file.name);
      };
      reader.onerror = () => {
        setErrorMessage('Could not read the dropped file.');
      };
      reader.readAsText(file);
    }
  };

  const handleConfirmImport = () => {
    if (!parsedData) return;
    onImport(parsedData.cases, parsedData.movements, importMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl border-2 border-black bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black bg-black px-5 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <Database className="h-5 w-5 text-white" />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider">
                Import Chambers Registry JSON Backup
              </h2>
              <p className="text-[11px] text-neutral-300">
                Restore or synchronize case inventory data offline or online
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-neutral-300 p-1 cursor-pointer transition"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Instructions */}
          <div className="border border-black p-3.5 bg-neutral-50 text-xs">
            <p className="font-bold uppercase tracking-wide text-black mb-1">
              Offline & Disconnected Data Sync
            </p>
            <p className="text-neutral-700 leading-relaxed">
              If you worked while disconnected from the server or made changes on another device,
              select your exported <span className="font-mono font-bold">.json</span> file here.
              You can overwrite the registry with this file or merge new records without losing existing data.
            </p>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed p-8 text-center cursor-pointer transition flex flex-col items-center justify-center ${
              dragActive
                ? 'border-black bg-neutral-100 scale-[1.01]'
                : parsedData
                ? 'border-black bg-neutral-50'
                : 'border-neutral-400 hover:border-black hover:bg-neutral-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
            />
            {parsedData ? (
              <div className="space-y-2 flex flex-col items-center">
                <CheckCircle2 className="h-10 w-10 text-black" />
                <p className="font-bold text-sm text-black uppercase">
                  Backup File Loaded & Verified
                </p>
                <p className="text-xs text-neutral-600">
                  Click or drag another file to replace
                </p>
              </div>
            ) : (
              <div className="space-y-2 flex flex-col items-center">
                <Upload className="h-10 w-10 text-neutral-700" />
                <p className="font-bold text-sm text-black uppercase">
                  Click to select JSON backup or drag and drop here
                </p>
                <p className="text-xs text-neutral-600">
                  Accepts Kanu Agabi & Associates registry JSON backups (.json)
                </p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center gap-2 border border-red-600 bg-red-50 p-3 text-xs text-red-900">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Parsed File Preview */}
          {parsedData && (
            <div className="border border-black p-4 space-y-4 bg-white">
              <div className="flex items-center justify-between border-b border-black pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-black" />
                  <span className="font-bold text-xs uppercase text-black">
                    Backup Contents Summary
                  </span>
                </div>
                <span className="text-[11px] text-neutral-600">
                  Export Date: {parsedData.exportedAt}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="border border-black p-3 bg-neutral-50">
                  <div className="text-[10px] uppercase font-bold text-neutral-600">
                    Case Files to Import
                  </div>
                  <div className="text-xl font-bold text-black mt-1">
                    {parsedData.cases.length} Records
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    Currently in registry: {currentTotalFiles}
                  </div>
                </div>

                <div className="border border-black p-3 bg-neutral-50">
                  <div className="text-[10px] uppercase font-bold text-neutral-600">
                    File Movements
                  </div>
                  <div className="text-xl font-bold text-black mt-1">
                    {parsedData.movements.length} Records
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    Custody & check-out logs
                  </div>
                </div>
              </div>

              {/* Import Mode Selection */}
              <div className="space-y-2 pt-2 border-t border-black/20">
                <label className="text-xs font-bold uppercase tracking-wide block">
                  Select Import Action:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label
                    className={`flex items-start gap-2.5 border p-3 cursor-pointer transition ${
                      importMode === 'overwrite'
                        ? 'border-2 border-black bg-neutral-100 font-bold'
                        : 'border-neutral-300 hover:border-black'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      value="overwrite"
                      checked={importMode === 'overwrite'}
                      onChange={() => setImportMode('overwrite')}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="text-xs uppercase text-black">
                        Overwrite Entire Registry
                      </div>
                      <div className="text-[11px] text-neutral-600 font-normal">
                        Replaces current inventory with the {parsedData.cases.length} records from this JSON file.
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2.5 border p-3 cursor-pointer transition ${
                      importMode === 'merge'
                        ? 'border-2 border-black bg-neutral-100 font-bold'
                        : 'border-neutral-300 hover:border-black'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      value="merge"
                      checked={importMode === 'merge'}
                      onChange={() => setImportMode('merge')}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="text-xs uppercase text-black">
                        Merge & Synchronize
                      </div>
                      <div className="text-[11px] text-neutral-600 font-normal">
                        Updates existing suits and appends any newly created case files.
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-black bg-neutral-100 px-6 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="border border-black bg-white px-4 py-2 text-xs font-bold uppercase text-black hover:bg-neutral-200 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirmImport}
            disabled={!parsedData}
            className={`flex items-center gap-2 border-2 border-black px-5 py-2 text-xs font-bold uppercase transition cursor-pointer ${
              parsedData
                ? 'bg-black text-white hover:bg-neutral-800'
                : 'bg-neutral-300 text-neutral-500 border-neutral-300 cursor-not-allowed'
            }`}
          >
            <span>Confirm & Apply Import</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
