import React, { useState, useEffect, useRef } from 'react';
import './TacticMasterTerminal.css';
import { APP_VERSIONS } from '../../data/appVersions';
import { useTmtStore, type TmtCharacterEntry, type TmtGroup } from './hooks/useTmtStore';
import Modal from './components/Modal';

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

function pct(current: number, max: number): number {
    if (max <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round((current / max) * 100)));
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

    // Get group objects for this character
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
                        <span 
                            key={g.id} 
                            className="tmt-group-tag" 
                            style={{ backgroundColor: g.color || '#4b5563' }}
                        >
                            {g.name}
                        </span>
                    ))}
                </div>
            </div>
            <div className="tmt-entity-actions">
                <div className="tmt-dropdown-wrap">
                    <button
                        className={`tmt-icon-btn${showGroupModal ? ' active' : ''}`}
                        title="Gestionar Grupos"
                        onClick={() => setShowGroupModal(true)}
                    >
                        🏷️
                    </button>
                    
                    <Modal 
                        isOpen={showGroupModal} 
                        onClose={() => setShowGroupModal(false)}
                        title={`Asignar Grupos: ${displayName}`}
                    >
                        <div className="tmt-modal-group-list">
                            <p className="tmt-dropdown-header">Selecciona los grupos:</p>
                            {groups.length === 0 && (
                                <p className="tmt-dropdown-empty">
                                    No hay grupos creados. <br/>
                                    Ve a la sección superior para crearlos.
                                </p>
                            )}
                            <div className="tmt-groups-selection-grid">
                                {groups.map(g => (
                                    <label key={g.id} className="tmt-dropdown-item tmt-modal-item">
                                        <input 
                                            type="checkbox" 
                                            checked={entry.groupIds.includes(g.id)}
                                            onChange={() => onToggleGroup(entry.id, g.id)}
                                        />
                                        <div 
                                            className="tmt-group-color-dot" 
                                            style={{ 
                                                width: '10px', 
                                                height: '10px', 
                                                borderRadius: '50%', 
                                                backgroundColor: g.color || '#4b5563',
                                                flexShrink: 0
                                            }} 
                                        />
                                        <span className="tmt-group-name-label">{g.name}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="modal-actions">
                                <button className="tmt-add-btn" onClick={() => setShowGroupModal(false)} style={{ width: '100%', marginTop: '1rem' }}>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </Modal>
                </div>
                <button
                    className="tmt-icon-btn"
                    title={isNpc ? 'Cambiar a PJ' : 'Cambiar a PNJ'}
                    onClick={() => onToggleRole(entry.id, isNpc ? 'pj' : 'pnj')}
                >
                    {isNpc ? '🧑‍🦸' : '👾'}
                </button>
                <button
                    className="tmt-icon-btn danger"
                    title="Eliminar"
                    onClick={() => onRemove(entry.id)}
                >
                    🗑️
                </button>
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

function PersonajesScreen({ 
    characters, 
    groups, 
    onImport, 
    onRemove, 
    onToggleRole, 
    onToggleGroup,
    onAddGroup,
    onDeleteGroup
}: PersonajesScreenProps) {
    const pjInputRef = useRef<HTMLInputElement>(null);
    const pnjInputRef = useRef<HTMLInputElement>(null);
    const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
    const [showGroupManager, setShowGroupManager] = useState(false);

    // Apply filtering
    const filteredCharacters = characters.filter(c => {
        if (selectedGroupIds.length === 0) return true;
        // OR filtering: character must be in ANY of the selected groups
        return selectedGroupIds.some(gid => c.groupIds.includes(gid));
    });

    const pjs = filteredCharacters.filter((e) => e.role === 'pj');
    const pnjs = filteredCharacters.filter((e) => e.role === 'pnj');

    const toggleFilter = (id: string) => {
        setSelectedGroupIds(prev => 
            prev.includes(id) ? prev.filter(gid => gid !== id) : [...prev, id]
        );
    };

    const handleFile = (role: 'pj' | 'pnj') => async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        e.target.value = '';
        for (const file of files) {
            try {
                const text = await file.text();
                const parsed = JSON.parse(text);
                // Accept both raw character JSON and wrapped (wizard export) JSON
                const characterData = parsed?.character ?? parsed?.characterData ?? parsed;
                if (!characterData || typeof characterData !== 'object' || !characterData.name) {
                    alert(`«${file.name}» no parece un JSON de personaje válido (falta el campo name).`);
                    continue;
                }
                onImport(characterData, role);
            } catch {
                alert(`Error al leer «${file.name}»: no es un JSON válido.`);
            }
        }
    };

    return (
        <>
            <div className="tmt-screen-banner">
                <span className="tmt-screen-banner-icon">🎭</span>
                <div className="tmt-screen-banner-text">
                    <h2>Personajes</h2>
                    <p>
                        PJs y PNJs enviados al TMT desde el Visor de Fichas —{' '}
                        <strong>{characters.length}</strong> en total
                    </p>
                </div>
                <div className="tmt-banner-actions">
                    <button 
                        className={`tmt-header-btn ${showGroupManager ? 'tmt-header-btn--active' : ''}`}
                        onClick={() => setShowGroupManager(!showGroupManager)}
                    >
                        ⚙️ Grupos
                    </button>
                </div>
            </div>

            {showGroupManager && (
                <div className="tmt-section tmt-group-manager-section">
                    <div className="tmt-section-header">
                        <span className="tmt-section-title">Gestionar Grupos</span>
                    </div>
                    <div className="tmt-group-manager-grid">
                        <div className="tmt-group-add-form">
                            <input 
                                type="text" 
                                placeholder="Nombre del nuevo grupo..." 
                                id="new-group-name"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const input = e.currentTarget;
                                        if (input.value.trim()) {
                                            onAddGroup(input.value.trim());
                                            input.value = '';
                                        }
                                    }
                                }}
                            />
                            <button onClick={() => {
                                const input = document.getElementById('new-group-name') as HTMLInputElement;
                                if (input && input.value.trim()) {
                                    onAddGroup(input.value.trim());
                                    input.value = '';
                                }
                            }}>Añadir</button>
                        </div>
                        <div className="tmt-groups-list">
                            {groups.map(g => (
                                <div key={g.id} className="tmt-group-manage-item">
                                    <span className="tmt-group-manage-name">{g.name}</span>
                                    <button 
                                        className="tmt-icon-btn danger" 
                                        onClick={() => onDeleteGroup(g.id)}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))}
                            {groups.length === 0 && <p className="tmt-empty-text">No hay grupos creados.</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Bar */}
            {groups.length > 0 && (
                <div className="tmt-filter-bar">
                    <span className="tmt-filter-label">Filtrar:</span>
                    <div className="tmt-filter-tags">
                        <button 
                            className={`tmt-filter-tag ${selectedGroupIds.length === 0 ? 'active' : ''}`}
                            onClick={() => setSelectedGroupIds([])}
                        >
                            Todos
                        </button>
                        {groups.map(g => (
                            <button 
                                key={g.id} 
                                className={`tmt-filter-tag ${selectedGroupIds.includes(g.id) ? 'active' : ''}`}
                                onClick={() => toggleFilter(g.id)}
                                style={selectedGroupIds.includes(g.id) ? { backgroundColor: g.color || '#2563eb' } : {}}
                            >
                                {g.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* PJs */}
            <div className="tmt-section">
                <input
                    ref={pjInputRef}
                    type="file"
                    accept=".json"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFile('pj')}
                />
                <div className="tmt-section-header">
                    <span className="tmt-section-title">
                        🧑‍🦸 Personajes Jugadores — {pjs.length}
                    </span>
                    <button
                        className="tmt-add-btn"
                        onClick={() => pjInputRef.current?.click()}
                    >
                        📂 Importar JSON
                    </button>
                </div>
                <div className="tmt-section-body">
                    {pjs.length === 0 ? (
                        <div className="tmt-coming-soon">
                            <span className="tmt-coming-soon-icon">🧑‍🦸</span>
                            <p className="tmt-coming-soon-title">Sin PJs añadidos</p>
                            <p className="tmt-coming-soon-subtitle">
                                Usa el botón «🎯 Enviar a SHI TMT» en el Visor de Fichas para añadir personajes jugadores.
                            </p>
                        </div>
                    ) : (
                        <div className="tmt-entity-list">
                            {pjs.map((e) => (
                                <EntityRow 
                                    key={e.id} 
                                    entry={e} 
                                    groups={groups}
                                    onRemove={onRemove} 
                                    onToggleRole={onToggleRole} 
                                    onToggleGroup={onToggleGroup}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* PNJs */}
            <div className="tmt-section">
                <input
                    ref={pnjInputRef}
                    type="file"
                    accept=".json"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFile('pnj')}
                />
                <div className="tmt-section-header">
                    <span className="tmt-section-title">
                        👾 Personajes No Jugadores — {pnjs.length}
                    </span>
                    <button
                        className="tmt-add-btn tmt-add-btn--npc"
                        onClick={() => pnjInputRef.current?.click()}
                    >
                        📂 Importar JSON
                    </button>
                </div>
                <div className="tmt-section-body">
                    {pnjs.length === 0 ? (
                        <div className="tmt-coming-soon">
                            <span className="tmt-coming-soon-icon">👾</span>
                            <p className="tmt-coming-soon-title">Sin PNJs añadidos</p>
                            <p className="tmt-coming-soon-subtitle">
                                Usa el botón «🎯 Enviar a SHI TMT» en el Visor de Fichas y cambia
                                el rol con el botón 👾 para convertirlos en PNJs.
                            </p>
                        </div>
                    ) : (
                        <div className="tmt-entity-list">
                            {pnjs.map((e) => (
                                <EntityRow 
                                    key={e.id} 
                                    entry={e} 
                                    groups={groups}
                                    onRemove={onRemove} 
                                    onToggleRole={onToggleRole} 
                                    onToggleGroup={onToggleGroup}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// CombateScreen
// ─────────────────────────────────────────────────────────────────────────────
interface CombateScreenProps {
    characters: TmtCharacterEntry[];
}

function CombateScreen({ characters }: CombateScreenProps) {
    const [currentTurn, setCurrentTurn] = useState(0);

    // For now, order is insertion order (initiatives to be added later)
    const sorted = [...characters];

    return (
        <>
            <div className="tmt-screen-banner">
                <span className="tmt-screen-banner-icon">⚔️</span>
                <div className="tmt-screen-banner-text">
                    <h2>Combate</h2>
                    <p>Seguimiento de turnos y estado de los combatientes</p>
                </div>
            </div>

            {/* Initiative Tracker */}
            <div className="tmt-section">
                <div className="tmt-section-header">
                    <span className="tmt-section-title">Orden de Iniciativa</span>
                    {sorted.length > 0 && (
                        <button
                            className="tmt-add-btn"
                            onClick={() => setCurrentTurn((t) => (t + 1) % sorted.length)}
                        >
                            ▶ Siguiente turno
                        </button>
                    )}
                </div>
                <div className="tmt-section-body">
                    {sorted.length === 0 ? (
                        <div className="tmt-coming-soon">
                            <span className="tmt-coming-soon-icon">⏳</span>
                            <p className="tmt-coming-soon-title">Sin combatientes</p>
                            <p className="tmt-coming-soon-subtitle">
                                Añade personajes en la pantalla «Personajes» para que aparezcan aquí.
                            </p>
                        </div>
                    ) : (
                        <div className="tmt-initiative-list">
                            {sorted.map((e, i) => (
                                <div
                                    key={e.id}
                                    className={`tmt-initiative-row${i === currentTurn ? ' current' : ''}`}
                                >
                                    <span className="tmt-initiative-rank">{i + 1}</span>
                                    <span className="tmt-initiative-name">
                                        {charName(e)}
                                    </span>
                                    <span className={`tmt-combat-card-badge${e.role === 'pnj' ? ' npc' : ''}`}>
                                        {e.role.toUpperCase()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Combat Cards */}
            {sorted.length > 0 && (
                <div className="tmt-section">
                    <div className="tmt-section-header">
                        <span className="tmt-section-title">Estado de Combate</span>
                    </div>
                    <div className="tmt-section-body">
                        <div className="tmt-combat-grid">
                            {sorted.map((e) => {
                                const cd = e.characterData;
                                const maxPV = cd?.combatstats?.life ?? cd?.stats?.maxHealth ?? 10;
                                const maxEQM = cd?.combatstats?.mentalBalance ?? cd?.stats?.maxMentalBalance ?? 10;
                                return (
                                    <div key={e.id} className="tmt-combat-card">
                                        <div className="tmt-combat-card-header">
                                            <div className={`tmt-entity-avatar${e.role === 'pnj' ? ' npc' : ''}`}>
                                                {initials(charName(e))}
                                            </div>
                                            <p className="tmt-combat-card-name">{charName(e)}</p>
                                            <span className={`tmt-combat-card-badge${e.role === 'pnj' ? ' npc' : ''}`}>
                                                {e.role.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="tmt-combat-card-body">
                                            <div className="tmt-stat-row">
                                                <span className="tmt-stat-row-label">PVs</span>
                                                <div className="tmt-stat-bar-wrap">
                                                    <div
                                                        className="tmt-stat-bar-fill health"
                                                        style={{ width: `${pct(maxPV, maxPV)}%` }}
                                                    />
                                                </div>
                                                <span className="tmt-stat-row-value">{maxPV}/{maxPV}</span>
                                            </div>
                                            <div className="tmt-stat-row">
                                                <span className="tmt-stat-row-label">EQM</span>
                                                <div className="tmt-stat-bar-wrap">
                                                    <div
                                                        className="tmt-stat-bar-fill mental"
                                                        style={{ width: `${pct(maxEQM, maxEQM)}%` }}
                                                    />
                                                </div>
                                                <span className="tmt-stat-row-value">{maxEQM}/{maxEQM}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function TacticMasterTerminal() {
    const [screen, setScreen] = useState<Screen>('personajes');
    const importRef = useRef<HTMLInputElement>(null);
    const {
        store,
        characters,
        groups,
        addCharacter,
        removeCharacter,
        updateCharacterRole,
        toggleCharacterGroup,
        addGroup,
        updateGroup,
        deleteGroup,
        resetStore,
        exportStore,
        importStore,
        reload
    } = useTmtStore();

    // Poll for external writes (e.g. from CharacterViewer in another tab)
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === 'shi_tmt_store') reload();
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, [reload]);

    const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            importStore(file);
            e.target.value = '';
        }
    };

    const handleReset = () => {
        if (confirm('¿Resetear todo el TMT? Se perderán todos los personajes y datos de sesión.')) {
            resetStore();
        }
    };

    const NAV_TABS: { id: Screen; label: string; icon: string }[] = [
        { id: 'personajes', label: 'Personajes', icon: '🎭' },
        { id: 'combate', label: 'Combate', icon: '⚔️' }
    ];

    return (
        <div className="tactic-master-terminal">
            {/* Header */}
            <header className="tmt-header">
                <h1 className="tmt-title">
                    SHI Tactic Master Terminal
                    <span className="tmt-title-version">
                        ({APP_VERSIONS.TACTIC_MASTER_TERMINAL})
                    </span>
                </h1>
                <div className="tmt-header-actions">
                    {/* Hidden file input for import */}
                    <input
                        ref={importRef}
                        type="file"
                        accept=".json"
                        style={{ display: 'none' }}
                        onChange={handleImportFile}
                    />
                    <button
                        className="tmt-header-btn tmt-header-btn--import"
                        onClick={() => importRef.current?.click()}
                        title="Importar sesión TMT (JSON)"
                    >
                        📥 Importar
                    </button>
                    <button
                        className="tmt-header-btn tmt-header-btn--export"
                        onClick={exportStore}
                        title="Exportar sesión TMT (JSON)"
                    >
                        💾 Exportar
                    </button>
                    <button
                        className="tmt-header-btn tmt-header-btn--reset"
                        onClick={handleReset}
                        title="Resetear sesión"
                    >
                        🔄 Reset
                    </button>
                    <a href="/recursos" className="tmt-exit-btn">
                        ✕ Salir
                    </a>
                </div>
            </header>

            {/* Navigation */}
            <nav className="tmt-nav">
                {NAV_TABS.map((tab) => (
                    <button
                        key={tab.id}
                        className={`tmt-nav-tab${screen === tab.id ? ' active' : ''}`}
                        onClick={() => setScreen(tab.id)}
                    >
                        <span className="tmt-nav-tab-icon">{tab.icon}</span>
                        {tab.label}
                        {tab.id === 'personajes' && characters.length > 0 && (
                            <span className="tmt-nav-badge">{characters.length}</span>
                        )}
                    </button>
                ))}
                <div className="tmt-nav-meta">
                    Guardado: {store.meta.savedAt
                        ? new Date(store.meta.savedAt).toLocaleTimeString()
                        : '—'}
                </div>
            </nav>

            {/* Screen */}
            <main className="tmt-screen">
                {screen === 'personajes' && (
                    <PersonajesScreen
                        characters={characters}
                        groups={groups}
                        onImport={addCharacter}
                        onRemove={removeCharacter}
                        onToggleRole={updateCharacterRole}
                        onToggleGroup={toggleCharacterGroup}
                        onAddGroup={addGroup}
                        onDeleteGroup={deleteGroup}
                    />
                )}
                {screen === 'combate' && <CombateScreen characters={characters} />}
            </main>
        </div>
    );
}
