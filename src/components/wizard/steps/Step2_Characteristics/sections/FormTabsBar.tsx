export interface FormTabOption {
    id: string;
    icon: string;
    title: string;
    cost: number;
}

interface FormTabsBarProps {
    effectiveTab: string;
    totalPC: number;
    formTabs: FormTabOption[];
    onSelectTab: (tabId: string) => void;
}

export function FormTabsBar({
    effectiveTab,
    totalPC,
    formTabs,
    onSelectTab
}: FormTabsBarProps) {
    if (formTabs.length === 0) return null;

    return (
        <div className="step2-forms-tabs-bar">
            <button
                type="button"
                onClick={() => onSelectTab('base')}
                className={`step2-form-tab ${effectiveTab === 'base' ? 'active' : ''}`}
            >
                <span className="step2-form-tab-icon">👤</span>
                <span className="step2-form-tab-title">Forma Humana / Base</span>
                <span className="step2-form-tab-cost">{totalPC.toFixed(1)} PC</span>
            </button>
            {formTabs.map(tab => (
                <button
                    key={tab.id}
                    type="button"
                    onClick={() => onSelectTab(tab.id)}
                    className={`step2-form-tab werewolf-tab ${effectiveTab === tab.id ? 'active' : ''}`}
                >
                    <span className="step2-form-tab-icon">{tab.icon}</span>
                    <span className="step2-form-tab-title">{tab.title}</span>
                    <span className="step2-form-tab-cost">
                        +{tab.cost.toFixed(1)} PC
                    </span>
                </button>
            ))}
        </div>
    );
}
