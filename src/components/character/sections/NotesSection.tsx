import React from 'react';

interface NotesSectionProps {
    character: any;
}

export const NotesSection: React.FC<NotesSectionProps> = ({ character }) => {
    if (!character.notes) return null;

    return (
        <div className="sheet-section notes">
            <div className="section-header">
                <h4>Notas y Descripción</h4>
            </div>
            <div className="notes-content">
                {Array.isArray(character.notes) ? (
                    <div className="notes-array-container">
                        {character.notes.map((note: string, idx: number) => (
                            <p key={idx} className="notes-paragraph">{note}</p>
                        ))}
                    </div>
                ) : (
                    <p className="notes-paragraph">{character.notes}</p>
                )}
            </div>
        </div>
    );
};
