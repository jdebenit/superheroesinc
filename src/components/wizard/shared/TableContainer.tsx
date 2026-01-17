import React from 'react';

interface TableContainerProps {
    children: React.ReactNode;
    headers: string[];
    totalLabel?: string;
    totalValue?: string | number;
    totalColSpan?: number;
    emptyMessage?: string;
    showTotal?: boolean;
}

export const TableContainer: React.FC<TableContainerProps> = ({
    children,
    headers,
    totalLabel,
    totalValue,
    totalColSpan = 3,
    emptyMessage,
    showTotal = true
}) => {
    const hasContent = React.Children.count(children) > 0;

    if (!hasContent && emptyMessage) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#9ca3af',
                fontWeight: 'bold',
                fontStyle: 'italic'
            }}>
                {emptyMessage}
            </div>
        );
    }

    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            border: '1px solid #e5e7eb',
            marginBottom: '2rem'
        }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{
                    backgroundColor: '#f9fafb',
                    borderBottom: '2px solid #e5e7eb'
                }}>
                    <tr>
                        {headers.map((header, index) => (
                            <th
                                key={index}
                                style={{
                                    padding: '1rem',
                                    textAlign: index === 0 ? 'left' : 'center',
                                    color: index === 0 ? '#374151' : '#6b7280'
                                }}
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {children}

                    {/* Total Row */}
                    {showTotal && totalLabel && totalValue !== undefined && (
                        <tr style={{
                            backgroundColor: '#f8fafc',
                            borderTop: '2px solid #e2e8f0'
                        }}>
                            <td
                                colSpan={totalColSpan}
                                style={{
                                    padding: '1rem',
                                    textAlign: 'right',
                                    fontWeight: 'bold',
                                    color: '#475569'
                                }}
                            >
                                {totalLabel}
                            </td>
                            <td style={{
                                padding: '1rem',
                                textAlign: 'center',
                                fontWeight: '900',
                                color: '#4f46e5',
                                fontSize: '1.1em'
                            }}>
                                {totalValue}
                            </td>
                            <td></td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
