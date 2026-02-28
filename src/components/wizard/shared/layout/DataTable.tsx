import React, { type ReactNode } from 'react';

export interface Column<T> {
    header: string;
    accessor?: keyof T;
    render?: (item: T, index: number) => ReactNode;
    align?: 'left' | 'center' | 'right';
    width?: string;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    emptyState?: ReactNode;
    headerColor?: string; // Hex or css var
    rowKey: (item: T, index: number) => string | number;
    footer?: ReactNode;
}

export function DataTable<T>({
    columns,
    data,
    emptyState,
    headerColor = '#f9fafb',
    rowKey,
    footer
}: DataTableProps<T>) {
    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            border: '1px solid #e5e7eb',
        }} className="powers-table-wrapper">
            <table className="powers-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: headerColor, borderBottom: '2px solid #e5e7eb' }}>
                    <tr>
                        {columns.map((col, idx) => (
                            <th
                                key={idx}
                                style={{
                                    padding: '1rem',
                                    textAlign: col.align || 'left',
                                    width: col.width
                                }}
                                className="font-comic text-gray-700 uppercase text-sm tracking-wider"
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} style={{ padding: '0' }}>
                                {emptyState || (
                                    <div className="p-12 text-center text-gray-400 font-bold italic">
                                        No hay datos disponibles
                                    </div>
                                )}
                            </td>
                        </tr>
                    ) : (
                        data.map((item, rowIdx) => (
                            <tr key={rowKey(item, rowIdx)} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                                {columns.map((col, colIdx) => (
                                    <td
                                        key={colIdx}
                                        style={{
                                            padding: '1rem',
                                            textAlign: col.align || 'left'
                                        }}
                                    >
                                        {col.render ? col.render(item, rowIdx) : (item as any)[col.accessor!]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
                {footer && (
                    <tfoot style={{ backgroundColor: '#f9fafb', borderTop: '2px solid #e5e7eb' }}>
                        {footer}
                    </tfoot>
                )}
            </table>
        </div>
    );
}
