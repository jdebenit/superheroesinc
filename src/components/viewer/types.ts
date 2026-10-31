export interface StoredCharacter {
    id: string;
    data: any;
    addedAt: number;
    source?: 'local' | 'web';
    totalCost?: string | number;
}

export interface CharacterViewerProps {
    webCharacters?: StoredCharacter[];
}
