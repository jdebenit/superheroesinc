import React from 'react';

interface SkillTableProps {
    isSpecial?: boolean;
    children: React.ReactNode;
}

export const SkillTable: React.FC<SkillTableProps> = ({ isSpecial = false, children }) => {
    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            border: '1px solid #e5e7eb',
            marginBottom: '3rem',
            overflowX: 'auto'
        }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                <thead style={{ backgroundColor: isSpecial ? '#ecfdf5' : '#f9fafb', borderBottom: isSpecial ? '2px solid #10b981' : '2px solid #e5e7eb' }}>
                    <tr>
                        <th style={{ padding: '1rem', textAlign: 'left', color: isSpecial ? '#065f46' : '#374151' }}>Habilidad</th>
                        <th style={{ padding: '1rem', textAlign: 'center', color: isSpecial ? '#064e3b' : '#6b7280' }}>Fórmula</th>
                        <th style={{ padding: '1rem', textAlign: 'center', color: isSpecial ? '#064e3b' : '#6b7280' }}>Base</th>
                        <th style={{ padding: '1rem', textAlign: 'center', color: isSpecial ? '#064e3b' : '#6b7280' }}>Origen</th>
                        <th style={{ padding: '1rem', textAlign: 'center', color: isSpecial ? '#064e3b' : '#6b7280' }}>Especialidad</th>
                        <th style={{ padding: '1rem', textAlign: 'center', color: isSpecial ? '#064e3b' : '#6b7280' }}>Otros</th>
                        <th style={{ padding: '1rem', textAlign: 'center', color: isSpecial ? '#064e3b' : '#111827', fontWeight: 'bold' }}>TOTAL</th>
                        {isSpecial && (
                            <>
                                <th style={{ padding: '1rem', textAlign: 'center', color: '#064e3b' }}>PCs</th>
                                <th style={{ padding: '1rem', textAlign: 'center', color: '#064e3b' }}>Acciones</th>
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
