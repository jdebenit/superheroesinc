import React from 'react';
import '../TacticPlayerTerminal.css';
import Modal from './Modal';

interface DiceResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    result: {
        total: number;
        detail: string;
        originalDice: string;
    } | null;
}

export default function DiceResultModal({ isOpen, onClose, title, result }: DiceResultModalProps) {
    if (!isOpen || !result) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            className="dice-result-modal"
            contentStyle={{ maxWidth: '300px', textAlign: 'center' }}
        >
            <div className="dice-result-content">
                <div className="dice-source" style={{ color: '#aaa', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    Tirada: {result.originalDice}
                </div>

                <div className="dice-total" style={{
                    fontSize: '3rem',
                    fontWeight: 'bold',
                    color: '#4ecdc4',
                    margin: '1rem 0'
                }}>
                    {result.total}
                </div>

                <div className="dice-detail" style={{
                    backgroundColor: '#222',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '1rem',
                    color: '#ddd'
                }}>
                    {result.detail}
                </div>

                <button
                    onClick={onClose}
                    className="btn-primary"
                    style={{ marginTop: '1.5rem', width: '100%' }}
                >
                    ACEPTAR
                </button>
            </div>
        </Modal>
    );
}
