/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserSession } from '../types';
import { verifyAdminCredentials } from '../utils/crypto';
import { ShieldCheck, User, X, Check, Key } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSession: UserSession;
  onUpdateSession: (newSession: UserSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentSession,
  onUpdateSession,
}) => {
  const [activeTab, setActiveTab] = useState<'ADMIN' | 'GUEST'>('ADMIN');

  // Admin form state
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Guest form state
  const [guestName, setGuestName] = useState('');
  const [guestChamber, setGuestChamber] = useState('');
  const [guestError, setGuestError] = useState('');

  if (!isOpen) return null;

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    setIsVerifying(true);

    try {
      const result = await verifyAdminCredentials(adminUsername, adminPassword);

      if (result.success && result.role) {
        const session: UserSession = {
          role: result.role,
          userName: result.fullName || adminUsername.trim() || 'Administrator',
          chamberUnit: result.role === 'SUPER_ADMIN' ? 'Executive Chambers & Systems' : 'Chamber Administration',
          loggedInAt: new Date().toISOString(),
        };
        onUpdateSession(session);
        onClose();
      } else {
        setAdminError(result.errorMessage || 'Invalid administrator credentials. Access denied.');
      }
    } catch (err) {
      setAdminError('Cryptographic verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGuestLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setGuestError('');

    if (!guestName.trim()) {
      setGuestError('Name is mandatory for Guest access.');
      return;
    }

    if (!guestChamber.trim()) {
      setGuestError('Chamber / Unit is mandatory for registry logging.');
      return;
    }

    const session: UserSession = {
      role: 'GUEST',
      userName: guestName.trim(),
      chamberUnit: guestChamber.trim(),
      loggedInAt: new Date().toISOString(),
    };
    onUpdateSession(session);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md border-4 border-black bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-black pb-3">
          <div>
            <h3 className="text-base font-bold uppercase tracking-tight text-black">
              Chambers Authentication & Access Control
            </h3>
            <p className="text-[11px] uppercase tracking-wider text-black">
              Kanu G. Agabi & Associates · File Room
            </p>
          </div>
          <button
            onClick={onClose}
            className="border border-black p-1 hover:bg-black hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Switcher: Admin Mode vs Guest Mode */}
        <div className="mt-4 grid grid-cols-2 border-2 border-black">
          <button
            type="button"
            onClick={() => setActiveTab('ADMIN')}
            className={`py-2 text-xs font-bold uppercase cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'ADMIN'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-neutral-100'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            Admin Mode (CRUD)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('GUEST')}
            className={`py-2 text-xs font-bold uppercase cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'GUEST'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-neutral-100'
            }`}
          >
            <User className="h-4 w-4" />
            Guest Mode (Read-Only)
          </button>
        </div>

        {/* Admin Form */}
        {activeTab === 'ADMIN' && (
          <form onSubmit={handleAdminLogin} className="mt-4 space-y-4 text-xs">
            <div className="border border-black bg-neutral-100 p-2 text-[11px] uppercase">
              <span className="font-bold">Privileged Role:</span> Full Create, Read, Update, and Delete permissions. Requires SHA-256 encrypted password authentication.
            </div>

            {adminError && (
              <div className="border border-black bg-black text-white p-2 font-bold uppercase text-[11px]">
                {adminError}
              </div>
            )}

            <div>
              <label className="block font-bold uppercase tracking-wider text-black">
                Administrator Designation
              </label>
              <input
                type="text"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                placeholder="e.g. Head of Chambers (HOC) or Registry Secretary"
                className="mt-1 w-full border-2 border-black bg-white p-2 text-xs text-black focus:outline-none focus:ring-1 focus:ring-black"
                required
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-black">
                Encrypted Password (SHA-256)
              </label>
              <div className="relative mt-1">
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  className="w-full border-2 border-black bg-white p-2 text-xs text-black focus:outline-none focus:ring-1 focus:ring-black"
                  required
                />
              </div>
            </div>

            <div className="border-t-2 border-black pt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="border border-black bg-white px-4 py-2 text-xs font-bold uppercase text-black hover:bg-neutral-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isVerifying}
                className="flex items-center gap-1.5 border-2 border-black bg-black px-5 py-2 text-xs font-bold uppercase text-white hover:bg-neutral-800 cursor-pointer"
              >
                <Key className="h-3.5 w-3.5" />
                {isVerifying ? 'Verifying Hash...' : 'Authorize Admin'}
              </button>
            </div>
          </form>
        )}

        {/* Guest Form */}
        {activeTab === 'GUEST' && (
          <form onSubmit={handleGuestLogin} className="mt-4 space-y-4 text-xs">
            <div className="border border-black bg-neutral-100 p-2 text-[11px] uppercase">
              <span className="font-bold">Guest Mode:</span> Open read-only access for chamber visitors, counsel, and externs. Requires Name and Chamber designation.
            </div>

            {guestError && (
              <div className="border border-black bg-black text-white p-2 font-bold uppercase text-[11px]">
                {guestError}
              </div>
            )}

            <div>
              <label className="block font-bold uppercase tracking-wider text-black">
                Full Name *
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Barrister T. A. Danjuma or Law Intern"
                className="mt-1 w-full border-2 border-black bg-white p-2 text-xs uppercase text-black focus:outline-none focus:ring-1 focus:ring-black"
                required
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-black">
                Chamber / Department / Organization *
              </label>
              <input
                type="text"
                value={guestChamber}
                onChange={(e) => setGuestChamber(e.target.value)}
                placeholder="e.g. Litigation Dept, Commercial Unit, External Counsel"
                className="mt-1 w-full border-2 border-black bg-white p-2 text-xs text-black focus:outline-none focus:ring-1 focus:ring-black"
                required
              />
            </div>

            <div className="border-t-2 border-black pt-4 flex items-center justify-end gap-2">
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
                <Check className="h-3.5 w-3.5" />
                Enter as Guest
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
