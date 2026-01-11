import React from 'react';
import { ORIGIN_CATEGORIES } from '../../../data/originDefinitions';

interface OriginSectionProps {
    character: any;
}

export const OriginSection: React.FC<OriginSectionProps> = ({ character }) => {
    if (!character.origin || !character.origin.items || character.origin.items.length === 0) return null;

    return (
        <div className="sheet-section origin">
            <div className="section-header">
                <h4>Origen</h4>
                {character.origin.cost && <span className="cost">({character.origin.cost} PCs)</span>}
            </div>
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
                            // Avoid duplicates if already in rawDetails (though unlikely for defaults)
                            if (!rawDetails.includes(eff)) {
                                nodes.push({ text: eff, type: 'default' });
                            }
                        });
                    }

                    // 2. Process User Details
                    rawDetails.forEach((detail: string) => {
                        // Skip if already added (e.g. matched a default effect)
                        if (nodes.some(n => n.text === detail)) return;

                        // Check if it is a Subtype
                        if (originDef?.subtypes && originDef.subtypes[detail]) {
                            nodes.push({
                                text: detail,
                                type: 'subtype',
                                children: originDef.subtypes[detail]
                            });
                            return;
                        }

                        // Normal Item
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

                                        {/* Render Subtype Children */}
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
        </div>
    );
};
