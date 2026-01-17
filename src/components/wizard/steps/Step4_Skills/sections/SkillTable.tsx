import React from 'react';
import './SkillTable.css';

interface SkillTableProps {
    isSpecial?: boolean;
    children: React.ReactNode;
}

export const SkillTable: React.FC<SkillTableProps> = ({ isSpecial = false, children }) => {
    return (
        <div className="wizard-skill-table-container">
            <table className="wizard-skill-table">
                <thead className={isSpecial ? 'wizard-head-special' : 'wizard-head-general'}>
                    <tr>
                        <th className={`wizard-th-left ${isSpecial ? 'wizard-th-title-special' : 'wizard-th-title-general'}`}>Habilidad</th>
                        <th className={`wizard-th-center ${isSpecial ? 'wizard-th-text-special' : 'wizard-th-text-general'}`}>Fórmula</th>
                        <th className={`wizard-th-center ${isSpecial ? 'wizard-th-text-special' : 'wizard-th-text-general'}`}>Base</th>
                        <th className={`wizard-th-center ${isSpecial ? 'wizard-th-text-special' : 'wizard-th-text-general'}`}>Origen</th>
                        <th className={`wizard-th-center ${isSpecial ? 'wizard-th-text-special' : 'wizard-th-text-general'}`}>Especialidad</th>
                        <th className={`wizard-th-center ${isSpecial ? 'wizard-th-text-special' : 'wizard-th-text-general'}`}>Otros</th>
                        <th className={`wizard-th-center wizard-th-total ${isSpecial ? 'wizard-th-total-special' : 'wizard-th-total-general'}`}>TOTAL</th>
                        {isSpecial && (
                            <>
                                <th className="wizard-th-center wizard-th-text-special">PCs</th>
                                <th className="wizard-th-center wizard-th-text-special">Acciones</th>
                            </>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {children}
                </tbody>
            </table>
        </div>
    );
};
