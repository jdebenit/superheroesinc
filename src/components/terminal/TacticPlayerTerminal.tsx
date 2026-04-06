import React, { useState, useEffect } from 'react';
import './TacticPlayerTerminal.css';
import './CommonTerminal.css';
import { adaptWebCharacter } from '../../utils/characterAdapter';
import TerminalHeader from './components/TerminalHeader';
import StatCard from './components/StatCard';
import HistoryModal from './components/HistoryModal';
import EditStatModal from './components/EditStatModal';
import EmptyState from './components/EmptyState';
import AttributesPanel from './components/AttributesPanel';
import SkillsPanel from './components/SkillsPanel';
import PowersPanel from './components/PowersPanel';
import OtherStatsPanel from './components/OtherStatsPanel';
import { useTerminalStats } from './hooks/useTerminalStats';
import UnifiedRollModal from './components/UnifiedRollModal';
import NotesPanel from './components/NotesPanel';
import ChiCounter from './components/ChiCounter';
import { GENERAL_SKILLS } from '../../data/generalSkills';
import { SPECIAL_SKILLS } from '../../data/specialSkills';
import { APP_VERSIONS } from '../../data/appVersions';
import Modal from './components/Modal';
import { useTmtSync } from './hooks/useTmtSync';
import PlayerCombatScreen from './components/PlayerCombatScreen';

export default function TacticPlayerTerminal() {
    const {
        character,
        stats,
        history,
        notes,
        usedChi,
        updateHealth,
        updateMental,
        updateHealthFromMaster,
        updateMentalFromMaster,
        updateWillpower,
        updateWillpowerFromMaster,
        syncHistoryFromMaster,
        softReset,
        updateNotes,



        updateChi,
        resetChi,
        deleteHistoryEntry,
        resetData,
        importData,
        importCharacterJSON
    } = useTerminalStats();

    const { 
        tmtStore, 
        publicCharacters, 
        isCombatActive,
        updateCharacterStatInTmt
    } = useTmtSync();


    const [currentView, setCurrentView] = useState<'sheet' | 'combat'>('sheet');

    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historyType, setHistoryType] = useState<'health' | 'mental' | 'willpower' | 'chi'>('health');
    const [showResetModal, setShowResetModal] = useState(false);

    // Edit Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editModalType, setEditModalType] = useState<'health' | 'mental' | 'willpower'>('health');

    // Temporary inputs for changes
    const [healthChange, setHealthChange] = useState<string>('');
    const [healthNotes, setHealthNotes] = useState<string>('');
    const [mentalChange, setMentalChange] = useState<string>('');
    const [mentalNotes, setMentalNotes] = useState<string>('');
    const [willpowerChange, setWillpowerChange] = useState<string>('');
    const [willpowerNotes, setWillpowerNotes] = useState<string>('');

    // Unified Roll Modal State
    const [rollModalData, setRollModalData] = useState<{
        isOpen: boolean;
        skillName: string;
        skillValue: number;
        initialMode: 'basic' | 'combat';
        skillType: 'cac' | 'distance' | 'both' | string;
    }>({
        isOpen: false,
        skillName: '',
        skillValue: 0,
        initialMode: 'basic',
        skillType: 'cac'
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // BI-DIRECTIONAL SYNC (TMT <-> TPT)
    // ─────────────────────────────────────────────────────────────────────────────
    
    // 1. Sync: Master -> Player
    useEffect(() => {
        if (!character || !tmtStore) return;
        const myName = (character.alias || character.name || '').toLowerCase();
        const meInTmt = tmtStore.characters.find(c => 
            (c.characterData.alias || c.characterData.name || '').toLowerCase() === myName
        );

        if (meInTmt) {
            // Solo actualizamos localmente si hay diferencia real
            if (typeof meInTmt.currentHealth === 'number' && meInTmt.currentHealth !== stats.currentHealth) {
                updateHealthFromMaster(meInTmt.currentHealth);
            }
            if (typeof meInTmt.currentMental === 'number' && meInTmt.currentMental !== stats.currentMentalBalance) {
                updateMentalFromMaster(meInTmt.currentMental);
            }
            if (typeof meInTmt.currentWillpower === 'number') {
                const currentWillpower = stats.willpower - stats.usedWillpower;
                if (meInTmt.currentWillpower !== currentWillpower) {
                    updateWillpowerFromMaster(meInTmt.currentWillpower);
                }
            }
            // Sincronizar Historial completo
            if (meInTmt.history) {
                syncHistoryFromMaster(meInTmt.history);
            }
        } else if (tmtStore && tmtStore.characters.length === 0) {
            // Master Reset detected
            softReset();
        }
    }, [tmtStore, character]);

 // No incluimos 'stats' para evitar bucles de retroalimentación


    // 2. Sync: Player -> Master
    useEffect(() => {
        if (!character || !tmtStore) return;
        const myName = (character.alias || character.name || '');
        
        const meInTmt = tmtStore.characters.find(c => 
            (c.characterData.alias || c.characterData.name || '').toLowerCase() === myName.toLowerCase()
        );

        if (meInTmt) {
            // Solo enviamos si el valor local es DISTINTO al del Master (evita bucles)
            if (meInTmt.currentHealth !== stats.currentHealth) {
                const lastNotes = history.find(e => e.type === 'health')?.notes;
                updateCharacterStatInTmt(myName, 'health', stats.currentHealth, lastNotes);
            }
            if (meInTmt.currentMental !== stats.currentMentalBalance) {
                const lastNotes = history.find(e => e.type === 'mental')?.notes;
                updateCharacterStatInTmt(myName, 'mental', stats.currentMentalBalance, lastNotes);
            }
            const currentWillpower = stats.willpower - stats.usedWillpower;
            if (meInTmt.currentWillpower !== currentWillpower) {
                const lastNotes = history.find(e => e.type === 'willpower')?.notes;
                updateCharacterStatInTmt(myName, 'willpower', currentWillpower, lastNotes);
            }
        }
    }, [stats.currentHealth, stats.currentMentalBalance, stats.usedWillpower, stats.willpower, character]);


 // Eliminamos tmtStore de dependencias para evitar carreras



    const openHistoryModal = (type: 'health' | 'mental' | 'willpower' | 'chi') => {
        setHistoryType(type);
        setShowHistoryModal(true);
    };

    const openEditModal = (type: 'health' | 'mental' | 'willpower') => {
        setEditModalType(type);
        setShowEditModal(true);
        // Reset inputs when opening
        if (type === 'health') {
            setHealthChange('');
            setHealthNotes('');
        }
    };

    const handleApplyHealth = () => {
        const change = parseInt(healthChange) || 0;
        updateHealth(change, healthNotes);
        setHealthChange('');
        setHealthNotes('');
        setShowEditModal(false);
    };

    const handleApplyMental = () => {
        const change = parseInt(mentalChange) || 0;
        updateMental(change, mentalNotes);
        setMentalChange('');
        setMentalNotes('');
        setShowEditModal(false);
        setShowEditModal(false);
    };

    const handleApplyWillpower = () => {
        const change = parseInt(willpowerChange) || 0;
        updateWillpower(change, willpowerNotes);
        setWillpowerChange('');
        setWillpowerNotes('');
        setShowEditModal(false);
    };

    const handleExportJSON = () => {
        if (!character) return;

        const exportData = {
            meta: {
                version: APP_VERSIONS.TACTIC_PLAYER_TERMINAL,
                generator: 'SHI-TPT'
            },
            character,
            stats,
            history,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SHI-TPT-${character.name.replace(/\s+/g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImportWrapper = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            importData(file);
            event.target.value = '';
        }
    };

    const handleImportCharacter = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            importCharacterJSON(file);
            event.target.value = '';
        }
    };

    const isCombatSkill = (name: string): boolean => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('artes marciales')) return true;

        const gen = GENERAL_SKILLS.find((s: any) => s.name.toLowerCase() === name.toLowerCase());
        if (gen) return gen.category === 'combat';

        const spec = SPECIAL_SKILLS.find((s: any) => s.name.toLowerCase() === name.toLowerCase());
        if (spec) return spec.category === 'combat';

        const combatSpecs = SPECIAL_SKILLS.filter((s: any) => s.category === 'combat');
        for (const cs of combatSpecs) {
            if (name.toLowerCase().startsWith(cs.name.toLowerCase())) return true;
        }

        return false;
    };

    const handleSkillClick = (skill: any) => {
        const generalSkill = GENERAL_SKILLS.find((s: any) => s.name === skill.name);
        const specialSkill = SPECIAL_SKILLS.find((s: any) =>
            s.name === skill.name ||
            (skill.id && s.id === skill.id) ||
            skill.name.toLowerCase().startsWith(s.name.toLowerCase() + ':') ||
            skill.name.toLowerCase().startsWith(s.name.toLowerCase() + ' (') 
        );

        let type = 'cac'; 
        if (generalSkill?.type) type = generalSkill.type;
        if (specialSkill?.type) type = specialSkill.type;

        if (skill.name.toLowerCase().includes('artes marciales')) {
            if (!type || type === 'cac') type = 'both'; 
        }

        const isCombat = isCombatSkill(skill.name);

        setRollModalData({
            isOpen: true,
            skillName: skill.name,
            skillValue: typeof skill.value === 'number' ? skill.value : parseInt(skill.value.toString().replace('%', '')) || 0,
            initialMode: isCombat ? 'combat' : 'basic',
            skillType: type
        });
    };

    const handleMentalRoll = () => {
        setRollModalData({
            isOpen: true,
            skillName: 'Equilibrio Mental',
            skillValue: stats.maxMentalBalance,
            initialMode: 'basic',
            skillType: 'cac'
        });
    };

    return (
        <div className="tactic-terminal">
            <TerminalHeader
                title="SHI Tactic Player Terminal"
                version={APP_VERSIONS.TACTIC_PLAYER_TERMINAL}
                character={character}
                onImport={handleImportWrapper}
                onImportCharacter={handleImportCharacter}
                onExport={handleExportJSON}
                onReset={() => setShowResetModal(true)}
                adaptedCharacter={character ? adaptWebCharacter(character) : null}
                showCharacterSheet={true}
            />

            <div className="terminal-nav-wrapper">
                <div className="terminal-nav">
                    <button 
                        className={`terminal-nav-btn ${currentView === 'sheet' ? 'active' : ''}`}
                        onClick={() => setCurrentView('sheet')}
                    >
                        🎭 Ficha de Personaje
                    </button>
                    <button 
                        className={`terminal-nav-btn ${currentView === 'combat' ? 'active' : ''}`}
                        onClick={() => setCurrentView('combat')}
                    >
                        ⚔️ Tracker de Combate
                        {isCombatActive && <span className="active-dot" title="¡Combate en curso!" />}
                    </button>
                </div>
            </div>

            {character ? (
                <>
                {currentView === 'sheet' ? (
                    <div className="terminal-stats-container">
                        <div className="terminal-character-header">
                            <h2 className="terminal-character-alias">{character.alias}</h2>
                            {character.name && (
                                <div className="terminal-character-name">"{character.name}"</div>
                            )}
                        </div>

                        <div className="terminal-stats-grid">
                            <StatCard
                                label="PVs"
                                max={stats.maxHealth}
                                current={stats.currentHealth}
                                type="health"
                                onViewHistory={() => openHistoryModal('health')}
                                unconsciousness={stats.unconsciousnessPoints}
                                onEdit={() => openEditModal('health')}
                            />

                            <StatCard
                                label="EQM"
                                max={stats.maxMentalBalance}
                                current={stats.currentMentalBalance}
                                type="mental"
                                onViewHistory={() => openHistoryModal('mental')}
                                onEdit={() => openEditModal('mental')}
                                onRoll={handleMentalRoll}
                            />

                            <StatCard
                                label="VOLUNTAD"
                                max={stats.willpower}
                                current={stats.willpower - stats.usedWillpower}
                                type="willpower"
                                onViewHistory={() => openHistoryModal('willpower')}
                                onEdit={() => openEditModal('willpower')}
                            />

                            {(() => {
                                const CHI_TERM = 'artista marcial con chi';
                                const char = character as any;
                                const isArtistaConChi =
                                    char.origin?.items?.some((item: any) => {
                                        const keys = Object.keys(item);
                                        if (keys.some((k: string) => k.toLowerCase().includes(CHI_TERM))) return true;
                                        return keys.some((k: string) => {
                                            const val = item[k];
                                            return Array.isArray(val) && val.some((v: any) =>
                                                typeof v === 'string' && v.toLowerCase().includes(CHI_TERM)
                                            );
                                        });
                                    }) ||
                                    (char.traumas && Object.keys(char.traumas).some((k: string) =>
                                        k.toLowerCase().includes(CHI_TERM)
                                    ));
                                return isArtistaConChi ? (
                                    <ChiCounter
                                        level={character.level ?? 1}
                                        usedChi={usedChi}
                                        onUpdate={updateChi}
                                        onReset={resetChi}
                                        onViewHistory={() => openHistoryModal('chi')}
                                    />
                                ) : null;
                            })()}
                        </div>

                        <AttributesPanel attributes={character.attributes.values} />

                        <OtherStatsPanel
                            combatstats={character.combatstats}
                            otherstats={character.otherstats}
                            background={character.background}
                        />

                        <PowersPanel
                            powers={character.powers}
                            attributes={character.attributes.values}
                        />

                        {(character.skills?.generalItems || character.skills?.specialItems) && (
                            <SkillsPanel
                                generalSkills={character.skills?.generalItems}
                                learningSkills={character.skills?.specialItems}
                                onSkillClick={handleSkillClick}
                            />
                        )}

                        <NotesPanel notes={notes} onChange={updateNotes} />
                    </div>
                ) : (
                    <PlayerCombatScreen 
                        characters={publicCharacters}
                        currentTurn={tmtStore?.currentTurn || 0}
                        currentRound={tmtStore?.currentRound || 1}
                        playerCharacterName={character.alias || character.name}
                    />

                )}
                </>
            ) : (
                <div className="terminal-stats-container">
                    {currentView === 'combat' ? (
                        <PlayerCombatScreen 
                            characters={publicCharacters}
                            currentTurn={tmtStore?.currentTurn || 0}
                            currentRound={tmtStore?.currentRound || 1}
                        />
                    ) : (

                        <EmptyState />
                    )}
                </div>
            )}

            <HistoryModal
                show={showHistoryModal}
                type={historyType}
                history={history}
                onClose={() => setShowHistoryModal(false)}
                onDeleteEntry={deleteHistoryEntry}
            />

            <EditStatModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title={
                    editModalType === 'health' ? "Modificar PVs" :
                        editModalType === 'mental' ? "Modificar EQM" :
                            "Modificar VOLUNTAD"
                }
                currentValue={
                    editModalType === 'health' ? stats.currentHealth :
                        editModalType === 'mental' ? stats.currentMentalBalance :
                            (stats.willpower - stats.usedWillpower)
                }
                changeValue={
                    editModalType === 'health' ? healthChange :
                        editModalType === 'mental' ? mentalChange :
                            willpowerChange
                }
                notes={
                    editModalType === 'health' ? healthNotes :
                        editModalType === 'mental' ? mentalNotes :
                            willpowerNotes
                }
                onChangeValueChange={
                    editModalType === 'health' ? setHealthChange :
                        editModalType === 'mental' ? setMentalChange :
                            setWillpowerChange
                }
                onNotesChange={
                    editModalType === 'health' ? setHealthNotes :
                        editModalType === 'mental' ? setMentalNotes :
                            setWillpowerNotes
                }
                onApply={
                    editModalType === 'health' ? handleApplyHealth :
                        editModalType === 'mental' ? handleApplyMental :
                            handleApplyWillpower
                }
            />

            <UnifiedRollModal
                isOpen={rollModalData.isOpen}
                onClose={() => setRollModalData(prev => ({ ...prev, isOpen: false }))}
                title={rollModalData.skillName}
                targetValue={rollModalData.skillValue}
                initialMode={rollModalData.initialMode}
                skillType={rollModalData.skillType}
            />

            <Modal isOpen={showResetModal} onClose={() => setShowResetModal(false)} title="Confirmar Reset">
                <div style={{ padding: '1rem', textAlign: 'center' }}>
                    <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
                        ¿Estás seguro de que quieres borrar todos los datos guardados de este terminal?
                        Esta acción borrará la ficha, estadísticas, notas e historial permanentemente.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button
                            className="terminal-btn-secondary"
                            onClick={() => setShowResetModal(false)}
                        >
                            Cancelar
                        </button>
                        <button
                            className="terminal-btn-danger"
                            onClick={resetData}
                        >
                            Resetear Todo
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
