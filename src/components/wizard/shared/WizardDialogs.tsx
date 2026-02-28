import React from 'react';
import './WizardDialogs.css';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type?: ToastType;
    onClose: () => void;
}

export function WizardToast({ message, type = 'info', onClose }: ToastProps) {
    const toastClass = type === 'success' ? 'toast-success' : type === 'error' ? 'toast-error' : 'toast-info';

    return (
        <div className={`wizard-toast ${toastClass}`}>
            <span>{type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            <span>{message}</span>
            <button onClick={onClose} className="wizard-toast-close">
                ×
            </button>
        </div>
    );
}

interface ConfirmProps {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export function WizardConfirm({ message, onConfirm, onCancel }: ConfirmProps) {
    return (
        <div className="wizard-confirm-overlay">
            <div className="wizard-confirm-box">
                <div className="wizard-confirm-icon">⚠️</div>
                <h3 className="wizard-confirm-title">
                    Confirmación
                </h3>
                <p className="wizard-confirm-message">
                    {message}
                </p>
                <div className="wizard-confirm-actions">
                    <button onClick={onCancel} className="wizard-confirm-btn btn-cancel">
                        Cancelar
                    </button>
                    <button onClick={onConfirm} className="wizard-confirm-btn btn-danger">
                        Sí, continuar
                    </button>
                </div>
            </div>
        </div>
    );
}

