/**
 * stepStyles.ts
 * Shared inline style objects used across multiple wizard step components.
 * Import the ones you need instead of repeating them per-file.
 */
import type { CSSProperties } from 'react';

// ── Step root ──────────────────────────────────────────────────────────────
/** Outer wrapper for every step page.  Use CSS class "step-page" instead when possible. */
export const stepPageStyle: CSSProperties = {
    padding: '2rem',
};

/** h2 page title — identical in every step */
export const stepPageTitleStyle: CSSProperties = {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
};

/** p subtitle below the page title */
export const stepPageSubtitleStyle: CSSProperties = {
    fontSize: '1.125rem',
    color: '#666',
    marginBottom: '1rem',
};

// ── Section card ───────────────────────────────────────────────────────────
export const sectionCardStyle: CSSProperties = {
    backgroundColor: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
};

export const sectionTitleStyle: CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '1rem',
    borderBottom: '2px solid #e5e7eb',
    paddingBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
};

// ── Card inside section ────────────────────────────────────────────────────
export const innerCardStyle: CSSProperties = {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
};

// ── Form elements ──────────────────────────────────────────────────────────
export const fieldLabelStyle: CSSProperties = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 'bold',
    color: '#4b5563',
    marginBottom: '0.5rem',
};

export const textInputStyle: CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '1rem',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
};

export const selectInputStyle: CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '1rem',
    backgroundColor: 'white',
    cursor: 'pointer',
    boxSizing: 'border-box',
};

export const primaryButtonStyle: CSSProperties = {
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: 'none',
    transition: 'background-color 0.2s',
};

export const dangerButtonStyle: CSSProperties = {
    backgroundColor: '#dc2626',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: 'none',
    transition: 'background-color 0.2s',
};

// ── Number input (for characteristics) ────────────────────────────────────
export const numberInputStyle: CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1rem',
    border: '2px solid #d1d5db',
    borderRadius: '8px',
    textAlign: 'center',
    fontWeight: 'bold',
    boxSizing: 'border-box',
};
