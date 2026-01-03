import React from 'react';
import { diagnoseCharacterJSON, repairCharacterJSON } from '../../utils/jsonDiagnostic';

export default function JSONRepairTool() {
    const [jsonInput, setJsonInput] = React.useState('');
    const [diagnosis, setDiagnosis] = React.useState<any>(null);
    const [repairedJSON, setRepairedJSON] = React.useState('');

    const handleDiagnose = () => {
        try {
            const char = JSON.parse(jsonInput);
            const result = diagnoseCharacterJSON(char);
            setDiagnosis(result);
        } catch (e) {
            alert('Invalid JSON: ' + (e as Error).message);
        }
    };

    const handleRepair = () => {
        try {
            const char = JSON.parse(jsonInput);
            const fixed = repairCharacterJSON(char);
            setRepairedJSON(JSON.stringify(fixed, null, 2));
        } catch (e) {
            alert('Invalid JSON: ' + (e as Error).message);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(repairedJSON);
        alert('Copied to clipboard!');
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                🔧 Character JSON Repair Tool
            </h1>

            <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    Paste your character JSON here:
                </label>
                <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    style={{
                        width: '100%',
                        height: '200px',
                        padding: '1rem',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        fontFamily: 'monospace',
                        fontSize: '0.875rem'
                    }}
                    placeholder='{"name": "My Character", "skills": {...}}'
                />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={handleDiagnose}
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    🔍 Diagnose
                </button>
                <button
                    onClick={handleRepair}
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    🔧 Repair
                </button>
            </div>

            {diagnosis && (
                <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                        Diagnosis Results
                    </h2>

                    {diagnosis.issues.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                            <h3 style={{ color: '#ef4444', fontWeight: 'bold' }}>❌ Issues:</h3>
                            <ul>
                                {diagnosis.issues.map((issue: string, i: number) => (
                                    <li key={i} style={{ color: '#dc2626' }}>{issue}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {diagnosis.warnings.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                            <h3 style={{ color: '#f59e0b', fontWeight: 'bold' }}>⚠️ Warnings:</h3>
                            <ul>
                                {diagnosis.warnings.map((warning: string, i: number) => (
                                    <li key={i} style={{ color: '#d97706' }}>{warning}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {diagnosis.suggestions.length > 0 && (
                        <div>
                            <h3 style={{ color: '#3b82f6', fontWeight: 'bold' }}>💡 Suggestions:</h3>
                            <ul>
                                {diagnosis.suggestions.map((suggestion: string, i: number) => (
                                    <li key={i} style={{ color: '#2563eb' }}>{suggestion}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {repairedJSON && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                            Repaired JSON
                        </h2>
                        <button
                            onClick={handleCopy}
                            style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: '#6366f1',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            📋 Copy
                        </button>
                    </div>
                    <textarea
                        value={repairedJSON}
                        readOnly
                        style={{
                            width: '100%',
                            height: '400px',
                            padding: '1rem',
                            border: '2px solid #10b981',
                            borderRadius: '8px',
                            fontFamily: 'monospace',
                            fontSize: '0.875rem',
                            backgroundColor: '#f0fdf4'
                        }}
                    />
                </div>
            )}
        </div>
    );
}
