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
import { useTerminalStats } from './hooks/useTerminalStats';

export default function TacticPlayerTerminal() {
    const {
        character,
        stats,
        history,
        updateHealth,
        updateMental,
        updateWillpower,
        deleteHistoryEntry,
        resetData,
        importData
    } = useTerminalStats();

    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historyType, setHistoryType] = useState<'health' | 'mental' | 'willpower'>('health');

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

    const openHistoryModal = (type: 'health' | 'mental' | 'willpower') => {
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

    return (
        <div className="tactic-player-terminal">
            <TerminalHeader
                character={character}
                onImport={handleImportWrapper}
                onExport={handleExportJSON}
                onReset={resetData}
                adaptedCharacter={character ? adaptWebCharacter(character) : null}
            />

            {character ? (
                <div className="terminal-stats-container">
                    <div className="terminal-character-header">
                        <h2 className="terminal-character-name">{character.name}</h2>
                        {character.alias && (
                            <div className="terminal-character-alias">"{character.alias}"</div>
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
                        />

                        <StatCard
                            label="VOLUNTAD"
                            max={stats.willpower}
                            current={stats.willpower - stats.usedWillpower}
                            type="willpower"
                            onViewHistory={() => openHistoryModal('willpower')}
                            onEdit={() => openEditModal('willpower')}
                        />
                    </div>

                    <AttributesPanel attributes={character.attributes.values} />

                    {(character.skills?.generalItems || character.skills?.specialItems) && (
                        <SkillsPanel
                            generalSkills={character.skills?.generalItems}
                            learningSkills={character.skills?.specialItems}
                        />
                    )}
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
        </div>
    );
}
