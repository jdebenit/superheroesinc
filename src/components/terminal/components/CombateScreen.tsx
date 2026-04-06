import React, { useState } from 'react';
import { type TmtCharacterEntry, type TmtGroup, type HistoryEntry } from '../hooks/useTmtStore';
import { getIniciativa, getBaseIniciativa } from '../utils/tmtUtils';
import GroupFilterBar from './GroupFilterBar';
import InitiativeRow from './InitiativeRow';
import CombatCard from './CombatCard';
import CombatTable from './CombatTable';
import EditStatModal from './EditStatModal';
import HistoryModal from './HistoryModal';
import Modal from './Modal';
import './CombateScreen.css';

interface CombateScreenProps {
    characters: TmtCharacterEntry[];
    groups: TmtGroup[];
    activeGroupIds: string[];
    onUpdateActiveGroups: (ids: string[]) => void;
    onUpdateInitiative: (id: string, value: number, roll?: number) => void;
    onUpdateUsedActions: (id: string, count: number) => void;
    onUpdateStat: (id: string, type: 'health' | 'mental', change: number, notes: string) => void;
    onDeleteHistoryEntry: (charId: string, entry: HistoryEntry) => void;
    onUpdateInitiativeMod: (id: string, value: number) => void;
    onResetAllActions: () => void;
}

export default function CombateScreen({
    characters,
    groups,
    activeGroupIds,
    onUpdateActiveGroups,
    onUpdateInitiative,
    onUpdateUsedActions,
    onUpdateStat,
    onDeleteHistoryEntry,
    onUpdateInitiativeMod,
    onResetAllActions
}: CombateScreenProps) {
    const [currentTurn, setCurrentTurn] = useState(0);
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [editModal, setEditModal] = useState<{ isOpen: boolean; charId: string; type: 'health' | 'mental' }>({ 
        isOpen: false, charId: '', type: 'health' 
    });
    const [historyModal, setHistoryModal] = useState<{ isOpen: boolean; charId: string; type: 'health' | 'mental' }>({ 
        isOpen: false, charId: '', type: 'health' 
    });
    const [changeVal, setChangeVal] = useState('');
    const [notes, setNotes] = useState('');

    const filtered = characters.filter(c => activeGroupIds.length === 0 || activeGroupIds.some(gid => c.groupIds.includes(gid)));
    const sorted = [...filtered].sort((a, b) => getIniciativa(b) - getIniciativa(a));
    const selectedChar = characters.find(c => c.id === (editModal.isOpen ? editModal.charId : historyModal.charId));

    const toggleGroup = (groupId: string) => {
        const next = activeGroupIds.includes(groupId)
            ? activeGroupIds.filter(id => id !== groupId)
            : [...activeGroupIds, groupId];
        onUpdateActiveGroups(next);
    };

    const openEdit = (id: string, type: 'health' | 'mental') => {
        setEditModal({ isOpen: true, charId: id, type });
        setChangeVal(''); setNotes('');
    };

    const openHistory = (id: string, type: 'health' | 'mental') => {
        setHistoryModal({ isOpen: true, charId: id, type });
    };

    const handleApply = () => {
        onUpdateStat(editModal.charId, editModal.type, parseInt(changeVal) || 0, notes);
        setEditModal(prev => ({ ...prev, isOpen: false }));
    };

    const handleConfirmInic = () => {
        filtered.forEach(c => {
            const roll = Math.floor(Math.random() * 100) + 1;
            onUpdateInitiative(c.id, getBaseIniciativa(c) + roll, roll);
        });
        setCurrentTurn(0); setShowConfirmModal(false);
    };

    return (
        <div className="tmt-screen">
            <div className="tmt-screen-banner">
                <span className="tmt-screen-banner-icon">⚔️</span>
                <div className="tmt-screen-banner-text">
                    <h2>Combate</h2>
                    <p>Combatientes activos: <strong>{filtered.length}</strong></p>
                </div>
            </div>

            <GroupFilterBar 
                groups={groups}
                selectedGroupIds={activeGroupIds}
                onToggleGroup={toggleGroup}
                onClearFilters={() => onUpdateActiveGroups([])}
            />


            <div className="tmt-section">
                <div className="tmt-section-header">
                    <span className="tmt-section-title">Tracker de Iniciativa</span>
                    <div className="tmt-initiative-actions-group">
                        <button className="tmt-header-btn tmt-btn-next-round" onClick={() => { onResetAllActions(); setCurrentTurn(0); }}>🔄 Sig. Turno</button>
                        <button className="tmt-header-btn tmt-btn-calculate" onClick={() => setShowConfirmModal(true)}>🎲 Iniciativas</button>
                        {sorted.length > 0 && <button className="tmt-add-btn" onClick={() => setCurrentTurn((t) => (t + 1) % sorted.length)}>Sig. Combatiente ▶</button>}
                    </div>
                </div>

                <div className="tmt-initiative-list">
                    {sorted.map((e, i) => (
                        <InitiativeRow 
                            key={e.id}
                            entry={e}
                            index={i}
                            isCurrent={i === currentTurn}
                            onUpdateUsedActions={onUpdateUsedActions}
                            onOpenEdit={openEdit}
                            onOpenHistory={openHistory}
                            onUpdateInitiative={onUpdateInitiative}
                            onUpdateModifier={onUpdateInitiativeMod}
                        />
                    ))}
                    {sorted.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No hay combatientes en los grupos seleccionados.</p>}
                </div>
            </div>

            <div className="tmt-section">
                <div className="tmt-section-header">
                    <span className="tmt-section-title">Combatientes</span>
                    <div className="tmt-view-toggle">
                        <button 
                            className={`tmt-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
                            onClick={() => setViewMode('cards')}
                        >🎴 Tarjetas</button>
                        <button 
                            className={`tmt-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                            onClick={() => setViewMode('table')}
                        >📊 Tabla</button>
                    </div>
                </div>

                {viewMode === 'cards' ? (
                    <div className="tmt-combat-grid">
                        {sorted.map(e => (
                            <CombatCard 
                                key={e.id}
                                entry={e}
                                onOpenEdit={openEdit}
                                onOpenHistory={openHistory}
                            />
                        ))}
                    </div>
                ) : (
                    <CombatTable 
                        characters={sorted}
                        currentTurn={currentTurn}
                        onUpdateUsedActions={onUpdateUsedActions}
                        onOpenEdit={openEdit}
                        onOpenHistory={openHistory}
                    />
                )}
            </div>

            <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Confirmar Iniciativas">
                <p>¿Calcular iniciativa (1d100) para todos?</p>
                <div className="tmt-modal-actions">
                    <button className="tmt-cancel-btn" onClick={() => setShowConfirmModal(false)}>Cancelar</button>
                    <button className="tmt-add-btn" onClick={handleConfirmInic}>Confirmar</button>
                </div>
            </Modal>

            {editModal.isOpen && selectedChar && (
                <EditStatModal
                    isOpen={editModal.isOpen} 
                    onClose={() => setEditModal(m => ({ ...m, isOpen: false }))}
                    title={editModal.type === 'health' ? 'Puntos de Vida' : 'Equilibrio Mental'}
                    currentValue={editModal.type === 'health' ? (selectedChar.currentHealth || 0) : (selectedChar.currentMental || 0)}
                    changeValue={changeVal} 
                    notes={notes} 
                    onChangeValueChange={setChangeVal} 
                    onNotesChange={setNotes} 
                    onApply={handleApply}
                />
            )}

            {historyModal.isOpen && selectedChar && (
                <HistoryModal
                    show={historyModal.isOpen} 
                    onClose={() => setHistoryModal(m => ({ ...m, isOpen: false }))}
                    type={historyModal.type} 
                    history={selectedChar.history || []}
                    onDeleteEntry={(entry) => onDeleteHistoryEntry(selectedChar.id, entry)}
                />
            )}
        </div>
    );
}
