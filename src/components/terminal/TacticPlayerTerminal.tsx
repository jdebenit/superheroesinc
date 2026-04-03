import React, { useState } from 'react';
import './TacticPlayerTerminal.css';
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

export default function TacticPlayerTerminal() {
    const {
        character,
        stats,
        history,
        notes,
        usedChi,
        updateHealth,
        updateMental,
        updateWillpower,
        updateNotes,
        updateChi,
        resetChi,
        deleteHistoryEntry,
        resetData,
        importData
    } = useTerminalStats();

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
        setShowEditModal(false); // Should close? Original didn't for mental/willpower, but probably should.
        // Checking original: applyHealthChange closed it. applyMentalChange did NOT. applyWillpowerChange did NOT.
        // I will follow original behavior for now regarding closing, but actually it's better UX to close it or provide feedback.
        // Let's stick to original behavior strictly first to avoid confusion: Health closed, others didn't.
        // Wait, looking at original code:
        // applyHealthChange: setShowEditModal(false);
        // applyMentalChange: NO
        // applyWillpowerChange: NO
        // This seems like a bug or inconsistency in the original code. I will fix it to close for all.
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

    const isCombatSkill = (name: string): boolean => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('artes marciales')) return true;

        // Check normal name
        const gen = GENERAL_SKILLS.find(s => s.name.toLowerCase() === name.toLowerCase());
        if (gen) return gen.category === 'combat';

        const spec = SPECIAL_SKILLS.find(s => s.name.toLowerCase() === name.toLowerCase());
        if (spec) return spec.category === 'combat';

        // Check if it's a specialization e.g. "Arma Especial: Espada"
        // Most combat special skills start with "Armas ..." or generic name.
        // Let's iterate special skills and see if the name starts with any combat skill name
        const combatSpecs = SPECIAL_SKILLS.filter(s => s.category === 'combat');
        for (const cs of combatSpecs) {
            if (name.toLowerCase().startsWith(cs.name.toLowerCase())) return true;
        }

        return false;
    };

    const handleSkillClick = (skill: any) => {
        // Find skill definition to get the type
        const generalSkill = GENERAL_SKILLS.find(s => s.name === skill.name);
        const specialSkill = SPECIAL_SKILLS.find(s =>
            s.name === skill.name ||
            (skill.id && s.id === skill.id) ||
            skill.name.toLowerCase().startsWith(s.name.toLowerCase() + ':') ||
            skill.name.toLowerCase().startsWith(s.name.toLowerCase() + ' (') // Handle variants like "Name (Spec)"
        );

        let type = 'cac'; // Default
        if (generalSkill?.type) type = generalSkill.type;
        if (specialSkill?.type) type = specialSkill.type;

        // Artes Marciales exception if not explicitly set in data (though it should be 'both' or 'cac' now)
        if (skill.name.toLowerCase().includes('artes marciales')) {
            if (!type || type === 'cac') type = 'both'; // Or check if data already has it
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
        <div className="tactic-player-terminal">
            <TerminalHeader
                title="SHI Tactic Player Terminal"
                version={APP_VERSIONS.TACTIC_PLAYER_TERMINAL}
                character={character}
                onImport={handleImportWrapper}
                onExport={handleExportJSON}
                onReset={() => setShowResetModal(true)}
                adaptedCharacter={character ? adaptWebCharacter(character) : null}
                showCharacterSheet={true}
            />

            {character ? (
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

                        {/* Chi card — only for Artista Marcial con Chi */}
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

                    <PowersPanel powers={character.powers} />

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
                <EmptyState />
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
                            className="secondary-btn" 
                            onClick={() => setShowResetModal(false)}
                        >
                            Cancelar
                        </button>
                        <button 
                            className="reset-btn" 
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
