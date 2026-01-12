import React from 'react';
import { ORIGIN_CATEGORIES } from '../../../data/originDefinitions';
import { SheetSection } from '../common/SheetSection';

interface OriginSectionProps {
    character: any;
}

export const OriginSection: React.FC<OriginSectionProps> = ({ character }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);

    if (!character.origin || !character.origin.items || character.origin.items.length === 0) {
        // Even if no origin, we might want to show "Sin origen" in compressed view or just return null?
        // The requirement says: "Si no tiene origenes apareera Sin origen"
        // But existing code returned null. Let's respect the requirement.
        if (!isExpanded) {
            return (
                <SheetSection
                    title="Origen"
                    className="origin collapsed clickable"
                    cost={<div className="toggle-icon" onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }} title="Expandir">▼</div>}
                >
                    <div className="origin-compressed" onClick={() => setIsExpanded(true)}>
                        Sin origen
                    </div>
                </SheetSection>
            );
        }
        // If expanded but empty? Probably shouldn't happen if we handle it right, but existing code returned null. 
        // Let's keep returning null for empty if expanded, or show empty state?
        // Existing code: if (!character.origin ... ) return null;
        // We'll stick to requirement: "Si no tiene origenes apareera Sin origen"
    }

    // Initial check for completely missing data object, handle gracefully
    const hasOriginData = character.origin && character.origin.items && character.origin.items.length > 0;

    const toggleExpand = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    const renderToggleIcon = (expanded: boolean) => (
        <div
            className="toggle-icon"
            onClick={toggleExpand}
            title={expanded ? "Contraer" : "Expandir"}
        >
            {expanded ? "▲" : "▼"}
        </div>
    );

    if (!isExpanded) {
        let compressedText = "Sin origen";

        if (hasOriginData) {
            const allSubtypes: string[] = [];
            character.origin.items.forEach((item: any) => {
                const name = Object.keys(item)[0];
                const rawDetails = item[name] || [];
                const originDef = ORIGIN_CATEGORIES[name];

                let foundSubtype = false;

                // Check details for subtypes
                rawDetails.forEach((detail: string) => {
                    if (originDef?.subtypes && originDef.subtypes[detail]) {
                        allSubtypes.push(detail);
                        foundSubtype = true;
                    }
                });

                // If no subtypes found for this origin item, use the Origin Name
                if (!foundSubtype) {
                    allSubtypes.push(name);
                }
            });

            if (allSubtypes.length > 0) {
                compressedText = allSubtypes.join(' / ');
            }
        }

        return (
            <SheetSection
                title="Origen"
                className="origin collapsed clickable"
                cost={renderToggleIcon(false)}
            >
                <div
                    className="origin-compressed"
                    onClick={() => setIsExpanded(true)}
                >
                    {compressedText}
                </div>
            </SheetSection>
        );
    }

    // Expanded View (Original Logic)
    if (!hasOriginData) {
        return (
            <SheetSection
                title="Origen"
                className="origin"
                cost={renderToggleIcon(true)}
            >
                <div className="origin-detail-row">Sin origen</div>
            </SheetSection>
        );
    }

    return (
        <SheetSection
            title="Origen"
            className="origin"
            cost={
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {character.origin.cost ? <span>({character.origin.cost} PCs)</span> : null}
                    {renderToggleIcon(true)}
                </div>
            }
        >
            <ul className="clean-list">
                {character.origin.items.map((item: any, i: number) => {
                    const name = Object.keys(item)[0];
                    const rawDetails = item[name] || [];
                    const originDef = ORIGIN_CATEGORIES[name];

                    // Build structured nodes for rendering
                    const nodes: Array<{ text: string, type: 'default' | 'subtype' | 'normal', children?: string[] }> = [];

                    // 1. Add Default Effects
                    if (originDef?.defaultEffects) {
                        originDef.defaultEffects.forEach(eff => {
                            if (!rawDetails.includes(eff)) {
                                nodes.push({ text: eff, type: 'default' });
                            }
                        });
                    }

                    // 2. Process User Details
                    rawDetails.forEach((detail: string) => {
                        if (nodes.some(n => n.text === detail)) return;

                        if (originDef?.subtypes && originDef.subtypes[detail]) {
                            nodes.push({
                                text: detail,
                                type: 'subtype',
                                children: originDef.subtypes[detail]
                            });
                            return;
                        }

                        nodes.push({ text: detail, type: 'normal' });
                    });

                    const renderDetailContent = (detail: string, isSubtypeHeader: boolean = false) => {
                        const parts = detail.includes(':') ? detail.split(':').map(s => s.trim()) : [detail];
                        const detailName = parts[0];
                        const detailValue = parts.length > 1 ? parts.slice(1).join(':') : undefined;

                        return (
                            <div className="origin-detail-row">
                                <span className={`origin-detail-label ${isSubtypeHeader ? 'subtype-header' : ''}`}>
                                    {detailName}
                                </span>
                                {detailValue && (
                                    <>
                                        <span className="flex-spacer-dotted"></span>
                                        <span className="origin-detail-value">
                                            {detailValue}
                                        </span>
                                    </>
                                )}
                            </div>
                        );
                    };

                    return (
                        <li key={i} className="no-bullet-item origin-item">
                            <div className="origin-category-name">
                                {name}
                            </div>
                            <ul className="origin-sublist">
                                {nodes.map((node, j) => (
                                    <li key={j} className={`no-bullet-item origin-detail-item ${node.type === 'subtype' ? 'subtype' : ''}`}>
                                        {renderDetailContent(node.text, node.type === 'subtype')}

                                        {node.children && (
                                            <ul className="origin-subtype-list">
                                                {node.children.map((child, k) => (
                                                    <li key={k} className="no-bullet-item mb-1" style={{ marginBottom: '0.25rem' }}>
                                                        {renderDetailContent(child)}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </li>
                    );
                })}
            </ul>
        </SheetSection>
    );
};
