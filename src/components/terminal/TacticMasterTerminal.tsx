import React, { useState, useEffect } from 'react';
import './TacticMasterTerminal.css';
import './CommonTerminal.css';
import { APP_VERSIONS } from '../../data/appVersions';
import TerminalHeader from './components/TerminalHeader';
import PersonajesScreen from './components/PersonajesScreen';
import CombateScreen from './components/CombateScreen';
import DetallesScreen from './components/DetallesScreen';
import ComparativaScreen from './components/ComparativaScreen';
import { useTmtStore } from './hooks/useTmtStore';

type Screen = 'personajes' | 'combate' | 'detalles' | 'comparativa';

export default function TacticMasterTerminal() {
    const [screen, setScreen] = useState<Screen>('personajes');
    const {
        store, characters, groups,
        addCharacter, removeCharacter, updateCharacterRole, toggleCharacterGroup,
        addGroup, updateGroup, deleteGroup, updateCharacterInitiative, updateCharacterInitiativeMod,
        updateCharacterUsedActions, updateCharacterStat, updateActiveCombatGroups, toggleCharacterVisibility,
        deleteCharacterHistoryEntry, updateDetails, updateCombatState, resetAllActions, resetStore,

        exportStore, importStore, reload
    } = useTmtStore();

    useEffect(() => {
        const sessionName = store.details?.name;
        if (sessionName) {
            document.title = `${sessionName} | SHI TMT`;
        } else {
            document.title = "SHI Tactic Master Terminal";
        }
    }, [store.details?.name]);



    // El sistema de sincronización ahora se gestiona internamente en useTmtStore
    // mediante shi_tmt_channel y el evento 'storage'.

    return (
        <div className="tactic-terminal">
            <TerminalHeader
                title="SHI Tactic Master Terminal"
                version={APP_VERSIONS.TACTIC_MASTER_TERMINAL}
                onImport={(e) => {
                    const file = e.target.files?.[0];
                    if (file) importStore(file);
                    e.target.value = '';
                }}
                onExport={exportStore}
                onReset={() => window.confirm('¿Borrar TODO?') && resetStore()}
                importLabel="Importar TMT"
                showCharacterSheet={false}
            />

            <div className="tmt-navbar-wrapper">
                <div className="tmt-nav">
                    <button
                        className={`tmt-nav-btn ${screen === 'personajes' ? 'active' : ''}`}
                        onClick={() => setScreen('personajes')}
                    >
                        🎭 Personajes
                    </button>
                    <button
                        className={`tmt-nav-btn ${screen === 'combate' ? 'active' : ''}`}
                        onClick={() => setScreen('combate')}
                    >
                        ⚔️ Combate
                    </button>
                    <button
                        className={`tmt-nav-btn ${screen === 'comparativa' ? 'active' : ''}`}
                        onClick={() => setScreen('comparativa')}
                    >
                        📊 Comparativa
                    </button>
                    <button
                        className={`tmt-nav-btn ${screen === 'detalles' ? 'active' : ''}`}
                        onClick={() => setScreen('detalles')}
                    >
                        📝 Detalles
                    </button>
                </div>
            </div>

            <main className="tmt-main-content">
                {screen === 'personajes' && (
                    <PersonajesScreen
                        characters={characters}
                        groups={groups}
                        onAddCharacter={addCharacter}
                        onRemove={removeCharacter}
                        onToggleRole={updateCharacterRole}
                        onToggleGroup={toggleCharacterGroup}
                        onAddGroup={addGroup}
                        onUpdateGroup={updateGroup}
                        onDeleteGroup={deleteGroup}
                        onImportStore={importStore}
                        onExportStore={exportStore}
                        onResetStore={resetStore}
                    />
                )}
                {screen === 'combate' && (
                    <CombateScreen
                        characters={characters}
                        groups={groups}
                        activeGroupIds={store.activeCombatGroupIds || []}
                        onUpdateActiveGroups={updateActiveCombatGroups}
                        onUpdateInitiative={updateCharacterInitiative}
                        onUpdateInitiativeMod={updateCharacterInitiativeMod}
                        onUpdateUsedActions={updateCharacterUsedActions}
                        onUpdateStat={updateCharacterStat}
                        onDeleteHistoryEntry={deleteCharacterHistoryEntry}
                        onResetAllActions={resetAllActions}
                        onToggleVisibility={toggleCharacterVisibility}
                        currentTurn={store.currentTurn || 0}
                        currentRound={store.currentRound || 1}
                        onUpdateCombatState={updateCombatState}
                    />
                )}


                {screen === 'detalles' && (
                    <DetallesScreen
                        details={store.details || { name: '', description: '', notes: '' }}
                        onUpdateDetails={updateDetails}
                    />
                )}
                {screen === 'comparativa' && (
                    <ComparativaScreen
                        characters={characters}
                        groups={groups}
                    />
                )}
            </main>
        </div>
    );
}
