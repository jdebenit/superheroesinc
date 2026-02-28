import React from 'react';
import './RadioSelectTable.css';

export interface RadioSelectColumn<T> {
    key: keyof T | string;
    label: string;
    /** Optional CSS class for the <td> cells in this column */
    cellClass?: string;
    /** Render custom cell content. Receives the row and isSelected state */
    render?: (row: T, isSelected: boolean) => React.ReactNode;
}

interface RadioSelectTableProps<T extends { id: string }> {
    columns: RadioSelectColumn<T>[];
    rows: T[];
    selectedId: string | null;
    onSelect: (id: string | null) => void;
}

export function RadioSelectTable<T extends { id: string }>({
    columns,
    rows,
    selectedId,
    onSelect,
}: RadioSelectTableProps<T>) {
    return (
        <div className="radio-select-table-wrapper">
            <table className="radio-select-table">
                <thead>
                    <tr>
                        <th></th>
                        {columns.map((col) => (
                            <th key={String(col.key)}>{col.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => {
                        const isSelected = selectedId === row.id;
                        const rowClass = isSelected
                            ? 'row-selected'
                            : index % 2 === 0
                                ? 'row-even'
                                : 'row-odd';

                        return (
                            <tr
                                key={row.id}
                                className={rowClass}
                                onClick={() => onSelect(isSelected ? null : row.id)}
                            >
                                <td className="cell-radio">
                                    <input
                                        type="radio"
                                        className="radio-input"
                                        checked={isSelected}
                                        onChange={() => onSelect(isSelected ? null : row.id)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </td>
                                {columns.map((col) => (
                                    <td key={String(col.key)} className={col.cellClass ?? ''}>
                                        {col.render
                                            ? col.render(row, isSelected)
                                            : String((row as Record<string, unknown>)[col.key as string] ?? '-')}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
