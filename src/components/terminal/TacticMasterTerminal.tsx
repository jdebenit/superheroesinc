import React, { useState, useEffect, useRef } from 'react';
import './TacticMasterTerminal.css';
import { APP_VERSIONS } from '../../data/appVersions';
import Modal from './components/Modal';
import HistoryModal from './components/HistoryModal';
import EditStatModal from './components/EditStatModal';
import TerminalHeader from './components/TerminalHeader';
import MiniStatCard from './components/MiniStatCard';
import EmptyState from './components/EmptyState';
import CharacterSheet from '../character/CharacterSheet';
import { 
    useTmtStore, 
    type TmtCharacterEntry, 
    type TmtGroup,
    type HistoryEntry 
} from './hooks/useTmtStore';
import Logger from '../../utils/Logger';

// ─────────────────────────────────────────────────────────────────────────────
// Types (local, for the combat tracker state only)
// ─────────────────────────────────────────────────────────────────────────────
type Screen = 'personajes' | 'combate';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function initials(name: string): string {
    return name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('');
}

function charName(entry: TmtCharacterEntry): string {
    return entry.characterData?.alias || entry.characterData?.name || '(Sin nombre)';
}

function charSubtitle(entry: TmtCharacterEntry): string {
    const alias = entry.characterData?.alias;
    const name = entry.characterData?.name;
    const level = entry.characterData?.level ?? entry.characterData?.meta?.level;
    const parts: string[] = [];
    if (alias && name) parts.push(name);
    if (level) parts.push(`Nv. ${level}`);
    return parts.join(' · ');
}

function getIniciativa(entry: TmtCharacterEntry): number {
    if (typeof entry.initiative === 'number') return entry.initiative;
    return getBaseIniciativa(entry);
}

function getBaseIniciativa(entry: TmtCharacterEntry): number {
    const cd = entry.characterData;
    if (Array.isArray(cd?.combatstats)) {
        const statStr = cd.combatstats.find((s: any) => typeof s === 'string' && s.includes('Iniciativa y Reflejos'));
        if (statStr) {
            const val = parseInt(statStr.split(':')[1]?.trim());
            if (!isNaN(val)) return val;
        }
    }
    const agi = cd?.attributes?.values?.Agilidad || 0;
    const per = cd?.attributes?.values?.Percepción || 0;
    return Math.floor((agi + per) / 4);
}

function getAcciones(entry: TmtCharacterEntry): number {
    const cd = entry.characterData;
    if (Array.isArray(cd?.combatstats)) {
        const statStr = cd.combatstats.find((s: any) => typeof s === 'string' && s.includes('Acciones por asalto'));
        if (statStr) {
            const val = parseInt(statStr.split(':')[1]?.trim());
            if (!isNaN(val)) return val;
        }
    }
    const agi = cd?.attributes?.values?.Agilidad || 0;
    if (agi <= 75) return 1;
    if (agi <= 90) return 2;
    if (agi <= 130) return 3;
    if (agi <= 175) return 4;
    if (agi <= 199) return 5;
    return 6;
}

// ─────────────────────────────────────────────────────────────────────────────
// EntityRow
// ─────────────────────────────────────────────────────────────────────────────
interface EntityRowProps {
    entry: TmtCharacterEntry;
    groups: TmtGroup[];
    onRemove: (id: string) => void;
    onToggleRole: (id: string, role: 'pj' | 'pnj') => void;
    onToggleGroup: (charId: string, groupId: string) => void;
}

function EntityRow({ entry, groups, onRemove, onToggleRole, onToggleGroup }: EntityRowProps) {
    const [showGroupModal, setShowGroupModal] = useState(false);
    const isNpc = entry.role === 'pnj';
    const displayName = charName(entry);
    const subtitle = charSubtitle(entry);
    const charGroups = groups.filter(g => entry.groupIds.includes(g.id));

    return (
        <div className="tmt-entity-card">
            <div className={`tmt-entity-avatar${isNpc ? ' npc' : ''}`}>
                {initials(displayName)}
            </div>
            <div className="tmt-entity-info">
                <p className="tmt-entity-name">{displayName}</p>
                <div className="tmt-entity-meta-row">
                    {subtitle && <span className="tmt-entity-meta">{subtitle}</span>}
                    {charGroups.map(g => (
                        <span key={g.id} className="tmt-group-tag" style={{ backgroundColor: g.color || '#4b5563' }}>
                            {g.name}
                        </span>
                    ))}
                </div>
            </div>
            <div className="tmt-entity-actions">
                <button className="tmt-icon-btn" title="Grupos" onClick={() => setShowGroupModal(true)}>🏷️</button>
                <button 
                    className="tmt-icon-btn" 
                    title="Abrir en SHI TPT" 
                    onClick={() => {
                        try {
                            localStorage.setItem('shi_tpt_character', JSON.stringify(entry.characterData));
                            window.open('/recursos/tactic-player-terminal', 'shi_tpt_terminal');
                        } catch (err) {
                            Logger.error('Error sending character to TPT:', err);
                        }
                    }}
                >
                    🎮
                </button>
                <CharacterSheet character={entry.characterData} mode="modal" />
                <button className="tmt-icon-btn" onClick={() => onToggleRole(entry.id, isNpc ? 'pj' : 'pnj')}>
                    {isNpc ? '🧑‍🦸' : '👾'}
                </button>
                <button className="tmt-icon-btn danger" onClick={() => onRemove(entry.id)}>🗑️</button>

                <Modal isOpen={showGroupModal} onClose={() => setShowGroupModal(false)} title={`Grupos: ${displayName}`}>
                    <div className="tmt-modal-group-list">
                        {groups.map(g => (
                            <label key={g.id} className="tmt-dropdown-item tmt-modal-item">
                                <input type="checkbox" checked={entry.groupIds.includes(g.id)} onChange={() => onToggleGroup(entry.id, g.id)} />
                                <span className="tmt-group-name-label">{g.name}</span>
                            </label>
                        ))}
                        <button className="tmt-add-btn" onClick={() => setShowGroupModal(false)} style={{ width: '100%', marginTop: '1rem' }}>Cerrar</button>
                    </div>
                </Modal>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// PersonajesScreen
// ─────────────────────────────────────────────────────────────────────────────
interface PersonajesScreenProps {
    characters: TmtCharacterEntry[];
    groups: TmtGroup[];
    onImport: (characterData: Record<string, any>, role: 'pj' | 'pnj') => void;
    onRemove: (id: string) => void;
    onToggleRole: (id: string, role: 'pj' | 'pnj') => void;
    onToggleGroup: (charId: string, groupId: string) => void;
    onAddGroup: (name: string, color?: string) => void;
    onDeleteGroup: (id: string) => void;
}

function PersonajesScreen({ characters, groups, onImport, onRemove, onToggleRole, onToggleGroup, onAddGroup, onDeleteGroup }: PersonajesScreenProps) {
    const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
    const [showGroupManager, setShowGroupManager] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupColor, setNewGroupColor] = useState('#3b82f6');

    const PRESET_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

    const filtered = characters.filter(c => selectedGroupIds.length === 0 || selectedGroupIds.some(gid => c.groupIds.includes(gid)));
    const pjs = filtered.filter(e => e.role === 'pj');
    const pnjs = filtered.filter(e => e.role === 'pnj');

    const handleFile = (role: 'pj' | 'pnj') => async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        e.target.value = '';
        for (const file of files) {
            try {
                const text = await file.text();
                const parsed = JSON.parse(text);
                const data = parsed?.character ?? parsed?.characterData ?? parsed;
                if (data?.name) onImport(data, role);
            } catch (err) { Logger.error('Error importing character', err); }
        }
    };

    return (
        <div className="tmt-screen">
            <div className="tmt-screen-banner">
                <span className="tmt-screen-banner-icon">🎭</span>
                <div className="tmt-screen-banner-text">
                    <h2>Personajes</h2>
                    <p>Total: <strong>{characters.length}</strong> combatientes disponibles</p>
                </div>
                <button className="tmt-header-btn" onClick={() => setShowGroupManager(!showGroupManager)}>⚙️ Grupos</button>
            </div>

            {showGroupManager && (
                <div className="tmt-section tmt-group-manager-section">
                    <div className="tmt-section-header">
                        <span className="tmt-section-title">Gestión de Grupos</span>
                        <button className="tmt-icon-btn" onClick={() => setShowGroupManager(false)}>✕</button>
                    </div>
                    <div className="tmt-group-manager-content">
                        <div className="tmt-group-add-form">
                            <div className="tmt-input-group">
                                <input 
                                    type="text" 
                                    placeholder="Nombre del grupo..." 
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && newGroupName.trim()) {
                                            onAddGroup(newGroupName.trim(), newGroupColor);
                                            setNewGroupName('');
                                        }
                                    }}
                                />
                                <input 
                                    type="color" 
                                    value={newGroupColor}
                                    onChange={(e) => setNewGroupColor(e.target.value)}
                                    className="tmt-color-picker"
                                />
                                <button 
                                    className="tmt-add-btn"
                                    onClick={() => {
                                        if (newGroupName.trim()) {
                                            onAddGroup(newGroupName.trim(), newGroupColor);
                                            setNewGroupName('');
                                        }
                                    }}
                                >
                                    Añadir
                                </button>
                            </div>
                            <div className="tmt-preset-colors">
                                {PRESET_COLORS.map(c => (
                                    <button 
                                        key={c}
                                        className={`tmt-preset-color-btn ${newGroupColor === c ? 'active' : ''}`}
                                        style={{ backgroundColor: c }}
                                        onClick={() => setNewGroupColor(c)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="tmt-groups-grid">
                            {groups.map(g => (
                                <div key={g.id} className="tmt-group-chip-edit">
                                    <span className="tmt-group-chip-color" style={{ backgroundColor: g.color }} />
                                    <span className="tmt-group-chip-name">{g.name}</span>
                                    <button className="tmt-group-chip-delete" onClick={() => onDeleteGroup(g.id)}>✕</button>
                                </div>
                            ))}
                            {groups.length === 0 && <p className="tmt-empty-msg">No hay grupos creados todavía.</p>}
                        </div>
                    </div>
                </div>
            )}

            {groups.length > 0 && !showGroupManager && (
                <div className="tmt-section tmt-filter-section">
                    <div className="tmt-section-header">
                        <span className="tmt-section-title">Filtrar Vista</span>
                        {selectedGroupIds.length > 0 && <button className="tmt-link-btn" onClick={() => setSelectedGroupIds([])}>Limpiar filtros</button>}
                    </div>
                    <div className="tmt-groups-filter-bar">
                        {groups.map(g => {
                            const active = selectedGroupIds.includes(g.id);
                            return (
                                <button 
                                    key={g.id} 
                                    className={`tmt-group-filter-tag ${active ? 'active' : ''}`}
                                    onClick={() => {
                                        if (active) setSelectedGroupIds(prev => prev.filter(id => id !== g.id));
                                        else setSelectedGroupIds(prev => [...prev, g.id]);
                                    }}
                                    style={{ 
                                        backgroundColor: active ? (g.color || '#3b82f6') : '#f1f5f9',
                                        color: active ? '#fff' : '#64748b'
                                    }}
                                >
                                    {g.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="tmt-section">
                <div className="tmt-section-header">
                    <span className="tmt-section-title">🧑‍🦸 PJs ({pjs.length})</span>
                    <button className="tmt-add-btn" onClick={() => (document.getElementById('pj-import-input') as HTMLInputElement).click()}>📂 Importar</button>
                    <input id="pj-import-input" type="file" multiple hidden onChange={handleFile('pj')} />
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
                    <button className="tmt-add-btn tmt-add-btn--npc" onClick={() => (document.getElementById('pnj-import-input') as HTMLInputElement).click()}>📂 Importar</button>
                    <input id="pnj-import-input" type="file" multiple hidden onChange={handleFile('pnj')} />
                </div>
                <div className="tmt-entity-list">
                    {pnjs.length === 0 ? (
                        <p className="tmt-empty-msg">No hay PNJs cargados.</p>
                    ) : (
                        pnjs.map(e => <EntityRow key={e.id} entry={e} groups={groups} onRemove={onRemove} onToggleRole={onToggleRole} onToggleGroup={onToggleGroup} />)
                    )}
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// CombateScreen
// ─────────────────────────────────────────────────────────────────────────────
interface CombateScreenProps {
    characters: TmtCharacterEntry[];
    groups: TmtGroup[];
    activeGroupIds: string[];
    onUpdateActiveGroups: (ids: string[]) => void;
    onUpdateInitiative: (id: string, value: number, roll?: number) => void;
    onUpdateUsedActions: (id: string, count: number) => void;
    onUpdateStat: (id: string, type: 'health' | 'mental', change: number, notes: string) => void;
    onDeleteHistoryEntry: (charId: string, entry: HistoryEntry) => void;
    onResetAllActions: () => void;
}

function CombateScreen({ 
    characters, 
    groups,
    activeGroupIds,
    onUpdateActiveGroups,
    onUpdateInitiative, 
    onUpdateUsedActions, 
    onUpdateStat, 
    onDeleteHistoryEntry, 
    onResetAllActions 
}: CombateScreenProps) {
    const [currentTurn, setCurrentTurn] = useState(0);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [editModal, setEditModal] = useState<{ isOpen: boolean; charId: string; type: 'health' | 'mental' }>({ isOpen: false, charId: '', type: 'health' });
    const [historyModal, setHistoryModal] = useState<{ isOpen: boolean; charId: string; type: 'health' | 'mental' }>({ isOpen: false, charId: '', type: 'health' });
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
        characters.forEach(c => {
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
                    <p>Grupos activos: <strong>{activeGroupIds.length === 0 ? 'Todos' : groups.filter(g => activeGroupIds.includes(g.id)).map(g => g.name).join(', ')}</strong></p>
                </div>
            </div>

            {groups.length > 0 && (
                <div className="tmt-section" style={{ marginBottom: '1rem' }}>
                    <div className="tmt-section-header">
                        <span className="tmt-section-title">Filtrar por Grupo</span>
                        <button className="tmt-header-btn" onClick={() => onUpdateActiveGroups([])} style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}>Limpiar Filtros</button>
                    </div>
                    <div className="tmt-groups-filter-bar">
                        {groups.map(g => {
                            const active = activeGroupIds.includes(g.id);
                            return (
                                <button 
                                    key={g.id} 
                                    className={`tmt-group-filter-tag ${active ? 'active' : ''}`}
                                    onClick={() => toggleGroup(g.id)}
                                    style={{ 
                                        backgroundColor: active ? (g.color || '#3b82f6') : '#f1f5f9',
                                        color: active ? '#fff' : '#64748b'
                                    }}
                                >
                                    {g.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

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
                        <div key={e.id} className={`tmt-initiative-row${i === currentTurn ? ' current' : ''}`}>
                            <span className="tmt-initiative-rank">{i + 1}</span>
                            <div className="tmt-initiative-main-info">
                                <div>
                                    <div className="tmt-initiative-name">{charName(e)}</div>
                                    <div className="tmt-initiative-actions-tracker">
                                        {Array.from({ length: getAcciones(e) }).map((_, idx) => (
                                            <span key={idx} className={`tmt-action-dot${(e.usedActions || 0) > idx ? ' used' : ''}`} onClick={() => onUpdateUsedActions(e.id, (e.usedActions || 0) > idx ? idx : idx + 1)} />
                                        ))}
                                    </div>
                                </div>
                                <div className="tmt-entity-vitals">
                                    <div className="tmt-vital-badge health" onClick={() => openEdit(e.id, 'health')} onDoubleClick={() => openHistory(e.id, 'health')}>
                                        <span className="label">PV</span> <span className="value">{e.currentHealth}/{e.maxHealth}</span>
                                    </div>
                                    <div className="tmt-vital-badge mental" onClick={() => openEdit(e.id, 'mental')} onDoubleClick={() => openHistory(e.id, 'mental')}>
                                        <span className="label">EQM</span> <span className="value">{e.currentMental}/{e.maxMental}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="tmt-initiative-edit-wrap">
                                {e.roll && <span className="tmt-initiative-breakdown">({getBaseIniciativa(e)} + {e.roll})</span>}
                                <button 
                                    className="tmt-dice-btn" 
                                    title="Lanzar iniciativa individual"
                                    onClick={() => {
                                        const roll = Math.floor(Math.random() * 100) + 1;
                                        onUpdateInitiative(e.id, getBaseIniciativa(e) + roll, roll);
                                    }}
                                >
                                    🎲
                                </button>
                                <span className="tmt-initiative-icon">⚡</span>
                                <input type="number" className="tmt-initiative-input" value={getIniciativa(e)} onChange={(ev) => onUpdateInitiative(e.id, parseInt(ev.target.value) || 0)} />
                            </div>
                        </div>
                    ))}
                    {sorted.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No hay combatientes en los grupos seleccionados.</p>}
                </div>
            </div>

            <div className="tmt-section">
                <div className="tmt-section-header"><span className="tmt-section-title">Tarjetas de Combate</span></div>
                <div className="tmt-combat-grid">
                    {sorted.map(e => (
                        <div key={e.id} className="tmt-combat-card">
                            <div className="tmt-combat-card-header">
                                <div className={`tmt-entity-avatar${e.role === 'pnj' ? ' npc' : ''}`}>{initials(charName(e))}</div>
                                <div><p className="tmt-combat-card-name">{charName(e)}</p><span className={`tmt-combat-card-badge ${e.role}`}>{e.role.toUpperCase()}</span></div>
                            </div>
                            <div className="tmt-combat-card-body">
                                <MiniStatCard 
                                    label="PVs"
                                    max={e.maxHealth || 1}
                                    current={e.currentHealth || 0}
                                    type="health"
                                    onEdit={() => openEdit(e.id, 'health')}
                                    onViewHistory={() => openHistory(e.id, 'health')}
                                />
                                <MiniStatCard 
                                    label="EQM"
                                    max={e.maxMental || 1}
                                    current={e.currentMental || 0}
                                    type="mental"
                                    onEdit={() => openEdit(e.id, 'mental')}
                                    onViewHistory={() => openHistory(e.id, 'mental')}
                                />
                            </div>
                        </div>
                    ))}
                </div>
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
                    isOpen={editModal.isOpen} onClose={() => setEditModal(m => ({ ...m, isOpen: false }))} 
                    title={editModal.type === 'health' ? 'Puntos de Vida' : 'Equilibrio Mental'}
                    currentValue={editModal.type === 'health' ? (selectedChar.currentHealth || 0) : (selectedChar.currentMental || 0)}
                    changeValue={changeVal} notes={notes} onChangeValueChange={setChangeVal} onNotesChange={setNotes} onApply={handleApply}
                />
            )}

            {historyModal.isOpen && selectedChar && (
                <HistoryModal 
                    show={historyModal.isOpen} onClose={() => setHistoryModal(m => ({ ...m, isOpen: false }))}
                    type={historyModal.type} history={selectedChar.history || []}
                    onDeleteEntry={(entry) => onDeleteHistoryEntry(selectedChar.id, entry)}
                />
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main TMT
// ─────────────────────────────────────────────────────────────────────────────
export default function TacticMasterTerminal() {
    const [screen, setScreen] = useState<Screen>('personajes');
    const { 
        store, characters, groups, 
        addCharacter, removeCharacter, updateCharacterRole, toggleCharacterGroup, 
        addGroup, deleteGroup, updateCharacterInitiative, updateCharacterUsedActions, 
        updateCharacterStat, updateActiveCombatGroups, deleteCharacterHistoryEntry, 
        resetAllActions, resetStore, exportStore, reload 
    } = useTmtStore();

    useEffect(() => { reload(); }, [reload]);

    // Character Sync from Viewer
    useEffect(() => {
        const channel = new BroadcastChannel('tmt_sync');
        channel.onmessage = (event) => {
            if (event.data === 'reload') reload();
        };
        return () => channel.close();
    }, [reload]);

    const handleImportWrapper = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);
        event.target.value = '';
        for (const file of files) {
            try {
                const text = await file.text();
                const parsed = JSON.parse(text);
                const data = parsed?.character ?? parsed?.characterData ?? parsed;
                if (data?.name) addCharacter(data, 'pnj');
            } catch (err) { Logger.error('Error importing character', err); }
        }
    };

    return (
        <div className="tmt-container tactic-player-terminal">
            <TerminalHeader
                title="SHI Tactic Master Terminal"
                version={APP_VERSIONS.TACTIC_MASTER_TERMINAL}
                onImport={handleImportWrapper}
                onExport={exportStore}
                onReset={resetStore}
                showCharacterSheet={false}
            />

            <div className="tmt-navbar-wrapper">
                <div className="tmt-nav">
                    <button className={`tmt-nav-btn ${screen === 'personajes' ? 'active' : ''}`} onClick={() => setScreen('personajes')}>🎭 Personajes</button>
                    <button className={`tmt-nav-btn ${screen === 'combate' ? 'active' : ''}`} onClick={() => setScreen('combate')}>⚔️ Combate</button>
                </div>
            </div>

            <main className="tmt-main-content">
                {screen === 'personajes' ? (
                    <PersonajesScreen 
                        characters={characters} groups={groups} onImport={addCharacter} onRemove={removeCharacter}
                        onToggleRole={updateCharacterRole} onToggleGroup={toggleCharacterGroup} onAddGroup={addGroup} onDeleteGroup={deleteGroup}
                    />
                ) : (
                    <CombateScreen 
                        characters={characters}
                        groups={groups}
                        activeGroupIds={store.activeCombatGroupIds || []}
                        onUpdateActiveGroups={updateActiveCombatGroups}
                        onUpdateInitiative={updateCharacterInitiative}
                        onUpdateUsedActions={updateCharacterUsedActions} 
                        onUpdateStat={updateCharacterStat}
                        onDeleteHistoryEntry={deleteCharacterHistoryEntry} 
                        onResetAllActions={resetAllActions}
                    />
                )}
            </main>
        </div>
    );
}
