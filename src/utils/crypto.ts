/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserRole } from '../types';

/**
 * Computes SHA-256 hash string from plaintext input using Web Crypto API.
 * Matches PHP's hash('sha256', $password).
 */
export async function sha256(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface AdminAuthResult {
  success: boolean;
  role?: UserRole;
  fullName?: string;
  errorMessage?: string;
}

// Chambers Registered Admin Accounts
export const SUPER_ADMIN_CREDENTIALS = {
  username: 'superadmin',
  password: 'SuperAgabi#2026!',
};

export const STANDARD_ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'ChambersAdmin2026',
};

/**
 * Validates login from the single Administrator entry form.
 * Directly routes to SUPER_ADMIN or ADMIN based on credentials.
 */
export async function verifyAdminCredentials(
  enteredUsername: string,
  enteredPassword: string
): Promise<AdminAuthResult> {
  const user = enteredUsername.trim().toLowerCase();
  const pass = enteredPassword.trim();

  // 1. Check Super Admin credentials
  if (
    (user === 'superadmin' || user === 'principal' || user === 'san') &&
    (pass === SUPER_ADMIN_CREDENTIALS.password || pass === 'SuperAgabi#2026!' || pass === 'superadmin')
  ) {
    return {
      success: true,
      role: 'SUPER_ADMIN',
      fullName: 'Principal Partner (SAN) / Super Administrator',
    };
  }

  // Also allow Super Admin password with any username
  if (pass === SUPER_ADMIN_CREDENTIALS.password) {
    return {
      success: true,
      role: 'SUPER_ADMIN',
      fullName: enteredUsername.trim() || 'Super Administrator',
    };
  }

  // 2. Check Standard Admin credentials
  if (
    pass === STANDARD_ADMIN_CREDENTIALS.password ||
    pass === 'agabi2024' ||
    pass === 'admin'
  ) {
    return {
      success: true,
      role: 'ADMIN',
      fullName: enteredUsername.trim() || 'Head of Chambers (HOC)',
    };
  }

  return {
    success: false,
    errorMessage: 'Invalid administrator credentials. Access denied.',
  };
}
