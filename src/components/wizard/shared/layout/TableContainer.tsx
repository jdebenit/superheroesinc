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
    tableClassName?: string;
}

export const TableContainer: React.FC<TableContainerProps> = ({
    children,
    headers,
    totalLabel,
    totalValue,
    totalColSpan = 3,
    emptyMessage,
    showTotal = true,
    tableClassName = ''
}) => {
    const hasContent = React.Children.count(children) > 0;

    if (!hasContent && emptyMessage) {
        return (
            <div className="wizard-table-empty-state">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="wizard-table-container">
            <table className={`wizard-table ${tableClassName}`}>
                <thead className="wizard-table-header">
                    <tr>
                        {headers.map((header, index) => (
                            <th
                                key={index}
                                className={index === 0 ? 'wizard-table-header-cell-first' : 'wizard-table-header-cell'}
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
                        <tr className="wizard-table-footer-row">
                            <td
                                colSpan={totalColSpan}
                                className="wizard-table-footer-label"
                            >
                                {totalLabel}
                            </td>
                            <td className="wizard-table-footer-value">
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
