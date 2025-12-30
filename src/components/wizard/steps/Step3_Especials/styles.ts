export const modalStyles = `
.pixel-button {
    padding: 0.75rem 1.5rem;
    font-weight: 900;
    text-transform: uppercase;
    border: 4px solid rgba(0,0,0,0.1);
    border-radius: 8px;
    transition: all 0.2s;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    cursor: pointer;
    font-family: var(--font-comic, sans-serif);
}
.pixel-button:hover {
    border-color: rgba(0,0,0,0.2);
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0,0,0,0.15);
}
.pixel-button:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

/* Modal Overlay Styles */
.wizard-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
}

.wizard-modal-content {
    background: white;
    width: 100%;
    max-width: 1200px;
    max-height: 90vh;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 4px solid var(--color-secondary, #000);
}

.modal-header {
    padding: 1rem 1.5rem;
    background: var(--color-secondary, #000);
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-title {
    font-family: var(--font-comic, sans-serif);
    font-size: 1.5rem;
    font-weight: bold;
    margin: 0;
}

.modal-close {
    background: none;
    border: none;
    color: white;
    font-size: 2rem;
    cursor: pointer;
    line-height: 1;
}

.modal-scroll-area {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    background: #f5f5f5;
}

.modal-footer {
    padding: 1rem;
    background: white;
    border-top: 2px solid #eee;
    display: flex;
    justify-content: flex-end;
}

.confirm-button {
    background: #22c55e;
    color: white;
    padding: 0.8rem 2rem;
    border: 2px solid #166534;
    border-radius: 8px;
    font-weight: bold;
    font-size: 1.1rem;
    cursor: pointer;
    box-shadow: 4px 4px 0px #166534;
    transition: all 0.2s;
    font-family: var(--font-comic, sans-serif);
}

.confirm-button:hover {
    transform: translateY(-2px);
    box-shadow: 6px 6px 0px #166534;
}

.confirm-button:active {
    transform: translateY(0);
    box-shadow: 2px 2px 0px #166534;
}

/* PowerList Styles Adapted */
.controls-section {
    padding: 1.5rem;
    background: #fff;
    border-bottom: 2px solid #eee;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

@media(min-width: 768px) {
    .controls-section {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }
}

.filters-primary {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex: 1;
}

.filter-group {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
}

.filter-label {
    font-weight: bold;
    font-family: var(--font-comic, sans-serif);
}

.type-buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.filter-button {
    padding: 0.4rem 1rem;
    border: 2px solid var(--color-secondary, #000);
    background: white;
    font-family: var(--font-comic, sans-serif);
    cursor: pointer;
    font-weight: bold;
    border-radius: 20px;
    font-size: 0.9rem;
    transition: all 0.2s;
}

.filter-button.active {
    background: var(--color-secondary, #000);
    color: white;
}

.search-input {
    padding: 0.6rem 1rem;
    border: 2px solid var(--color-secondary, #000);
    border-radius: 8px;
    width: 100%;
    max-width: 300px;
}

.view-toggles {
    display: flex;
    gap: 0.5rem;
}

.view-button {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--color-secondary, #000);
    background: white;
    cursor: pointer;
    font-size: 1.2rem;
    border-radius: 8px;
}

.view-button.active {
    background: var(--color-secondary, #000);
    color: white;
}

/* Grid & Card Styles */
.powers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
}

.power-card {
    border: 2px solid var(--color-secondary, #000);
    padding: 1.2rem;
    background: white;
    box-shadow: 4px 4px 0px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
}

.power-card:hover {
    box-shadow: 6px 6px 0px rgba(0,0,0,0.15);
    transform: translateY(-2px);
}

.power-card.selected {
    background: #ecfdf5;
    border-color: #059669;
    box-shadow: 6px 6px 0px #059669;
}

.selected-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    background: #059669;
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
}

.power-card h3 {
    margin: 0;
    font-family: var(--font-comic, sans-serif);
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 0.5rem;
    font-size: 1.1rem;
    color: var(--color-primary, #000);
}

.power-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.power-cost {
    font-weight: bold;
    background: #f0f0f0;
    padding: 0.3rem 0.6rem;
    border-radius: 4px;
    align-self: flex-start;
    font-size: 0.85rem;
}

.power-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
}

.type-tag, .origin-tag {
    font-size: 0.7rem;
    padding: 0.2rem 0.5rem;
    border-radius: 12px;
    font-weight: 600;
    border: 1px solid #ccc;
    background: #eee;
}

.type-tag {
    background: #e3f2fd;
    border-color: #90caf9;
    color: #1565c0;
}

/* Table Styles */
.powers-table-wrapper {
    border: 2px solid var(--color-secondary, #000);
    border-radius: 8px;
    overflow: hidden;
    background: white;
}

.powers-table {
    width: 100%;
    border-collapse: collapse;
}

.powers-table th {
    background: var(--color-secondary, #000);
    color: white;
    padding: 0.8rem;
    text-align: left;
    font-family: var(--font-comic, sans-serif);
}

.powers-table td {
    padding: 0.8rem;
    border-bottom: 1px solid #eee;
    cursor: pointer;
}

.powers-table tr:hover {
    background: #f9f9f9;
}

.selected-row {
    background: #ecfdf5 !important;
}

.col-name {
    font-weight: bold;
}

.col-cost {
    font-family: var(--font-mono, monospace);
}
`;
