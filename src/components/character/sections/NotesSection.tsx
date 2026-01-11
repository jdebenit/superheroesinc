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
                {character.notes}
            </div>
        </div>
    );
};
