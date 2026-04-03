import React, { useState } from 'react';
import './TacticMasterTerminal.css';
import { APP_VERSIONS } from '../../data/appVersions';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type Screen = 'personajes' | 'combate';

interface Entity {
    id: string;
    name: string;
    alias?: string;
    type: 'pj' | 'pnj';
    maxHealth: number;
    currentHealth: number;
    maxMental: number;
    currentMental: number;
    initiative?: number;
}

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

// ─────────────────────────────────────────────────────────────────────────────
// PersonajesScreen — PJs + PNJs unificados en dos secciones
// ─────────────────────────────────────────────────────────────────────────────
interface PersonajesScreenProps {
    entities: Entity[];
    onAdd: (type: 'pj' | 'pnj') => void;
    onRemove: (id: string) => void;
}

function EntityRow({ entity, onRemove }: { entity: Entity; onRemove: (id: string) => void }) {
    const isNpc = entity.type === 'pnj';
    return (
        <div className="tmt-entity-card">
            <div className={`tmt-entity-avatar${isNpc ? ' npc' : ''}`}>
                {initials(entity.name)}
            </div>
            <div className="tmt-entity-info">
                <p className="tmt-entity-name">{entity.name}</p>
                <p className="tmt-entity-meta">
                    {entity.alias ? `"${entity.alias}" · ` : ''}
                    PVs: {entity.currentHealth}/{entity.maxHealth}
                </p>
            </div>
            <div className="tmt-entity-actions">
                <button
                    className="tmt-icon-btn danger"
                    title="Eliminar"
                    onClick={() => onRemove(entity.id)}
                >
                    🗑️
                </button>
            </div>
        </div>
    );
}

function PersonajesScreen({ entities, onAdd, onRemove }: PersonajesScreenProps) {
    const pjs = entities.filter((e) => e.type === 'pj');
    const pnjs = entities.filter((e) => e.type === 'pnj');

    return (
        <>
            <div className="tmt-screen-banner">
                <span className="tmt-screen-banner-icon">🎭</span>
                <div className="tmt-screen-banner-text">
                    <h2>Personajes</h2>
                    <p>PJs y PNJs de esta sesión</p>
                </div>
            </div>

            {/* PJs */}
            <div className="tmt-section">
                <div className="tmt-section-header">
                    <span className="tmt-section-title">
                        🧑‍🦸 Personajes Jugadores — {pjs.length}
                    </span>
                    <button className="tmt-add-btn" onClick={() => onAdd('pj')}>
                        ＋ Añadir PJ
                    </button>
                </div>
                <div className="tmt-section-body">
                    {pjs.length === 0 ? (
                        <div className="tmt-coming-soon">
                            <span className="tmt-coming-soon-icon">🧑‍🦸</span>
                            <p className="tmt-coming-soon-title">Sin PJs añadidos</p>
                            <p className="tmt-coming-soon-subtitle">
                                Pulsa «Añadir PJ» para incorporar a los personajes del grupo.
                            </p>
                        </div>
                    ) : (
                        <div className="tmt-entity-list">
                            {pjs.map((e) => (
                                <EntityRow key={e.id} entity={e} onRemove={onRemove} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* PNJs */}
            <div className="tmt-section">
                <div className="tmt-section-header">
                    <span className="tmt-section-title">
                        👾 Personajes No Jugadores — {pnjs.length}
                    </span>
                    <button className="tmt-add-btn tmt-add-btn--npc" onClick={() => onAdd('pnj')}>
                        ＋ Añadir PNJ
                    </button>
                </div>
                <div className="tmt-section-body">
                    {pnjs.length === 0 ? (
                        <div className="tmt-coming-soon">
                            <span className="tmt-coming-soon-icon">👾</span>
                            <p className="tmt-coming-soon-title">Sin PNJs añadidos</p>
                            <p className="tmt-coming-soon-subtitle">
                                Pulsa «Añadir PNJ» para incorporar enemigos, aliados o figuras del escenario.
                            </p>
                        </div>
                    ) : (
                        <div className="tmt-entity-list">
                            {pnjs.map((e) => (
                                <EntityRow key={e.id} entity={e} onRemove={onRemove} />
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
    entities: Entity[];
}

function CombateScreen({ entities }: CombateScreenProps) {
    const [currentTurn, setCurrentTurn] = useState(0);

    const sorted = [...entities].sort(
        (a, b) => (b.initiative ?? 0) - (a.initiative ?? 0)
    );

    return (
        <>
            <div className="tmt-screen-banner">
                <span className="tmt-screen-banner-icon">⚔️</span>
                <div className="tmt-screen-banner-text">
                    <h2>Combate</h2>
                    <p>Seguimiento de turnos, PVs y estado de los combatientes</p>
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
                                        {e.name}
                                        {e.alias ? ` "${e.alias}"` : ''}
                                    </span>
                                    <span className="tmt-initiative-score">
                                        Ini: {e.initiative ?? '?'}
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
                            {sorted.map((e) => (
                                <div key={e.id} className="tmt-combat-card">
                                    <div className="tmt-combat-card-header">
                                        <div className={`tmt-entity-avatar${e.type === 'pnj' ? ' npc' : ''}`}>
                                            {initials(e.name)}
                                        </div>
                                        <p className="tmt-combat-card-name">{e.name}</p>
                                        <span className={`tmt-combat-card-badge${e.type === 'pnj' ? ' npc' : ''}`}>
                                            {e.type.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="tmt-combat-card-body">
                                        <div className="tmt-stat-row">
                                            <span className="tmt-stat-row-label">PVs</span>
                                            <div className="tmt-stat-bar-wrap">
                                                <div
                                                    className="tmt-stat-bar-fill health"
                                                    style={{ width: `${pct(e.currentHealth, e.maxHealth)}%` }}
                                                />
                                            </div>
                                            <span className="tmt-stat-row-value">
                                                {e.currentHealth}/{e.maxHealth}
                                            </span>
                                        </div>
                                        <div className="tmt-stat-row">
                                            <span className="tmt-stat-row-label">EQM</span>
                                            <div className="tmt-stat-bar-wrap">
                                                <div
                                                    className="tmt-stat-bar-fill mental"
                                                    style={{ width: `${pct(e.currentMental, e.maxMental)}%` }}
                                                />
                                            </div>
                                            <span className="tmt-stat-row-value">
                                                {e.currentMental}/{e.maxMental}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
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
    const [entities, setEntities] = useState<Entity[]>([]);

    const addEntity = (type: 'pj' | 'pnj') => {
        const name = window.prompt(
            `Nombre del ${type === 'pj' ? 'Personaje Jugador' : 'PNJ'}:`
        );
        if (!name?.trim()) return;

        const newEntity: Entity = {
            id: crypto.randomUUID(),
            name: name.trim(),
            type,
            maxHealth: 10,
            currentHealth: 10,
            maxMental: 10,
            currentMental: 10,
            initiative: 0
        };
        setEntities((prev) => [...prev, newEntity]);
    };

    const removeEntity = (id: string) => {
        setEntities((prev) => prev.filter((e) => e.id !== id));
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
                    </button>
                ))}
            </nav>

            {/* Screen */}
            <main className="tmt-screen">
                {screen === 'personajes' && (
                    <PersonajesScreen
                        entities={entities}
                        onAdd={addEntity}
                        onRemove={removeEntity}
                    />
                )}
                {screen === 'combate' && <CombateScreen entities={entities} />}
            </main>
        </div>
    );
}
