import React from 'react';
import { SectionHeaderBadge } from '../ui/SectionHeaderBadge';
import { FormSelect } from './FormSelect';
import './StatusSelectCard.css';

interface OptionType {
    id: string;
    label: string;
    cost?: number;
    description?: string;
}

interface StatusSelectCardProps {
    title: string;
    options: OptionType[];
    currentValue: string | undefined;
    field: string;
    currentObj: OptionType;
    onChange: (field: string, value: string) => void;
}

export const StatusSelectCard: React.FC<StatusSelectCardProps> = ({
    title,
    options,
    currentValue,
    field,
    currentObj,
    onChange
}) => (
    <div className="status-select-card">
        <div className="status-select-header">
            <h4 className="status-select-title">{title}</h4>
            <div className="section-header-badge">
                <SectionHeaderBadge
                    cost={currentObj.cost !== undefined && currentObj.cost > 0 ? `+${currentObj.cost}` : (currentObj.cost || 0)}
                    label="PC"
                    variant={currentObj.cost === 0 || currentObj.cost === undefined ? "default" : (currentObj.cost > 0 ? "penalty" : "bonus")}
                />
            </div>
        </div>
        <FormSelect
            label=""
            value={currentValue || options[0].id}
            onChange={(val) => onChange(field, val)}
            options={options.map(opt => ({
                id: opt.id,
                label: opt.label,
                cost: opt.cost,
                description: opt.description
            }))}
            showCostInOption={true}
            showDescription={true}
            noMargin
        />
    </div>
);
