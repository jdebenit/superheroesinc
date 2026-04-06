import React, { useState, useMemo } from 'react';
import { type TmtCharacterEntry, type TmtGroup } from '../hooks/useTmtStore';
import { charName } from '../utils/tmtUtils';
import { POWERS } from '../../../data/powers';
import './ComparativaScreen.css';

interface ComparativaScreenProps {
    characters: TmtCharacterEntry[];
    groups: TmtGroup[];
}

type Section = 'attributes' | 'skills' | 'powers' | 'combat' | 'other';

export default function ComparativaScreen({ characters, groups }: ComparativaScreenProps) {
    const [selectedRole, setSelectedRole] = useState<'all' | 'pj' | 'pnj'>('all');
    const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
    const [visibleSections, setVisibleSections] = useState<Section[]>(['attributes', 'combat', 'other', 'skills', 'powers']);

    // Filters
    const filteredCharacters = useMemo(() => {
        return characters.filter(c => {
            const roleMatch = selectedRole === 'all' || c.role === selectedRole;
            const groupMatch = selectedGroupIds.length === 0 || selectedGroupIds.some(id => c.groupIds.includes(id));
            return roleMatch && groupMatch;
        });
    }, [characters, selectedRole, selectedGroupIds]);

    // Data Extraction
    const allAttributes = useMemo(() => {
        const attrs = new Set<string>();
        characters.forEach(c => {
            const values = c.characterData?.attributes?.values || {};
            Object.keys(values).forEach(k => attrs.add(k));
        });
        return Array.from(attrs).sort();
    }, [characters]);

    const allSkills = useMemo(() => {
        const skills = new Set<string>();
        characters.forEach(c => {
            const general = c.characterData?.skills?.generalItems || [];
            const special = c.characterData?.skills?.specialItems || [];
            general.forEach((s: any) => skills.add(s.name));
            special.forEach((s: any) => skills.add(s.name));
        });
        return Array.from(skills).sort();
    }, [characters]);

    const allPowers = useMemo(() => {
        const powers = new Set<string>();
        characters.forEach(c => {
            const selected = c.characterData?.powers?.selected || [];
            selected.forEach((p: any) => {
                const powerDef = POWERS.find(pd => pd.id === p.id);
                powers.add(powerDef?.name || p.name || p.id);
            });
        });
        return Array.from(powers).sort();
    }, [characters]);

    const allCombatStats = useMemo(() => {
        const stats = new Set<string>();
        characters.forEach(c => {
            const combat = c.characterData?.combatstats;
            if (Array.isArray(combat)) {
                combat.forEach((s: string) => {
                    const label = s.split(':')[0]?.trim();
                    if (label) stats.add(label);
                });
            } else if (combat && typeof combat === 'object') {
                Object.keys(combat).forEach(k => stats.add(k));
            }
        });
        return Array.from(stats).sort();
    }, [characters]);

    const allOtherStats = useMemo(() => {
        const stats = new Set<string>();
        characters.forEach(c => {
            const other = c.characterData?.otherstats;
            if (Array.isArray(other)) {
                other.forEach((s: string) => {
                    const label = s.split(':')[0]?.trim();
                    if (label) stats.add(label);
                });
            } else if (other && typeof other === 'object') {
                Object.keys(other).forEach(k => stats.add(k));
            }
        });
        return Array.from(stats).sort();
    }, [characters]);

    const toggleGroup = (id: string) => {
        setSelectedGroupIds(curr => 
            curr.includes(id) ? curr.filter(i => i !== id) : [...curr, id]
        );
    };

    const toggleSection = (section: Section) => {
        setVisibleSections(curr => 
            curr.includes(section) ? curr.filter(s => s !== section) : [...curr, section]
        );
    };

    return (
        <div className="tmt-screen comparativa-screen">
            <div className="tmt-screen-banner">
                <span className="tmt-screen-banner-icon">📊</span>
                <div className="tmt-screen-banner-text">
                    <h2>Comparativa de Personajes</h2>
                </div>
            </div>

            <div className="comparativa-controls">
                <div className="comparativa-filters">
                    <div className="filter-group">
                        <label>ROL:</label>
                        <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as any)}>
                            <option value="all">Todos</option>
                            <option value="pj">PJs</option>
                            <option value="pnj">PNJs</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>GRUPOS:</label>
                        <div className="group-chips">
                            {groups.map(g => (
                                <button 
                                    key={g.id} 
                                    className={`group-chip ${selectedGroupIds.includes(g.id) ? 'active' : ''}`}
                                    style={{ '--group-color': g.color || '#4b5563' } as React.CSSProperties}
                                    onClick={() => toggleGroup(g.id)}
                                >
                                    {g.name}
                                </button>
                            ))}
                            {groups.length === 0 && <span className="empty-hint">No hay grupos definidos</span>}
                        </div>
                    </div>
                </div>

                <div className="section-toggles">
                    <label>VER SECCIONES:</label>
                    <button className={visibleSections.includes('attributes') ? 'active' : ''} onClick={() => toggleSection('attributes')}>Atributos</button>
                    <button className={visibleSections.includes('combat') ? 'active' : ''} onClick={() => toggleSection('combat')}>Combate</button>
                    <button className={visibleSections.includes('other') ? 'active' : ''} onClick={() => toggleSection('other')}>Otros</button>
                    <button className={visibleSections.includes('skills') ? 'active' : ''} onClick={() => toggleSection('skills')}>Habilidades</button>
                    <button className={visibleSections.includes('powers') ? 'active' : ''} onClick={() => toggleSection('powers')}>Poderes</button>
                </div>
            </div>

            <div className="comparativa-table-container">
                <table className="comparativa-table">
                    <thead>
                        <tr>
                            <th className="sticky-col">Personaje</th>
                            {visibleSections.includes('attributes') && allAttributes.map(a => <th key={a} className="attr-header">{a.slice(0,3).toUpperCase()}</th>)}
                            {visibleSections.includes('combat') && allCombatStats.map(s => <th key={s} className="combat-header">{s}</th>)}
                            {visibleSections.includes('other') && allOtherStats.map(s => <th key={s} className="other-header">{s}</th>)}
                            {visibleSections.includes('skills') && allSkills.map(s => <th key={s} className="skill-header">{s}</th>)}
                            {visibleSections.includes('powers') && allPowers.map(p => <th key={p} className="power-header">{p}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCharacters.map(c => {
                            const data = c.characterData;
                            const charAttrs = data?.attributes?.values || {};
                            const charSkills = [...(data?.skills?.generalItems || []), ...(data?.skills?.specialItems || [])];
                            const charPowers = data?.powers?.selected || [];
                            const charCombat = data?.combatstats || {};
                            const charOther = data?.otherstats || {};

                            const getStatValue = (source: any, label: string) => {
                                if (Array.isArray(source)) {
                                    const entry = source.find((s: string) => s.startsWith(`${label}:`));
                                    return entry ? entry.split(':')[1]?.trim() : '-';
                                }
                                return source[label] || '-';
                            };

                            return (
                                <tr key={c.id}>
                                    <td className="sticky-col char-name-cell">
                                        <div className="char-name-wrapper">
                                            <span className={`role-indicator ${c.role}`}>{c.role === 'pj' ? 'P' : 'N'}</span>
                                            {charName(c)}
                                        </div>
                                    </td>
                                    {visibleSections.includes('attributes') && allAttributes.map(a => (
                                        <td key={a} className="value-cell attr-cell">{charAttrs[a] || '-'}</td>
                                    ))}
                                    {visibleSections.includes('combat') && allCombatStats.map(s => (
                                        <td key={s} className="value-cell combat-cell">{getStatValue(charCombat, s)}</td>
                                    ))}
                                    {visibleSections.includes('other') && allOtherStats.map(s => (
                                        <td key={s} className="value-cell other-cell">{getStatValue(charOther, s)}</td>
                                    ))}
                                    {visibleSections.includes('skills') && allSkills.map(s => {
                                        const skill = charSkills.find((sk: any) => sk.name === s);
                                        return <td key={s} className="value-cell skill-cell">{skill ? skill.value : '-'}</td>;
                                    })}
                                    {visibleSections.includes('powers') && allPowers.map(p => {
                                        const power = charPowers.find((pw: any) => {
                                            const pd = POWERS.find(def => def.id === pw.id);
                                            return (pd?.name || pw.name || pw.id) === p;
                                        });
                                        return <td key={p} className="value-cell power-cell">{power ? `R${power.rank}` : '-'}</td>;
                                    })}
                                </tr>
                            );
                        })}
                        {filteredCharacters.length === 0 && (
                            <tr>
                                <td colSpan={100} className="empty-table-msg">No hay personajes que coincidan con los filtros.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
