import React, { useState } from 'react';
import { MAGICAL_BONDS } from '../../../../../data/magicalBonds';

interface MagicalBondsModalProps {
    isOpen: boolean;
    selectedBonds: string[];
    onClose: () => void;
    onToggleBond: (bondId: string) => void;
}

export default function MagicalBondsModal({
    isOpen,
    selectedBonds,
    onClose,
    onToggleBond
}: MagicalBondsModalProps) {
    const [searchTerm, setSearchTerm] = useState("");

    if (!isOpen) return null;

    const filteredBonds = MAGICAL_BONDS.filter(bond =>
        searchTerm === "" ||
        bond.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bond.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="wizard-modal-overlay" onClick={onClose}>
            <div className="wizard-modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">Seleccionar Vinculación Mágica</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="controls-section">
                    <input
                        type="text"
                        placeholder="Buscar vinculación..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                        autoFocus
                    />
                </div>

                <div className="modal-scroll-area">
                    <div className="powers-grid">
                        {filteredBonds.map((bond) => {
                            const isSelected = selectedBonds.includes(bond.id);
                            return (
                                <div
                                    key={bond.id}
                                    className={`power-card ${isSelected ? 'selected' : ''}`}
                                    onClick={() => {
                                        onToggleBond(bond.id);
                                        onClose();
                                    }}
                                >
                                    {isSelected && <div className="selected-badge">✓</div>}
                                    <h3>{bond.name}</h3>
                                    <div className="power-details">
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>
                                            {bond.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="modal-footer">
                    <button
                        className="confirm-button"
                        onClick={onClose}
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
