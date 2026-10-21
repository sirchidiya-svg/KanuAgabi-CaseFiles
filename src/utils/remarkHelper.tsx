/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

/**
 * Checks whether a remark is empty, null, whitespace, or contains asterisk notation
 * indicating that nothing has been done or written about it yet.
 */
export function isRemarkEmptyOrAsterisk(remark?: string | null): boolean {
  if (!remark) return true;
  const trimmed = remark.trim();
  if (trimmed === '' || trimmed === '-' || trimmed === '--' || trimmed === '---') return true;

  // Contains any asterisk (*, **, ***, or asterisk anywhere in text)
  if (trimmed.includes('*')) return true;

  // Consists only of punctuation, dots, or dashes
  if (/^[*.\-\s_#]+$/.test(trimmed)) return true;

  // Standard non-action keywords
  const lower = trimmed.toLowerCase();
  if (
    lower === 'nil' ||
    lower === 'none' ||
    lower === 'n/a' ||
    lower === 'na' ||
    lower === 'null' ||
    lower === 'no action' ||
    lower === 'nothing written' ||
    lower === 'pending'
  ) {
    return true;
  }

  return false;
}

/**
 * Returns plain text representation of the remark for print tables and exports.
 */
export function getRemarkDisplayPlain(remark?: string | null): string {
  if (isRemarkEmptyOrAsterisk(remark)) {
    const trimmed = remark ? remark.trim().replace(/^[*.\-\s]+/, '').trim() : '';
    if (trimmed && trimmed.toLowerCase() !== 'nil' && trimmed.toLowerCase() !== 'none') {
      return `[NO ACTION RECORDED / PENDING ENTRY] (${trimmed})`;
    }
    return '[NO ACTION RECORDED / PENDING ENTRY]';
  }
  return remark || '';
}

/**
 * Clean reusable component to display remarks with the requested tag
 * for cases without remarks or with asterisks.
 */
export const RemarkDisplay: React.FC<{ remark?: string | null; className?: string }> = ({
  remark,
  className = '',
}) => {
  const isPending = isRemarkEmptyOrAsterisk(remark);

  if (isPending) {
    // Check if there was additional text attached after asterisks
    const cleanedNote = remark
      ? remark.trim().replace(/^[*.\-\s]+/, '').trim()
      : '';
    const hasExtraNote =
      cleanedNote !== '' &&
      cleanedNote.toLowerCase() !== 'nil' &&
      cleanedNote.toLowerCase() !== 'none' &&
      cleanedNote.toLowerCase() !== 'n/a';

    return (
      <div className={`space-y-1 ${className}`}>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="border border-black bg-neutral-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black inline-block">
            [NO ACTION RECORDED / PENDING ENTRY]
          </span>
        </div>
        {hasExtraNote && (
          <div className="text-[11px] text-neutral-700 italic">
            Note: {cleanedNote}
          </div>
        )}
      </div>
    );
  }

  return <p className={`text-xs leading-relaxed text-black ${className}`}>{remark}</p>;
};
