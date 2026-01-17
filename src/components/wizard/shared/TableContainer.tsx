import React from 'react';
import './TableContainer.css';

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
            <div className="table-empty-state">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="table-container">
            <table className="table">
                <thead className="table-header">
                    <tr>
                        {headers.map((header, index) => (
                            <th
                                key={index}
                                className={index === 0 ? 'table-header-cell-first' : 'table-header-cell'}
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
                        <tr className="table-footer-row">
                            <td
                                colSpan={totalColSpan}
                                className="table-footer-label"
                            >
                                {totalLabel}
                            </td>
                            <td className="table-footer-value">
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
