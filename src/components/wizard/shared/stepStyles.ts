/**
 * stepStyles.ts
 * Shared inline style objects used across multiple wizard step components.
 * Import the ones you need instead of repeating them per-file.
 */
import type { CSSProperties } from 'react';

// ── Step root ──────────────────────────────────────────────────────────────
/** Outer wrapper for every step page.  Use CSS class "step-page" instead when possible. */
export const stepPageStyle: CSSProperties = {
    padding: 'var(--wiz-spacing-8)',
};

/** h2 page title — identical in every step */
export const stepPageTitleStyle: CSSProperties = {
    fontSize: 'var(--wiz-font-size-3xl)',
    fontWeight: 'bold',
    marginBottom: 'var(--wiz-spacing-4)',
};

/** p subtitle below the page title */
export const stepPageSubtitleStyle: CSSProperties = {
    fontSize: 'var(--wiz-font-size-lg)',
    color: 'var(--wiz-color-gray-500)',
    marginBottom: 'var(--wiz-spacing-4)',
};

// ── Section card ───────────────────────────────────────────────────────────
export const sectionCardStyle: CSSProperties = {
    backgroundColor: 'white',
    border: '2px solid var(--wiz-color-gray-200)',
    borderRadius: 'var(--wiz-radius-lg)',
    padding: 'var(--wiz-spacing-6)',
    boxShadow: 'var(--wiz-shadow-md)',
};

export const sectionTitleStyle: CSSProperties = {
    fontSize: 'var(--wiz-font-size-2xl)',
    fontWeight: 'bold',
    color: 'var(--wiz-color-gray-800)',
    marginBottom: 'var(--wiz-spacing-4)',
    borderBottom: '2px solid var(--wiz-color-gray-200)',
    paddingBottom: 'var(--wiz-spacing-2)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--wiz-spacing-2)',
};

// ── Card inside section ────────────────────────────────────────────────────
export const innerCardStyle: CSSProperties = {
    backgroundColor: 'var(--wiz-color-gray-50)',
    border: '1px solid var(--wiz-color-gray-200)',
    borderRadius: 'var(--wiz-radius-md)',
    padding: 'var(--wiz-spacing-4)',
    marginBottom: 'var(--wiz-spacing-4)',
};

// ── Form elements ──────────────────────────────────────────────────────────
export const fieldLabelStyle: CSSProperties = {
    display: 'block',
    fontSize: 'var(--wiz-font-size-sm)',
    fontWeight: 'bold',
    color: 'var(--wiz-color-gray-600)',
    marginBottom: 'var(--wiz-spacing-2)',
};

export const textInputStyle: CSSProperties = {
    width: '100%',
    padding: 'var(--wiz-spacing-3)',
    border: '1px solid var(--wiz-color-gray-300)',
    borderRadius: 'var(--wiz-radius-sm)',
    fontSize: 'var(--wiz-font-size-base)',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
};

export const selectInputStyle: CSSProperties = {
    width: '100%',
    padding: 'var(--wiz-spacing-3)',
    border: '1px solid var(--wiz-color-gray-300)',
    borderRadius: 'var(--wiz-radius-sm)',
    fontSize: 'var(--wiz-font-size-base)',
    backgroundColor: 'white',
    cursor: 'pointer',
    boxSizing: 'border-box',
};

export const primaryButtonStyle: CSSProperties = {
    backgroundColor: 'var(--wiz-color-primary-600)',
    color: 'white',
    padding: 'var(--wiz-spacing-2) var(--wiz-spacing-4)',
    borderRadius: 'var(--wiz-radius-sm)',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: 'none',
    transition: 'background-color 0.2s',
};

export const dangerButtonStyle: CSSProperties = {
    backgroundColor: 'var(--wiz-color-danger)',
    color: 'white',
    padding: 'var(--wiz-spacing-2) var(--wiz-spacing-4)',
    borderRadius: 'var(--wiz-radius-sm)',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: 'none',
    transition: 'background-color 0.2s',
};

// ── Number input (for characteristics) ────────────────────────────────────
export const numberInputStyle: CSSProperties = {
    width: '100%',
    padding: 'var(--wiz-spacing-3)',
    fontSize: 'var(--wiz-font-size-base)',
    border: '2px solid var(--wiz-color-gray-300)',
    borderRadius: 'var(--wiz-radius-md)',
    textAlign: 'center',
    fontWeight: 'bold',
    boxSizing: 'border-box',
};
