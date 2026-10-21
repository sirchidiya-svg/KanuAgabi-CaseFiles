/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserSession } from '../types';
import { ShieldCheck, User, Plus, Download, Printer, Server, RefreshCw, LogOut, Upload, Wifi, WifiOff } from 'lucide-react';

interface HeaderProps {
  session: UserSession;
  activeTab: 'courts' | 'shelves' | 'movements' | 'architecture';
  setActiveTab: (tab: 'courts' | 'shelves' | 'movements' | 'architecture') => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenAddModal: () => void;
  onOpenPrintModal: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onOpenImportModal: () => void;
  onResetData: () => void;
  totalFiles: number;
  activeCount: number;
  isOnline?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  session,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onLogout,
  onOpenAddModal,
  onOpenPrintModal,
  onExportCSV,
  onExportJSON,
  onOpenImportModal,
  onResetData,
  totalFiles,
  activeCount,
  isOnline = true,
}) => {
  const isSuperAdmin = session.role === 'SUPER_ADMIN';
  const isAdmin = session.role === 'ADMIN' || isSuperAdmin;

  return (
    <header className="border-b-2 border-black bg-white">
      {/* Official Top Banner */}
      <div className="border-b border-black px-3 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="border border-black px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                Law Firm Archive
              </span>
              <span className="text-[10px] sm:text-xs uppercase tracking-widest text-black">
                Registry Division · Abuja FCT
              </span>
            </div>
            <h1 className="mt-1 text-xl sm:text-2xl lg:text-3xl font-bold uppercase tracking-tight text-black">
              Kanu G. Agabi & Associates
            </h1>
            <p className="text-[11px] sm:text-xs uppercase tracking-wider text-black mt-0.5">
              Legal Practitioners, Arbitrators & Notaries Public · Case File Inventory & Tracking System
            </p>
          </div>

          {/* User Session & Role Indicator (Responsive Row) */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="border border-black px-2.5 py-1.5 text-xs bg-neutral-50 flex-1 sm:flex-none">
              <div className="flex items-center gap-1.5">
                {isAdmin ? (
                  <ShieldCheck className="h-4 w-4 text-black shrink-0" />
                ) : (
                  <User className="h-4 w-4 text-black shrink-0" />
                )}
                <span className="font-bold text-[11px] sm:text-xs">
                  {isSuperAdmin
                    ? 'SUPER ADMINISTRATOR'
                    : isAdmin
                    ? 'ADMINISTRATOR (CRUD)'
                    : 'GUEST (READ-ONLY)'}
                </span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-neutral-700 truncate max-w-[200px] sm:max-w-none">
                User: {session.userName} {session.chamberUnit ? `· ${session.chamberUnit}` : ''}
              </div>
            </div>

            <div
              className={`flex items-center gap-1.5 border px-2.5 py-1.5 text-xs font-bold uppercase ${
                isOnline
                  ? 'border-black/30 bg-neutral-100 text-black'
                  : 'border-black bg-black text-white'
              }`}
              title={isOnline ? 'Connected to Chambers Server/Network' : 'Offline / Server Disconnected (Local Storage Active)'}
            >
              {isOnline ? (
                <>
                  <Wifi className="h-3.5 w-3.5 text-black shrink-0" />
                  <span className="hidden sm:inline">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3.5 w-3.5 text-white shrink-0" />
                  <span>Offline Sync</span>
                </>
              )}
            </div>

            <button
              onClick={onOpenAuth}
              className="border border-black bg-white px-3 py-2 text-xs font-bold uppercase text-black transition hover:bg-black hover:text-white cursor-pointer min-h-[36px]"
            >
              Switch Role
            </button>

            <button
              onClick={onLogout}
              title="Sign Out to Login Gate"
              className="border border-black bg-black px-3 py-2 text-xs font-bold uppercase text-white transition hover:bg-neutral-800 cursor-pointer flex items-center gap-1 min-h-[36px]"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Bar & Chamber Controls (Full Mobile & Desktop Responsiveness) */}
      <div className="px-3 py-2.5 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Main Navigation Tabs: Smooth scroll on mobile, flex on desktop */}
          <nav className="flex overflow-x-auto gap-1.5 pb-1 lg:pb-0 scrollbar-none shrink-0">
            <button
              onClick={() => setActiveTab('courts')}
              className={`border border-black px-3.5 py-2 text-xs font-bold uppercase whitespace-nowrap transition cursor-pointer min-h-[38px] ${
                activeTab === 'courts'
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-neutral-100'
              }`}
            >
              1. Court Registry ({totalFiles})
            </button>
            <button
              onClick={() => setActiveTab('shelves')}
              className={`border border-black px-3.5 py-2 text-xs font-bold uppercase whitespace-nowrap transition cursor-pointer min-h-[38px] ${
                activeTab === 'shelves'
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-neutral-100'
              }`}
            >
              2. Shelf Locator
            </button>
            <button
              onClick={() => setActiveTab('movements')}
              className={`border border-black px-3.5 py-2 text-xs font-bold uppercase whitespace-nowrap transition cursor-pointer min-h-[38px] ${
                activeTab === 'movements'
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-neutral-100'
              }`}
            >
              3. File Movement
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('architecture')}
                className={`border border-black px-3.5 py-2 text-xs font-bold uppercase whitespace-nowrap transition cursor-pointer min-h-[38px] flex items-center gap-1.5 ${
                  activeTab === 'architecture'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-neutral-100'
                }`}
              >
                <Server className="h-3.5 w-3.5" />
                4. XAMPP Suite & Downloads
              </button>
            )}
          </nav>

          {/* Action Toolbar (Responsive wrap) */}
          <div className="flex flex-wrap items-center gap-2 pt-1 lg:pt-0 border-t lg:border-t-0 border-black/20">
            {isAdmin && (
              <button
                onClick={onOpenAddModal}
                className="flex items-center gap-1.5 border-2 border-black bg-black px-3.5 py-2 text-xs font-bold uppercase text-white transition hover:bg-neutral-800 cursor-pointer min-h-[38px]"
              >
                <Plus className="h-4 w-4" />
                Add Case File
              </button>
            )}

            <button
              onClick={onOpenPrintModal}
              title="Print Physical Master Suit Register & File Location Ledger"
              className="flex items-center gap-1.5 border border-black bg-white px-3 py-2 text-xs font-bold uppercase text-black transition hover:bg-black hover:text-white cursor-pointer min-h-[38px]"
            >
              <Printer className="h-3.5 w-3.5" />
              Print Ledger
            </button>

            <button
              onClick={onExportCSV}
              title="Export Inventory as CSV"
              className="flex items-center gap-1 border border-black bg-white px-2.5 py-2 text-xs font-bold uppercase text-black transition hover:bg-black hover:text-white cursor-pointer min-h-[38px]"
            >
              <Download className="h-3.5 w-3.5" />
              CSV
            </button>

            <button
              onClick={onExportJSON}
              title="Backup complete registry and all inputted data as JSON"
              className="flex items-center gap-1 border border-black bg-white px-2.5 py-2 text-xs font-bold uppercase text-black transition hover:bg-black hover:text-white cursor-pointer min-h-[38px]"
            >
              <Download className="h-3.5 w-3.5" />
              Export JSON
            </button>

            {isAdmin && (
              <button
                onClick={onOpenImportModal}
                title="Import / Restore registry data from JSON backup (offline or online)"
                className="flex items-center gap-1 border border-black bg-neutral-100 px-2.5 py-2 text-xs font-bold uppercase text-black transition hover:bg-black hover:text-white cursor-pointer min-h-[38px]"
              >
                <Upload className="h-3.5 w-3.5" />
                Import JSON
              </button>
            )}

            {isAdmin && (
              <button
                onClick={onResetData}
                title="Reset Database to Standard Chambers Seed Data"
                className="flex items-center gap-1 border border-black bg-white px-2 py-2 text-xs text-black transition hover:bg-black hover:text-white cursor-pointer min-h-[38px]"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
