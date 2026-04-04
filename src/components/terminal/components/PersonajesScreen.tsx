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
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span className="tmt-screen-title" style={{ margin: 0, padding: 0, border: 'none' }}>📦 Gestión de Personajes</span>
                </div>
                <div className="tmt-screen-actions">
                    <button className="tmt-icon-btn" title="Administrar Grupos" onClick={() => setShowGroupAdmin(true)}>🏷️</button>
                    <button className="tmt-icon-btn" title="Exportar Sesión" onClick={onExportStore}>📤</button>
                    <button className="tmt-icon-btn" title="Importar Sesión" onClick={() => (document.getElementById('tmt-import-store-global') as HTMLInputElement).click()}>📥</button>
                    <input id="tmt-import-store-global" type="file" hidden onChange={(e) => e.target.files?.[0] && onImportStore(e.target.files[0])} />
                    <button className="tmt-icon-btn danger" title="Resetear Terminal" onClick={() => window.confirm('¿Borrar TODO?') && onResetStore()}>☢️</button>
                </div>
            </div>

            {groups.length > 0 && (
                <div className="tmt-section" style={{ marginBottom: '2rem' }}>
                    <div className="tmt-group-badges">
                        {groups.map(g => (
                            <button 
                                key={g.id} 
                                className="tmt-group-badge-item" 
                                style={{ backgroundColor: g.color || '#4b5563' }}
                                onClick={() => {
                                    setNewGroupName(g.name);
                                    setShowGroupAdmin(true);
                                }}
                            >
                                {g.name}
                            </button>
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

            <Modal isOpen={showGroupAdmin} onClose={() => setShowGroupAdmin(false)} title="Categorías y Grupos">
                <div className="tmt-group-admin">
                    <div className="tmt-add-group-form" style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                        <input className="tmt-details-input" placeholder="Nombre del grupo..." value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} style={{ flex: 1 }} />
                        <button className="tmt-add-btn" onClick={() => { if (newGroupName) { onAddGroup(newGroupName); setNewGroupName(''); } }}>+</button>
                    </div>
                    <div className="tmt-group-list">
                        {groups.map(g => (
                            <div key={g.id} className="tmt-group-list-item">
                                <input type="color" className="tmt-color-picker" value={g.color || '#4b5563'} onChange={(e) => onUpdateGroup(g.id, g.name, e.target.value)} />
                                <span className="tmt-group-name">{g.name}</span>
                                <button className="tmt-icon-btn danger" onClick={() => onDeleteGroup(g.id)}>🗑️</button>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>
        </div>
    );
}
