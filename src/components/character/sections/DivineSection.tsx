import React from 'react';
import { DIVINE_FOCUS_OPTIONS } from '../../../data/divineOptions';
import { SheetSection } from '../common/SheetSection';
import { DetailRow } from '../common/DetailRow';

interface DivineSectionProps {
    character: any;
}

export const DivineSection: React.FC<DivineSectionProps> = ({ character }) => {
    const divineParams = character.divineParams;
    if (!divineParams) return null;

    const hasFocus = !!divineParams.focus;
    const hasPhysicalAlteration = divineParams.hasPhysicalAlteration === true;

    if (!hasFocus && !hasPhysicalAlteration) return null;

    return (
        <SheetSection title="Divinidad" className="divine-params">
            <ul className="clean-list">
                {hasFocus && (() => {
                    const focus = DIVINE_FOCUS_OPTIONS.find(f => f.id === divineParams.focus);
                    return focus && (
                        <li className="no-bullet-item mb-2">
                            <DetailRow
                                label="Foco del Poder"
                                value={`${focus.label} (${focus.cost > 0 ? `+${focus.cost}` : '0'} PC)`}
                                valueClassName=""
                            />
                        </li>
                    );
                })()}

                {hasPhysicalAlteration && (
                    <li className="no-bullet-item mb-2">
                        <DetailRow
                            label="Alteración física visible"
                            value={divineParams.physicalAlterationDescription?.trim()
                                ? divineParams.physicalAlterationDescription
                                : 'Sí (sin especificar)'}
                            valueClassName=""
                        />
                    </li>
                )}
            </ul>
        </SheetSection>
    );
};
