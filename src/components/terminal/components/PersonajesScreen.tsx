import React, { useState, useRef } from 'react';
import { type TmtCharacterEntry, type TmtGroup } from '../hooks/useTmtStore';
import EntityRow from './EntityRow';
import Modal from './Modal';
import Logger from '../../../utils/Logger';

interface PersonajesScreenProps {
    characters: TmtCharacterEntry[];
    groups: TmtGroup[];
    onAddCharacter: (data: any, role: 'pj' | 'pnj') => void;
    onRemove: (id: string) => void;
    onToggleRole: (id: string, role: 'pj' | 'pnj') => void;
    onToggleGroup: (charId: string, groupId: string) => void;
    onAddGroup: (name: string, color?: string) => void;
    onUpdateGroup: (id: string, name: string, color?: string) => void;
    onDeleteGroup: (id: string) => void;
    onImportStore: (file: File) => void;
    onExportStore: () => void;
    onResetStore: () => void;
}

const PRESET_COLORS = [
    '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#a855f7',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#64748b', '#1e293b',
    '#14b8a6', '#78350f', '#1e3a8a', '#701a75'
];


export default function PersonajesScreen({
    characters,
    groups,
    onAddCharacter,
    onRemove,
    onToggleRole,
    onToggleGroup,
    onAddGroup,
    onUpdateGroup,
    onDeleteGroup,
    onImportStore,
    onExportStore,
    onResetStore
}: PersonajesScreenProps) {
    const [showGroupAdmin, setShowGroupAdmin] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
    const pjInputRef = useRef<HTMLInputElement>(null);
    const pnjInputRef = useRef<HTMLInputElement>(null);

    const pjs = characters.filter((c) => c.role === 'pj');
    const pnjs = characters.filter((c) => c.role === 'pnj');

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>, role: 'pj' | 'pnj') => {
        const files = Array.from(e.target.files || []);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const data = JSON.parse(ev.target?.result as string);
                    onAddCharacter(data, role);
                } catch (err) {
                    Logger.error('Error parsing character JSON:', err);
                }
            };
            reader.readAsText(file);
        });
        // Reset input so importing the same file again triggers change
        e.target.value = '';
    };

    return (
        <div className="tmt-screen">
            <div className="tmt-screen-banner">
                <span className="tmt-screen-banner-icon">🎭</span>
                <div className="tmt-screen-banner-text">
                    <h2>Personajes y Grupos</h2>
                </div>
                <div className="tmt-screen-actions">
                    <button className="tmt-add-btn" onClick={() => setShowGroupAdmin(true)}>
                        🏷️ Administrar Grupos
                    </button>
                </div>
            </div>

            {groups.length > 0 && (
                <div className="tmt-section tmt-group-badges-container" style={{ padding: '0.75rem 1.5rem', background: '#f8fafc' }}>
                    <div className="tmt-group-badges">
                        {groups.map(g => (
                            <div 
                                key={g.id} 
                                className="tmt-group-badge-item" 
                                style={{ backgroundColor: g.color || '#4b5563' }}
                                onClick={() => setShowGroupAdmin(true)}
                            >
                                {g.name}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="tmt-section">
                <div className="tmt-section-header">
                    <span className="tmt-section-title">🧑‍🦸 PJs ({pjs.length})</span>
                    <button className="tmt-add-btn" onClick={() => pjInputRef.current?.click()}>👤 Cargar Personajes</button>
                    <input ref={pjInputRef} type="file" multiple hidden onChange={(e) => handleImport(e, 'pj')} />
                </div>
                <div className="tmt-entity-list">
                    {pjs.length === 0 ? (
                        <p className="tmt-empty-msg">No hay PJs cargados.</p>
                    ) : (
                        pjs.map(e => <EntityRow key={e.id} entry={e} groups={groups} onRemove={onRemove} onToggleRole={onToggleRole} onToggleGroup={onToggleGroup} />)
                    )}
                </div>
            </div>

            <div className="tmt-section">
                <div className="tmt-section-header">
                    <span className="tmt-section-title">👾 PNJs ({pnjs.length})</span>
                    <button className="tmt-add-btn tmt-add-btn--npc" onClick={() => pnjInputRef.current?.click()}>👤 Cargar Personajes</button>
                    <input ref={pnjInputRef} type="file" multiple hidden onChange={(e) => handleImport(e, 'pnj')} />
                </div>
                <div className="tmt-entity-list">
                    {pnjs.length === 0 ? (
                        <p className="tmt-empty-msg">No hay PNJs cargados.</p>
                    ) : (
                        pnjs.map(e => <EntityRow key={e.id} entry={e} groups={groups} onRemove={onRemove} onToggleRole={onToggleRole} onToggleGroup={onToggleGroup} />)
                    )}
                </div>
            </div>

            <Modal isOpen={showGroupAdmin} onClose={() => setShowGroupAdmin(false)} title="Administrar Grupos">
                <div className="tmt-group-admin">
                    <div className="tmt-add-group-form">
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>NUEVO GRUPO</p>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input className="tmt-details-input" placeholder="Nombre del grupo..." value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} style={{ flex: 1 }} />
                            <button className="tmt-add-btn" onClick={() => { 
                                if (newGroupName) { 
                                    onAddGroup(newGroupName, selectedColor); 
                                    setNewGroupName(''); 
                                } 
                            }}>Añadir</button>
                        </div>
                        <div className="tmt-color-palette">
                            {PRESET_COLORS.map(c => (
                                <button 
                                    key={c} 
                                    className={`tmt-palette-btn${selectedColor === c ? ' active' : ''}`} 
                                    style={{ backgroundColor: c }} 
                                    onClick={() => setSelectedColor(c)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="tmt-group-list">
                        <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>GRUPOS EXISTENTES</p>
                        {groups.map(g => (
                            <div key={g.id} className="tmt-group-list-item">
                                <div className="tmt-group-color-preview" style={{ backgroundColor: g.color || '#4b5563' }} />
                                <span className="tmt-group-name" style={{ flex: 1, fontWeight: 700 }}>{g.name}</span>
                                <button className="tmt-icon-btn danger" onClick={() => onDeleteGroup(g.id)}>🗑️</button>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>
        </div>
    );
}
