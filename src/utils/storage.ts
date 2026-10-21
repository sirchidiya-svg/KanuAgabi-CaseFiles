/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { INITIAL_CASE_FILES, INITIAL_MOVEMENT_LOGS, STANDARD_CHAMBERS_COURTS } from '../data/seedData';
import { CaseFile, CourtSummary, FileMovement, UserSession } from '../types';
import { getRemarkDisplayPlain } from './remarkHelper';

const STORAGE_KEYS = {
  CASE_FILES: 'kanu_agabi_case_files_v3',
  MOVEMENTS: 'kanu_agabi_movements_v3',
  SESSION: 'kanu_agabi_session_v1',
};

// Remove deprecated v1 and v2 storage
try {
  if (localStorage.getItem('kanu_agabi_case_files_v1')) {
    localStorage.removeItem('kanu_agabi_case_files_v1');
  }
  if (localStorage.getItem('kanu_agabi_movements_v1')) {
    localStorage.removeItem('kanu_agabi_movements_v1');
  }
  if (localStorage.getItem('kanu_agabi_case_files_v2')) {
    localStorage.removeItem('kanu_agabi_case_files_v2');
  }
} catch {
  // Ignore in SSR / restricted storage environments
}

export function getStoredCaseFiles(): CaseFile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CASE_FILES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CASE_FILES, JSON.stringify(INITIAL_CASE_FILES));
      return INITIAL_CASE_FILES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load case files from storage', err);
    return INITIAL_CASE_FILES;
  }
}

export function saveCaseFiles(files: CaseFile[]): void {
  localStorage.setItem(STORAGE_KEYS.CASE_FILES, JSON.stringify(files));
}

export function getStoredMovements(): FileMovement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(INITIAL_MOVEMENT_LOGS));
      return INITIAL_MOVEMENT_LOGS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load movements', err);
    return INITIAL_MOVEMENT_LOGS;
  }
}

export function saveMovements(movements: FileMovement[]): void {
  localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
}

export function getStoredSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSession(session: UserSession | null): void {
  if (session) {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

export function resetDatabaseToDefaults(): { files: CaseFile[]; movements: FileMovement[] } {
  localStorage.setItem(STORAGE_KEYS.CASE_FILES, JSON.stringify(INITIAL_CASE_FILES));
  localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(INITIAL_MOVEMENT_LOGS));
  return { files: INITIAL_CASE_FILES, movements: INITIAL_MOVEMENT_LOGS };
}

/**
 * Group case files by CourtName for Court-First navigation.
 * Standard chambers courts are always pre-established so the proper courts
 * are organized and accessible even before cases are filled from the typed document.
 */
export function groupFilesByCourt(files: CaseFile[]): CourtSummary[] {
  const groups: Record<string, CaseFile[]> = {};

  // 1. Pre-seed standard chambers courts so they are established in their proper hierarchy
  STANDARD_CHAMBERS_COURTS.forEach((courtName) => {
    groups[courtName] = [];
  });

  // 2. Populate case files into their proper courts
  files.forEach((file) => {
    const court = file.courtName?.trim() || 'Unspecified Jurisdiction';
    if (!groups[court]) {
      groups[court] = [];
    }
    groups[court].push(file);
  });

  // Sort courts with Supreme Court, Court of Appeal, Federal High Court, FCT High Court, NICN, Magistrate Court
  const courtRank = (c: string) => {
    if (c.includes('Supreme Court')) return 1;
    if (c.includes('Court of Appeal')) return 2;
    if (c.includes('Federal High Court')) return 3;
    if (c.includes('FCT High Court') || c.includes('High Court')) return 4;
    if (c.includes('National Industrial Court')) return 5;
    if (c.includes('Magistrate Court')) return 6;
    return 7;
  };

  return Object.keys(groups)
    .sort((a, b) => courtRank(a) - courtRank(b) || a.localeCompare(b))
    .map((courtName) => {
      const courtFiles = groups[courtName];
      return {
        courtName,
        files: courtFiles,
        totalCount: courtFiles.length,
        activeCount: courtFiles.filter((f) => f.status === 'Active').length,
        pendingCount: courtFiles.filter((f) => f.status === 'Pending').length,
        concludedCount: courtFiles.filter((f) => f.status === 'Concluded').length,
        abandonedCount: courtFiles.filter((f) => f.status === 'Abandoned').length,
      };
    });
}

/**
 * Export files to CSV string with normalized remarks
 */
export function exportToCSV(files: CaseFile[]): string {
  const headers = ['SuitNumber', 'CourtName', 'CaseTitle', 'ShelfNumber', 'Status', 'Remark', 'AssignedCounsel', 'BoxOrBay'];
  const rows = files.map((f) => [
    `"${(f.suitNumber || '').replace(/"/g, '""')}"`,
    `"${(f.courtName || '').replace(/"/g, '""')}"`,
    `"${(f.caseTitle || '').replace(/"/g, '""')}"`,
    `"${(f.shelfNumber || '').replace(/"/g, '""')}"`,
    `"${(f.status || '').replace(/"/g, '""')}"`,
    `"${getRemarkDisplayPlain(f.remark).replace(/"/g, '""')}"`,
    `"${(f.assignedCounsel || '').replace(/"/g, '""')}"`,
    `"${(f.boxOrBay || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

/**
 * Trigger browser file download (supports string content or Blob)
 */
export function downloadFile(content: string | Blob, filename: string, mimeType?: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType || 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
