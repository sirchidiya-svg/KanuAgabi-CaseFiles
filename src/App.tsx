/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { CaseFile, FileMovement, FileStatus, UserSession } from './types';
import {
  getStoredCaseFiles,
  saveCaseFiles,
  getStoredMovements,
  saveMovements,
  getStoredSession,
  saveSession,
  resetDatabaseToDefaults,
  groupFilesByCourt,
  exportToCSV,
  downloadFile,
} from './utils/storage';
import { isRemarkEmptyOrAsterisk } from './utils/remarkHelper';

import { Header } from './components/Header';
import { SearchBar, RemarkFilterType } from './components/SearchBar';
import { CourtAccordionView } from './components/CourtAccordionView';
import { ShelfView } from './components/ShelfView';
import { MovementLogView } from './components/MovementLogView';
import { XamppDeploymentModal } from './components/XamppDeploymentModal';

import { CaseFileModal } from './components/CaseFileModal';
import { DeleteWarningModal } from './components/DeleteWarningModal';
import { FileDocketModal } from './components/FileDocketModal';
import { CheckOutModal } from './components/CheckOutModal';
import { AuthModal } from './components/AuthModal';
import { LoginPage } from './components/LoginPage';
import { PrintLedgerModal } from './components/PrintLedgerModal';
import { ImportJsonModal } from './components/ImportJsonModal';
import { WifiOff, Download, Upload } from 'lucide-react';

export default function App() {
  // 1. Core State
  const [files, setFiles] = useState<CaseFile[]>(() => getStoredCaseFiles());
  const [movements, setMovements] = useState<FileMovement[]>(() => getStoredMovements());
  const [session, setSession] = useState<UserSession | null>(() => getStoredSession());

  // 2. Navigation & Filters
  const [activeTab, setActiveTab] = useState<'courts' | 'shelves' | 'movements' | 'architecture'>('courts');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | FileStatus>('ALL');
  const [shelfFilter, setShelfFilter] = useState('ALL');
  const [remarkFilter, setRemarkFilter] = useState<RemarkFilterType>('ALL');

  // 3. Modals State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [selectedFileForEdit, setSelectedFileForEdit] = useState<CaseFile | null>(null);
  const [defaultCourtForAdd, setDefaultCourtForAdd] = useState<string | undefined>(undefined);

  const [deleteTarget, setDeleteTarget] = useState<CaseFile | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [docketFile, setDocketFile] = useState<CaseFile | null>(null);
  const [isDocketModalOpen, setIsDocketModalOpen] = useState(false);

  const [checkOutFile, setCheckOutFile] = useState<CaseFile | null>(null);
  const [isCheckOutModalOpen, setIsCheckOutModalOpen] = useState(false);

  // Print Ledger Ordering Modal State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printOrderedCourts, setPrintOrderedCourts] = useState<string[]>([]);

  // JSON Import & Offline Sync State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Subtle Notification Banner
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 4000);
  };

  // Connection status detection for offline/disconnected chambers usage
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showNotification('Chambers server connection active. Online mode.');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showNotification('Server disconnected. Offline mode active — local storage enabled. You can download a JSON backup.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync state to LocalStorage
  useEffect(() => {
    saveCaseFiles(files);
  }, [files]);

  useEffect(() => {
    saveMovements(movements);
  }, [movements]);

  useEffect(() => {
    saveSession(session);
  }, [session]);

  // Unique Shelves for filter dropdown
  const uniqueShelves = useMemo(() => {
    const set = new Set<string>();
    files.forEach((f) => {
      if (f.shelfNumber?.trim()) set.add(f.shelfNumber.trim());
    });
    return Array.from(set).sort();
  }, [files]);

  // Filtered files based on sticky search, status, shelf, and remark/asterisk filter
  const filteredFiles = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return files.filter((file) => {
      // Query filter
      if (q) {
        const suit = (file.suitNumber || '').toLowerCase();
        const title = (file.caseTitle || '').toLowerCase();
        const court = (file.courtName || '').toLowerCase();
        const shelf = (file.shelfNumber || '').toLowerCase();
        const remark = (file.remark || '').toLowerCase();
        const counsel = (file.assignedCounsel || '').toLowerCase();

        const matchesQuery =
          suit.includes(q) ||
          title.includes(q) ||
          court.includes(q) ||
          shelf.includes(q) ||
          remark.includes(q) ||
          counsel.includes(q);

        if (!matchesQuery) return false;
      }

      // Status filter
      if (statusFilter !== 'ALL' && file.status !== statusFilter) {
        return false;
      }

      // Shelf filter
      if (shelfFilter !== 'ALL' && file.shelfNumber !== shelfFilter) {
        return false;
      }

      // Remark / Asterisk filter
      if (remarkFilter === 'NO_ACTION' && !isRemarkEmptyOrAsterisk(file.remark)) {
        return false;
      }
      if (remarkFilter === 'HAS_ACTION' && isRemarkEmptyOrAsterisk(file.remark)) {
        return false;
      }

      return true;
    });
  }, [files, searchQuery, statusFilter, shelfFilter, remarkFilter]);

  // Group files by Court for Court-First navigation
  const courtSummaries = useMemo(() => {
    return groupFilesByCourt(filteredFiles);
  }, [filteredFiles]);

  // All court summaries for print configuration
  const allCourtSummaries = useMemo(() => {
    return groupFilesByCourt(files);
  }, [files]);

  // Existing Suit Numbers for duplicate prevention
  const existingSuitNumbers = useMemo(() => {
    return files.map((f) => f.suitNumber.toUpperCase());
  }, [files]);

  // Handlers for Case Files CRUD
  const handleSaveFile = (file: CaseFile) => {
    if (selectedFileForEdit) {
      // Update existing
      setFiles((prev) =>
        prev.map((f) => {
          if (file.id && f.id) return f.id === file.id ? file : f;
          return f.suitNumber === file.suitNumber ? file : f;
        })
      );
      showNotification(`Case file [${file.suitNumber}] updated successfully.`);
    } else {
      // Add new
      const newFile: CaseFile = {
        ...file,
        id: file.id || `KGA-${Date.now()}`,
      };
      setFiles((prev) => [newFile, ...prev]);
      showNotification(`New case file [${file.suitNumber}] registered in ${file.courtName}.`);
    }
  };

  const handleOpenEdit = (file: CaseFile) => {
    setSelectedFileForEdit(file);
    setDefaultCourtForAdd(undefined);
    setIsAddEditOpen(true);
  };

  const handleOpenDelete = (file: CaseFile) => {
    setDeleteTarget(file);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = (suitNumberOrId: string) => {
    setFiles((prev) =>
      prev.filter((f) => {
        if (deleteTarget?.id && f.id) return f.id !== deleteTarget.id;
        return f.suitNumber !== suitNumberOrId;
      })
    );
    showNotification(`Case file [${suitNumberOrId}] purged from registry.`);
  };

  const handleCheckOutFile = (file: CaseFile) => {
    setCheckOutFile(file);
    setIsCheckOutModalOpen(true);
  };

  const handleConfirmCheckOut = (movement: FileMovement) => {
    setMovements((prev) => [movement, ...prev]);
    showNotification(`Physical file [${movement.suitNumber}] checked out to ${movement.borrowerName}.`);
  };

  const handleMarkReturned = (movementId: string) => {
    const now = new Date();
    const formatted = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;

    setMovements((prev) =>
      prev.map((m) =>
        m.id === movementId ? { ...m, dateReturned: formatted } : m
      )
    );
    showNotification(`Case file custody marked as returned to physical shelf.`);
  };

  const handleViewDocket = (file: CaseFile) => {
    setDocketFile(file);
    setIsDocketModalOpen(true);
  };

  const handleExportCSV = () => {
    const csv = exportToCSV(files);
    downloadFile(csv, `Kanu_Agabi_Case_Inventory_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
    showNotification('Inventory exported to CSV format.');
  };

  const handleExportJSON = () => {
    const payload = JSON.stringify(
      {
        system: 'Kanu G. Agabi & Associates - Case File Inventory and Tracking System',
        lawFirm: 'Kanu G. Agabi & Associates',
        version: '3.0',
        exportedAt: new Date().toISOString(),
        totalCases: files.length,
        totalMovements: movements.length,
        caseFiles: files,
        movements: movements,
      },
      null,
      2
    );
    downloadFile(
      payload,
      `Kanu_Agabi_Inventory_Backup_${new Date().toISOString().split('T')[0]}_${Date.now().toString().slice(-4)}.json`,
      'application/json'
    );
    showNotification(`Registry backup downloaded (${files.length} cases + ${movements.length} custody logs).`);
  };

  const handleImportJSON = (
    importedFiles: CaseFile[],
    importedMovements?: FileMovement[],
    mode: 'overwrite' | 'merge' = 'overwrite'
  ) => {
    if (mode === 'overwrite') {
      setFiles(importedFiles);
      saveCaseFiles(importedFiles);
      if (importedMovements && importedMovements.length > 0) {
        setMovements(importedMovements);
        saveMovements(importedMovements);
      }
      showNotification(`Chambers database restored with ${importedFiles.length} case files.`);
    } else {
      // Merge mode: Add new files and update matching files without deleting non-colliding existing ones
      setFiles((prev) => {
        const fileMap = new Map<string, CaseFile>();
        prev.forEach((f) => fileMap.set(f.id || f.suitNumber, f));
        importedFiles.forEach((f) => fileMap.set(f.id || f.suitNumber, f));
        const merged = Array.from(fileMap.values());
        saveCaseFiles(merged);
        return merged;
      });

      if (importedMovements && importedMovements.length > 0) {
        setMovements((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const newMovements = importedMovements.filter((m) => !existingIds.has(m.id));
          const mergedMovements = [...newMovements, ...prev];
          saveMovements(mergedMovements);
          return mergedMovements;
        });
      }
      showNotification(`Successfully merged ${importedFiles.length} case records into registry.`);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset local inventory to clean state? This removes any local changes.')) {
      const reset = resetDatabaseToDefaults();
      setFiles(reset.files);
      setMovements(reset.movements);
      showNotification('Inventory database re-initialized.');
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setShelfFilter('ALL');
    setRemarkFilter('ALL');
  };

  const handleExecutePrint = (orderedCourts: string[]) => {
    setPrintOrderedCourts(orderedCourts);
    // Allow React state update to populate printable DOM, then invoke browser print
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const activeCount = useMemo(() => files.filter((f) => f.status === 'Active').length, [files]);

  // Determine courts list for print output (Must be declared before any early returns)
  const printableCourtsList = useMemo(() => {
    if (printOrderedCourts.length > 0) {
      // Return courts in the custom user highlighted sequence
      return printOrderedCourts
        .map((name) => allCourtSummaries.find((c) => c.courtName === name))
        .filter(Boolean) as typeof allCourtSummaries;
    }
    // Default hierarchy
    return allCourtSummaries;
  }, [printOrderedCourts, allCourtSummaries]);

  const handleLogout = () => {
    setSession(null);
    saveSession(null);
  };

  // 4. Force Login Page first before reaching the main dashboard
  if (!session) {
    return (
      <LoginPage
        onLoginSuccess={(newSession) => {
          setSession(newSession);
          saveSession(newSession);
        }}
        totalFilesCount={files.length}
      />
    );
  }

  const isSuperAdmin = session.role === 'SUPER_ADMIN';
  const isAdmin = session.role === 'ADMIN' || isSuperAdmin;

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white pb-16">
      {/* =========================================================================
          OFFICIAL PHYSICAL REGISTRY LEDGER (PRINT-ONLY VIEW FOR BINDERS)
          Prints in the exact custom highlighted order or default hierarchy
          ========================================================================= */}
      <div className="print-only p-6 font-sans bg-white text-black">
        {/* Chambers Master Letterhead */}
        <div className="text-center border-b-4 border-black pb-4 mb-6">
          <h1 className="text-2xl font-bold uppercase tracking-wider">
            Kanu G. Agabi & Associates
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest mt-1">
            Legal Practitioners, Arbitrators & Notaries Public
          </p>
          <div className="mt-2 text-xs font-bold uppercase tracking-wider border-t border-black pt-1">
            Central Registry · Master Suit Register & File Location Ledger
          </div>
          <div className="mt-2 flex justify-between text-[10px] uppercase font-bold border-t border-black/40 pt-1">
            <span>Date Generated: {new Date().toLocaleDateString()}</span>
            <span>Registry Officer: {session.userName} [{session.role}]</span>
            <span>Chambers Division: Abuja FCT</span>
          </div>
        </div>

        {/* Ordered Court Jurisdictions in Print Ledger */}
        <div className="space-y-6">
          {printableCourtsList.map((court, idx) => (
            <div key={court.courtName} className="border-2 border-black p-4 break-inside-avoid">
              <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-3">
                <h2 className="text-sm font-bold uppercase tracking-wide">
                  [{idx + 1}] {court.courtName}
                </h2>
                <div className="text-[10px] font-bold uppercase">
                  Total Files: {court.totalCount} (Active: {court.activeCount} · Pending: {court.pendingCount} · Concluded: {court.concludedCount})
                </div>
              </div>

              {court.files.length === 0 ? (
                <div className="py-2 text-center text-[10px] uppercase text-neutral-500 font-bold border border-black/30">
                  No Case Files Currently Indexed Under this Court.
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="border-b border-black bg-neutral-100 uppercase">
                      <th className="py-1 px-2 font-bold w-36">Suit Number</th>
                      <th className="py-1 px-2 font-bold">Case Title / Parties</th>
                      <th className="py-1 px-2 font-bold w-24">Shelf</th>
                      <th className="py-1 px-2 font-bold w-20">Status</th>
                      <th className="py-1 px-2 font-bold">Remarks & Counsel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/30">
                    {court.files.map((file, fIdx) => (
                      <tr key={file.id || `${file.suitNumber}-${fIdx}`}>
                        <td className="py-1 px-2 font-mono font-bold">{file.suitNumber}</td>
                        <td className="py-1 px-2 font-bold uppercase">{file.caseTitle}</td>
                        <td className="py-1 px-2 font-bold uppercase">{file.shelfNumber}</td>
                        <td className="py-1 px-2 uppercase">[{file.status}]</td>
                        <td className="py-1 px-2">
                          {file.assignedCounsel ? `Counsel: ${file.assignedCounsel} | ` : ''}
                          {isRemarkEmptyOrAsterisk(file.remark) ? (
                            <span className="font-bold">[NO ACTION RECORDED / PENDING ENTRY]</span>
                          ) : (
                            file.remark
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>

        {/* Ledger Signature Footer */}
        <div className="mt-8 border-t-2 border-black pt-4 grid grid-cols-2 gap-8 text-[10px] uppercase font-bold text-center">
          <div className="border border-black p-2">
            <div>Prepared By (Registry Clerk):</div>
            <div className="mt-6 border-t border-black/40 pt-1 font-mono">{session.userName}</div>
          </div>
          <div className="border border-black p-2">
            <div>Verified By (Head of Chambers):</div>
            <div className="mt-6 border-t border-black/40 pt-1 font-mono">OFFICIAL REGISTRY SEAL</div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          INTERACTIVE SCREEN UI (HIDDEN DURING PRINT)
          ========================================================================= */}
      <div className="no-print">
        {/* Chambers Header */}
        <Header
          session={session}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
          onOpenAddModal={() => {
            setSelectedFileForEdit(null);
            setDefaultCourtForAdd(undefined);
            setIsAddEditOpen(true);
          }}
          onOpenPrintModal={() => setIsPrintModalOpen(true)}
          onExportCSV={handleExportCSV}
          onExportJSON={handleExportJSON}
          onOpenImportModal={() => setIsImportModalOpen(true)}
          onResetData={handleResetData}
          totalFiles={files.length}
          activeCount={activeCount}
          isOnline={isOnline}
        />

        {/* Offline / Server Disconnected Banner */}
        {!isOnline && (
          <div className="border-b-2 border-black bg-neutral-900 text-white px-4 py-3 text-xs">
            <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <WifiOff className="h-4 w-4 shrink-0 text-white" />
                <div>
                  <span className="font-bold uppercase tracking-wider">
                    Server Disconnected / Offline Mode Active
                  </span>
                  <p className="text-[11px] text-neutral-300">
                    You can continue inputting and updating case files safely. All changes are saved in your local chambers cache.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportJSON}
                  title="Download complete database as JSON right now"
                  className="flex items-center gap-1.5 border border-white bg-white px-3 py-1.5 text-xs font-bold uppercase text-black hover:bg-neutral-200 transition cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download Backup (.json)
                </button>
                {isAdmin && (
                  <button
                    onClick={() => setIsImportModalOpen(true)}
                    title="Import or restore registry data from JSON"
                    className="flex items-center gap-1.5 border border-white bg-black px-3 py-1.5 text-xs font-bold uppercase text-white hover:bg-neutral-800 transition cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Import JSON
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Notification Banner */}
        {notification && (
          <div className="border-b-2 border-black bg-black px-4 py-2 text-center text-xs font-bold uppercase tracking-wider text-white">
            {notification}
          </div>
        )}

        {/* Sticky Global Search Bar (Only shown on Court-First and Shelf views) */}
        {(activeTab === 'courts' || activeTab === 'shelves') && (
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            shelfFilter={shelfFilter}
            onShelfFilterChange={setShelfFilter}
            remarkFilter={remarkFilter}
            onRemarkFilterChange={setRemarkFilter}
            shelves={uniqueShelves}
            totalResults={filteredFiles.length}
            onClearFilters={handleClearFilters}
          />
        )}

        {/* Main Content Area */}
        <main>
          {activeTab === 'courts' && (
            <CourtAccordionView
              courtSummaries={courtSummaries}
              searchQuery={searchQuery}
              session={session}
              onEditFile={handleOpenEdit}
              onDeleteFile={handleOpenDelete}
              onCheckOutFile={handleCheckOutFile}
              onViewDocket={handleViewDocket}
              onOpenAddModal={(courtName) => {
                setSelectedFileForEdit(null);
                setDefaultCourtForAdd(courtName);
                setIsAddEditOpen(true);
              }}
            />
          )}

          {activeTab === 'shelves' && (
            <ShelfView
              files={filteredFiles}
              session={session}
              onViewDocket={handleViewDocket}
              onCheckOutFile={handleCheckOutFile}
              onEditFile={handleOpenEdit}
            />
          )}

          {activeTab === 'movements' && (
            <MovementLogView
              movements={movements}
              session={session}
              onMarkReturned={handleMarkReturned}
              onNewMovementModal={() => {
                setCheckOutFile(files[0] || null);
                setIsCheckOutModalOpen(true);
              }}
            />
          )}

          {activeTab === 'architecture' && session.role === 'SUPER_ADMIN' && <XamppDeploymentModal />}
        </main>

        {/* Modals */}
        <PrintLedgerModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          courtSummaries={allCourtSummaries}
          onExecutePrint={handleExecutePrint}
        />

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          currentSession={session}
          onUpdateSession={(newSession) => {
            setSession(newSession);
            showNotification(`Switched to ${newSession.role} Mode (${newSession.userName}).`);
          }}
        />

        <CaseFileModal
          isOpen={isAddEditOpen}
          onClose={() => {
            setIsAddEditOpen(false);
            setSelectedFileForEdit(null);
            setDefaultCourtForAdd(undefined);
          }}
          onSave={handleSaveFile}
          initialFile={selectedFileForEdit}
          defaultCourtName={defaultCourtForAdd}
          existingSuitNumbers={existingSuitNumbers}
        />

        <DeleteWarningModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setDeleteTarget(null);
          }}
          file={deleteTarget}
          onConfirmDelete={handleConfirmDelete}
        />

        <FileDocketModal
          isOpen={isDocketModalOpen}
          onClose={() => {
            setIsDocketModalOpen(false);
            setDocketFile(null);
          }}
          file={docketFile}
        />

        <CheckOutModal
          isOpen={isCheckOutModalOpen}
          onClose={() => {
            setIsCheckOutModalOpen(false);
            setCheckOutFile(null);
          }}
          files={files}
          preselectedFile={checkOutFile}
          onConfirmCheckOut={handleConfirmCheckOut}
        />

        <ImportJsonModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleImportJSON}
          currentTotalFiles={files.length}
        />

        {/* Footer */}
        <footer className="mt-16 border-t-2 border-black bg-white py-6 text-center text-xs text-black">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 text-center">
            <div className="font-bold uppercase tracking-wider text-[11px] sm:text-xs">
              Kanu G. Agabi & Associates · Central Registry & File Inventory System
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
