/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserSession } from '../types';
import { verifyAdminCredentials } from '../utils/crypto';
import { ShieldCheck, User, Lock, ArrowRight, Server, Database, Touchpad, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (session: UserSession) => void;
  totalFilesCount: number;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  totalFilesCount,
}) => {
  // NONE HIGHLIGHTED INITIALLY as requested
  const [mode, setMode] = useState<'ADMIN' | 'GUEST' | null>(null);

  // Inputs start completely empty - NO pre-filled text, placeholders only
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const [guestName, setGuestName] = useState('');
  const [guestChamber, setGuestChamber] = useState('');
  const [guestError, setGuestError] = useState('');

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    setIsVerifying(true);

    try {
      const cleanUser = adminUsername.trim();
      const cleanPass = adminPassword.trim();

      if (!cleanUser) {
        setAdminError('Administrator Username / Designation is required.');
        setIsVerifying(false);
        return;
      }

      if (!cleanPass) {
        setAdminError('Password is required.');
        setIsVerifying(false);
        return;
      }

      const result = await verifyAdminCredentials(cleanUser, cleanPass);

      if (result.success && result.role) {
        const session: UserSession = {
          role: result.role,
          userName: result.fullName || cleanUser,
          chamberUnit: result.role === 'SUPER_ADMIN' ? 'Executive Chambers & Systems' : 'Chamber Administration',
          loggedInAt: new Date().toISOString(),
        };
        onLoginSuccess(session);
      } else {
        setAdminError(result.errorMessage || 'Invalid credentials. Access denied.');
      }
    } catch {
      setAdminError('Cryptographic verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGuestError('');

    const cleanName = guestName.trim();
    const cleanChamber = guestChamber.trim();

    if (!cleanName) {
      setGuestError('Full Name is required for guest registry entry.');
      return;
    }

    if (!cleanChamber) {
      setGuestError('Chamber / Department / Organization is required.');
      return;
    }

    const session: UserSession = {
      role: 'GUEST',
      userName: cleanName,
      chamberUnit: cleanChamber,
      loggedInAt: new Date().toISOString(),
    };
    onLoginSuccess(session);
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-between selection:bg-black selection:text-white">
      {/* Main Login Gate */}
      <div className="mx-auto w-full max-w-xl px-4 py-6 sm:py-10">
        <div className="border-4 border-black p-5 sm:p-8 bg-white shadow-lg">
          {/* Law Firm Crest Block */}
          <div className="text-center border-b-2 border-black pb-4">
            <div className="text-[11px] font-bold uppercase tracking-widest text-neutral-600">
              Federal Capital Territory · Nigeria
            </div>
            <h1 className="mt-1 text-2xl font-bold uppercase tracking-tight text-black sm:text-3xl">
              Kanu G. Agabi & Associates
            </h1>
            <p className="mt-0.5 text-xs font-bold uppercase tracking-wider text-black">
              Legal Practitioners, Arbitrators & Notaries Public
            </p>
            <div className="mt-2 border-t border-black pt-2 text-xs font-bold uppercase tracking-widest">
              Case File Inventory & Tracking System
            </div>
          </div>

          {/* Mode Selection Heading */}
          <div className="mt-5 text-center">
            <div className="text-xs font-bold uppercase tracking-wider text-black">
              Select User Role to Proceed:
            </div>
            <p className="text-[11px] text-neutral-600 uppercase mt-0.5">
              Tap a mode below to view capabilities and open login
            </p>
          </div>

          {/* Mode Selector Tabs (INITIALLY NEITHER IS HIGHLIGHTED) */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 border-2 border-black p-1.5 bg-neutral-100">
            <button
              type="button"
              onClick={() => setMode('ADMIN')}
              className={`py-3 px-3 text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 transition border ${
                mode === 'ADMIN'
                  ? 'bg-black text-white border-black shadow-sm'
                  : 'bg-white text-black border-black/40 hover:border-black'
              }`}
            >
              <ShieldCheck className="h-4 w-4 shrink-0" />
              1. Administrator Mode
              {mode === 'ADMIN' && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
            </button>

            <button
              type="button"
              onClick={() => setMode('GUEST')}
              className={`py-3 px-3 text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 transition border ${
                mode === 'GUEST'
                  ? 'bg-black text-white border-black shadow-sm'
                  : 'bg-white text-black border-black/40 hover:border-black'
              }`}
            >
              <User className="h-4 w-4 shrink-0" />
              2. Guest Mode (Read-Only)
              {mode === 'GUEST' && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
            </button>
          </div>

          {/* If Neither Mode is Selected Yet */}
          {mode === null && (
            <div className="mt-6 border-2 border-dashed border-black p-5 text-center bg-neutral-50">
              <Touchpad className="mx-auto h-7 w-7 text-black mb-2" />
              <div className="font-bold text-xs uppercase tracking-wide text-black">
                No Access Mode Selected
              </div>
              <p className="mt-1 text-xs text-neutral-600 leading-relaxed max-w-sm mx-auto">
                Please tap either <strong>Administrator Mode</strong> or <strong>Guest Mode</strong> above. Selecting a role will display the description of privileges and present the corresponding entry form.
              </p>
            </div>
          )}

          {/* Administrator Form & Description */}
          {mode === 'ADMIN' && (
            <form onSubmit={handleAdminSubmit} className="mt-5 space-y-4 text-xs">
              {/* Detailed Description of what Admin can do */}
              <div className="border-2 border-black bg-neutral-100 p-3 sm:p-4 text-black">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wide text-xs">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  What an Administrator Can Do:
                </div>
                <ul className="mt-2 space-y-1 text-xs leading-relaxed list-disc list-inside">
                  <li><strong>Full Create, Read, Update, Delete (CRUD)</strong> over all litigation and arbitration files.</li>
                  <li><strong>Enroll New Case Files</strong> and allocate physical shelf numbers across File Rooms 1 & 2.</li>
                  <li><strong>Modify Case Status</strong> (Active, Pending, Concluded, Abandoned) and file details.</li>
                  <li><strong>Delete Case Files</strong> (strictly guarded by JavaScript confirmation modal).</li>
                  <li><strong>Authorize File Movements</strong> and audit chain of custody check-outs.</li>
                </ul>
                <div className="mt-2 border-t border-black/40 pt-1.5 text-[10px] font-bold uppercase text-neutral-700">
                  Secured with SHA-256 cryptographic password authentication.
                </div>
              </div>

              {adminError && (
                <div className="border-2 border-black bg-black text-white p-2.5 text-xs font-bold uppercase">
                  Authentication Failed: {adminError}
                </div>
              )}

              {/* Admin Username - Placeholder Only */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-black">
                  Administrator Username / Designation *
                </label>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="e.g. Head of Chambers (HOC) or Registry Clerk"
                  className="mt-1 w-full border-2 border-black bg-white p-2.5 text-xs text-black placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-black"
                  required
                />
              </div>

              {/* Admin Password - Placeholder Only */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-black">
                  Encrypted Master Password (SHA-256) *
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  className="mt-1 w-full border-2 border-black bg-white p-2.5 text-xs text-black placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-black font-mono"
                  required
                />
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full flex items-center justify-center gap-2 border-2 border-black bg-black py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 transition cursor-pointer min-h-[44px]"
                >
                  <Lock className="h-4 w-4" />
                  {isVerifying ? 'Verifying SHA-256 Hash...' : 'Authenticate & Enter File Room'}
                </button>
              </div>
            </form>
          )}

          {/* Guest Form & Description */}
          {mode === 'GUEST' && (
            <form onSubmit={handleGuestSubmit} className="mt-5 space-y-4 text-xs">
              {/* Detailed Description of what Guest can do */}
              <div className="border-2 border-black bg-neutral-100 p-3 sm:p-4 text-black">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wide text-xs">
                  <User className="h-4 w-4 shrink-0" />
                  What a Guest Can Do:
                </div>
                <ul className="mt-2 space-y-1 text-xs leading-relaxed list-disc list-inside">
                  <li><strong>Strict Read-Only Access</strong> for chamber counsel, externs, researchers, and visitors.</li>
                  <li><strong>Search and Filter</strong> case files by Court jurisdiction, status, and physical shelf.</li>
                  <li><strong>Inspect Physical Shelf Locations</strong> to locate bundles in File Room 1 & File Room 2.</li>
                  <li><strong>View & Print Physical File Dockets</strong> (official file jacket covers for litigation folders).</li>
                  <li><strong>View Chain of Custody</strong> to verify if a case file is currently checked out to Court.</li>
                </ul>
                <div className="mt-2 border-t border-black/40 pt-1.5 text-[10px] font-bold uppercase text-neutral-700">
                  Open registry access · Requires only Full Name and Chamber designation.
                </div>
              </div>

              {guestError && (
                <div className="border-2 border-black bg-black text-white p-2.5 text-xs font-bold uppercase">
                  {guestError}
                </div>
              )}

              {/* Guest Name - Placeholder Only */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-black">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Barrister T. A. Danjuma or Law Intern"
                  className="mt-1 w-full border-2 border-black bg-white p-2.5 text-xs uppercase text-black placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-black"
                  required
                />
              </div>

              {/* Guest Chamber - Placeholder Only */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-black">
                  Chamber Unit / Department / Organization *
                </label>
                <input
                  type="text"
                  value={guestChamber}
                  onChange={(e) => setGuestChamber(e.target.value)}
                  placeholder="e.g. Litigation Department, Commercial Division, External Law Office"
                  className="mt-1 w-full border-2 border-black bg-white p-2.5 text-xs text-black placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-black"
                  required
                />
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 border-2 border-black bg-black py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 transition cursor-pointer min-h-[44px]"
                >
                  <ArrowRight className="h-4 w-4" />
                  Proceed as Guest (Read-Only)
                </button>
              </div>
            </form>
          )}

          {/* Network Architecture Footer */}
          <div className="mt-6 border-t-2 border-black pt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] uppercase">
            <div className="border border-black p-2">
              <span className="font-bold flex items-center gap-1 text-black">
                <Server className="h-3 w-3" />
                Network Architecture:
              </span>
              <div className="mt-0.5 text-neutral-600">
                XAMPP / Local Wi-Fi Hotspot
              </div>
            </div>
            <div className="border border-black p-2">
              <span className="font-bold flex items-center gap-1 text-black">
                <Database className="h-3 w-3" />
                Backend Security:
              </span>
              <div className="mt-0.5 text-neutral-600">
                PHP (mysqli) & SHA-256
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-black bg-white py-3 text-center text-xs text-black">
        <div className="mx-auto max-w-5xl px-4 text-center text-[11px] font-bold uppercase tracking-wider">
          Kanu G. Agabi & Associates · Legal Practitioners, Arbitrators & Notaries Public
        </div>
      </footer>
    </div>
  );
};
