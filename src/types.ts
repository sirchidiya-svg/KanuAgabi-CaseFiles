/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type FileStatus = 'Active' | 'Pending' | 'Concluded' | 'Abandoned';

export interface CaseFile {
  id?: string;              // Unique record ID (e.g., KGA-0001)
  suitNumber: string;       // Suit Number (e.g., SC/CV/1042/2021, CA/A/455/2022)
  courtName: string;        // Jurisdiction (e.g., Supreme Court of Nigeria)
  caseTitle: string;        // E.g., Chief Emmanuel Okonkwo & Ors v. AGF
  shelfNumber: string;      // Physical inventory location (e.g., Shelf A1, Shelf B2)
  status: FileStatus;       // Enum: Active, Pending, Concluded, Abandoned
  remark: string;           // Physical notes, chamber counsel, brief stage, next dates
  dateAdded?: string;       // ISO date or formatted date
  assignedCounsel?: string; // Counsel handling
  boxOrBay?: string;        // Optional Bay / Room designation (e.g. Registry Bay A)
}

export interface FileMovement {
  id: string;
  suitNumber: string;
  caseTitle: string;
  borrowerName: string;     // Counsel or clerk
  chamberUnit: string;      // E.g., Litigation Unit A, Arbitration Dept
  dateCheckedOut: string;
  expectedReturnDate: string;
  dateReturned: string | null; // null if still out
  purpose: string;          // E.g., Hearing in Court 3, Brief Drafting, Client Conference
  approvedBy: string;       // Admin / HOC
}

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'GUEST';

export interface UserSession {
  role: UserRole;
  userName: string;
  chamberUnit?: string;
  loggedInAt: string;
}

export interface CourtSummary {
  courtName: string;
  files: CaseFile[];
  totalCount: number;
  activeCount: number;
  pendingCount: number;
  concludedCount: number;
  abandonedCount: number;
}
