import React from 'react';
import './SkillTable.css';

interface SkillTableProps {
    isSpecial?: boolean;
    children: React.ReactNode;
}

export const SkillTable: React.FC<SkillTableProps> = ({ isSpecial = false, children }) => {
    return (
        <div className="skill-table-container">
            <table className="skill-table">
                <thead className={isSpecial ? 'head-special' : 'head-general'}>
                    <tr>
                        <th className={`th-left ${isSpecial ? 'th-title-special' : 'th-title-general'}`}>Habilidad</th>
                        <th className={`th-center ${isSpecial ? 'th-text-special' : 'th-text-general'}`}>Fórmula</th>
                        <th className={`th-center ${isSpecial ? 'th-text-special' : 'th-text-general'}`}>Base</th>
                        <th className={`th-center ${isSpecial ? 'th-text-special' : 'th-text-general'}`}>Origen</th>
                        <th className={`th-center ${isSpecial ? 'th-text-special' : 'th-text-general'}`}>Especialidad</th>
                        <th className={`th-center ${isSpecial ? 'th-text-special' : 'th-text-general'}`}>Otros</th>
                        <th className={`th-center th-total ${isSpecial ? 'th-total-special' : 'th-total-general'}`}>TOTAL</th>
                        {isSpecial && (
                            <>
                                <th className="th-center th-text-special">PCs</th>
                                <th className="th-center th-text-special">Acciones</th>
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
