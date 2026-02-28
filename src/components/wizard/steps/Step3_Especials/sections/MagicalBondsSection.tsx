import React from 'react';
import { MAGICAL_BONDS } from '../../../../../data/magicalBonds';
import { DeleteRowButton } from '../../../shared/ui/DeleteRowButton';
import { WizardSection } from '../../../shared/layout/WizardSection';
import { WizardField } from '../../../shared/forms/WizardField';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { PixelButton } from '../../../shared/ui/PixelButton';
import { TableContainer } from '../../../shared/layout/TableContainer';

interface MagicalBondsSectionProps {
    data: any;
    onChange: (updates: any) => void;
    onOpenModal: () => void;
}

export default function MagicalBondsSection({
    data,
    onChange,
    onOpenModal,
}: MagicalBondsSectionProps) {
    return (
        <WizardSection
            title="Vinculaciones Mágicas"
            color="#4f46e5"
            description="Como Mago, debes elegir al menos una vinculación mágica que canalice tu poder."
            rightContent={
                <PixelButton onClick={onOpenModal} variant="custom" className="bg-purple-600 text-white hover:bg-purple-700">
                    <span>+</span> Añadir Vinculación
                </PixelButton>
            }
        >
            {data.magicalBonds && data.magicalBonds.length > 0 ? (
                <TableContainer
                    headers={['Vinculación', 'Descripción', 'Acciones']}
                    showTotal={false}
                >
                    {data.magicalBonds.map((bondId: string, idx: number) => {
                        const bond = MAGICAL_BONDS.find((b) => b.id === bondId);
                        if (!bond) return null;
                        return (
                            <tr key={bondId} className={idx % 2 === 0 ? 'wizard-table-row--even' : 'wizard-table-row--odd'}>
                                <td className="wizard-table-cell wizard-table-cell--left wizard-table-cell--bold">
                                    {bond.name}
                                </td>
                                <td className="wizard-table-cell wizard-table-cell--left wizard-table-cell--secondary">
                                    {bond.description}
                                </td>
                                <td className="wizard-table-cell">
                                    <DeleteRowButton
                                        onDelete={() => {
                                            const current = data.magicalBonds || [];
                                            onChange({ ...data, magicalBonds: current.filter((id: string) => id !== bondId) });
                                        }}
                                        title="Eliminar vinculación"
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </TableContainer>
            ) : (
                <EmptyState message="No hay vinculaciones mágicas seleccionadas. Usa el botón de arriba para añadir." />
            )}

            {/* Custom Bond Form */}
            <div className="section-add-form section-add-form--purple">
                <p className="section-add-form__label">Otra Vinculación (Personalizada)</p>
                <div className="section-add-form__fields">
                    <WizardField
                        label="Nombre de la Vinculación"
                        value={data.magicalBondsCustomName || ''}
                        onChange={(val: string) => onChange({ ...data, magicalBondsCustomName: val })}
                        placeholder="Ej: Pacto con el Dragón Carmesí..."
                    />
                    <WizardField
                        type="textarea"
                        label="Descripción y efectos"
                        value={data.magicalBondsCustomDescription || ''}
                        onChange={(val: string) => onChange({ ...data, magicalBondsCustomDescription: val })}
                        placeholder="Describe en qué consiste esta vinculación, qué beneficios otorga y qué sacrificios requiere..."
                    />
                </div>
            </div>
        </WizardSection>
    );
}

