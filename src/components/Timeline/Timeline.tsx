import React, { useState, useMemo } from 'react';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import ListControls from '../shared/ListControls';

export interface TimelineEvent {
    id: string;
    title: string;
    date: Date;
    description: string;
    reality: string;
    type: 'lore' | 'timeline';
    image?: string;
    icon?: string;
    slug?: string;
    displayDate?: string;
    tags?: string[];
    characterSlug?: string;
}

interface TimelineProps {
    events: TimelineEvent[];
}

const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
    </svg>
);

const SkullIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M12 2C7.589 2 4 5.589 4 10a9.98 9.98 0 002.583 6.643 7.828 7.828 0 011.696 2.336L8.83 21h6.34l.551-2.021a7.828 7.828 0 011.696-2.336A9.98 9.98 0 0020 10c0-4.411-3.589-8-8-8zm4.339 12.012A9.308 9.308 0 0018 10c0-3.309-2.691-6-6-6s-6 2.691-6 6c0 1.536.577 2.94 1.661 4.012.052.051.109.096.155.152.613.722 1.348 1.954 1.624 2.964l.115.421h3.89l.115-.421c.276-1.01 1.011-2.242 1.624-2.964.047-.056.103-.101.155-.152zM9 11a1 1 0 110-2 1 1 0 010 2zm6 0a1 1 0 110-2 1 1 0 010 2z" />
    </svg>
);

const BattleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
        <path d="M14.5 10.5l-5 5m5-5l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const MagicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M10.5 2a.75.75 0 01.75.75v5.25H16a.75.75 0 010 1.5h-4.75V15a.75.75 0 01-1.5 0v-5.25H4.5a.75.75 0 010-1.5h5.25V2.75A.75.75 0 0110.5 2z" clipRule="evenodd" />
        <path d="M12.5 7.5L14 4l1.5 3.5L19 9l-3.5 1.5L14 14l-1.5-3.5L9 9l3.5-1.5z" />
    </svg>
);

const TechIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm14.25 6a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5h2.25a.75.75 0 0 1 .75.75Zm-8.25-.75a.75.75 0 0 0 0 1.5h2.25a.75.75 0 0 0 0-1.5H9Z" clipRule="evenodd" />
    </svg>
);

const ShieldIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.352-.272-2.636-.759-3.801a.754.754 0 0 0-.719-.515 11.21 11.21 0 0 1-7.877-3.08ZM12 4.296A12.68 12.68 0 0 0 17.585 6.01 11.264 11.264 0 0 1 12 19.863 11.264 11.264 0 0 1 6.415 6.01 12.68 12.68 0 0 0 12 4.296Z" clipRule="evenodd" />
    </svg>
);

const DealIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z" clipRule="evenodd" />
    </svg>
);

const PortalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-2.625 6c-.54 0-.828.419-.936.634a6.765 6.765 0 0 0-.165 2.616 2.625 2.625 0 0 1-5.25 0 9.75 9.75 0 0 1 16.125 0 2.625 2.625 0 0 1-5.25 0 6.765 6.765 0 0 0-.165-2.616c-.108-.215-.396-.634-.936-.634.54 0 .936.419 1.044.634.053.106.082.213.1.316l.243 1.282a5.75 5.75 0 0 1-3.236 6.13l-.41.173a.855.855 0 0 1-.72 0l-.41-.173a5.75 5.75 0 0 1-3.236-6.13l.243-1.282c.018-.103.047-.21.1-.316.108-.215.504-.634 1.044-.634Z" clipRule="evenodd" />
    </svg>
);

const CharacterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
    </svg>
);

const getIcon = (iconName?: string) => {
    switch (iconName) {
        case 'star': return <StarIcon />;
        case 'skull': return <SkullIcon />;
        case 'battle': return <BattleIcon />;
        case 'magic': return <MagicIcon />;
        case 'tech': return <TechIcon />;
        case 'shield': return <ShieldIcon />;
        case 'deal': return <DealIcon />;
        case 'portal': return <PortalIcon />;
        case 'character': return <CharacterIcon />;
        default: return <StarIcon />; // Default to star instead of undefined to ensure icon presence
    }
};

const getIconStyle = (iconName?: string) => {
    const baseStyle = { color: '#fff', boxShadow: 'none', border: '2px solid #1a1a1a' };

    switch (iconName) {
        case 'star':
            return { ...baseStyle, background: '#fbbf24', color: '#1a1a1a' };
        case 'skull':
            return { ...baseStyle, background: '#1a1a1a', color: '#f4f1e8', border: '2px solid #f4f1e8' };
        case 'battle':
            return { ...baseStyle, background: '#dc2626' }; // Red
        case 'magic':
            return { ...baseStyle, background: '#9333ea' }; // Purple
        case 'tech':
            return { ...baseStyle, background: '#0891b2' }; // Cyan
        case 'shield':
            return { ...baseStyle, background: '#1e3a8a' }; // Dark Blue
        case 'deal':
            return { ...baseStyle, background: '#16a34a' }; // Green
        case 'portal':
            return { ...baseStyle, background: '#c026d3' }; // Magenta
        case 'character':
            return { ...baseStyle, background: '#f97316' }; // Orange
        default:
            return { ...baseStyle, background: '#c41e3a' }; // Default Red
    }
};

export const Timeline: React.FC<TimelineProps> = ({ events }) => {
    const [selectedTags, setSelectedTags] = useState<string[]>(["Todos"]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    // Get unique realities from events, defaulting to 'Principal' if not found
    const realities = useMemo(() => {
        const allRealities = events.map(e => e.reality || 'Principal');
        return Array.from(new Set(allRealities)).sort();
    }, [events]);

    const [selectedRealities, setSelectedRealities] = useState<string[]>(() => {
        if (realities.includes('Tierra Zero')) return ['Tierra Zero'];
        return realities.length > 0 ? [realities[0]] : ['Principal'];
    });

    const toggleReality = (reality: string) => {
        setSelectedRealities(prev => {
            if (prev.includes(reality)) {
                return prev.filter(r => r !== reality);
            } else {
                return [...prev, reality];
            }
        });
    };

    // Extract unique tags
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        events.forEach(event => {
            if (event.tags && !event.characterSlug) {
                event.tags.forEach(tag => tags.add(tag));
            }
        });
        return ["Todos", ...Array.from(tags).sort()];
    }, [events]);

    const toggleTag = (tag: string) => {
        if (tag === "Todos") {
            setSelectedTags(["Todos"]);
            return;
        }

        let newTags = [...selectedTags];
        if (newTags.includes("Todos")) {
            newTags = [];
        }

        if (newTags.includes(tag)) {
            newTags = newTags.filter(t => t !== tag);
        } else {
            newTags.push(tag);
        }

        if (newTags.length === 0) {
            newTags = ["Todos"];
        }

        setSelectedTags(newTags);
    };

    const filteredEvents = useMemo(() => {
        return events.filter(e => {
            // Reality Filter
            const matchesReality = selectedRealities.includes(e.reality || 'Principal');
            if (!matchesReality) return false;

            // Tag Filter
            const eventTags = e.tags || [];
            const matchesTags = selectedTags.includes("Todos") || selectedTags.some(tag => eventTags.includes(tag));
            if (!matchesTags) return false;

            // Date Range Filter
            if (startDate) {
                const start = new Date(startDate);
                if (e.date < start) return false;
            }
            if (endDate) {
                const end = new Date(endDate);
                if (e.date > end) return false;
            }

            // Search
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                const titleMatch = e.title.toLowerCase().includes(searchLower);
                const descMatch = e.description.toLowerCase().includes(searchLower);
                if (!titleMatch && !descMatch) return false;
            }

            return true;
        });
    }, [events, selectedRealities, selectedTags, startDate, endDate, searchTerm]);

    return (
        <div className="timeline-container w-full max-w-6xl mx-auto py-8">
            <div className="flex flex-col items-center mb-8 gap-4">
                <div className="flex justify-center gap-4 flex-wrap">
                    {realities.map(reality => (
                        <button
                            key={reality}
                            onClick={() => toggleReality(reality)}
                            className={`comic-button text-sm transition-all duration-200 ${selectedRealities.includes(reality)
                                ? 'bg-[#1a1a1a] text-white shadow-lg transform -translate-y-1'
                                : 'bg-transparent text-[#1a1a1a] opacity-60 hover:opacity-100'
                                }`}
                        >
                            {selectedRealities.includes(reality) ? '[x]' : '[ ]'} {reality}
                        </button>
                    ))}
                </div>
            </div>

            <ListControls
                search={{
                    value: searchTerm,
                    onChange: setSearchTerm,
                    placeholder: "Buscar eventos..."
                }}
                filters={allTags.length > 1 ? [{
                    label: "Filtrar por etiquetas:",
                    options: allTags,
                    selected: selectedTags,
                    onToggle: toggleTag
                }] : []}
            >
                <div className="date-filters flex flex-wrap items-center gap-4 bg-white p-3 border-2 border-[#1a1a1a] shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
                    <span className="font-bold font-mono uppercase text-sm tracking-wider text-[#c41e3a]">Rango Temporal:</span>

                    <div className="flex items-center gap-2 bg-[#f4f4f4] p-1 px-2 border border-[#ccc]">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent border-none p-1 font-mono text-sm focus:ring-0 outline-none text-[#1a1a1a]"
                            title="Fecha Inicio"
                        />
                        <span className="text-gray-400 font-bold">→</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent border-none p-1 font-mono text-sm focus:ring-0 outline-none text-[#1a1a1a]"
                            title="Fecha Fin"
                        />
                    </div>

                    {(startDate || endDate) && (
                        <button
                            onClick={() => { setStartDate(""); setEndDate(""); }}
                            className="text-xs bg-[#c41e3a] text-white px-2 py-1 uppercase font-bold tracking-wider hover:bg-[#a01830] transition-colors border border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none"
                        >
                            Limpiar
                        </button>
                    )}
                </div>
            </ListControls>

            <VerticalTimeline lineColor="#1a1a1a">
                {filteredEvents.map((event) => (
                    <VerticalTimelineElement
                        key={`${event.type}-${event.id}`}
                        className="vertical-timeline-element--work"
                        contentStyle={{
                            background: '#fff',
                            color: '#1a1a1a',
                            border: '1px solid #d3d0c2',
                            boxShadow: '2px 2px 0 rgba(0, 0, 0, 0.1)',
                        }}
                        contentArrowStyle={{ borderRight: '7px solid #fff' }}
                        date={event.displayDate || event.date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        dateClassName="text-[#1a1a1a] font-bold font-mono"
                        iconStyle={getIconStyle(event.icon)}
                        icon={getIcon(event.icon)}
                    >
                        <h3 className="vertical-timeline-element-title" style={{
                            fontFamily: "'Courier Prime', monospace",
                            color: '#c41e3a',
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '-0.05em',
                            wordBreak: 'break-word',
                            marginBottom: '0.5rem'
                        }}>
                            {event.title}
                        </h3>
                        {/* <h4 className="vertical-timeline-element-subtitle text-sm text-gray-500 mt-1 capitalize font-mono">{event.type}</h4> */}

                        <div style={{ marginBottom: '0.5rem' }}>
                            <span style={{
                                display: 'inline-block',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                backgroundColor: '#1a1a1a',
                                color: 'white',
                                padding: '0.25rem 0.5rem',
                                marginBottom: '0.5rem'
                            }}>
                                {event.reality || 'Tierra Zero'}
                            </span>

                            {event.tags && event.tags.length > 0 && (
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '0.75rem',
                                    marginTop: '0.25rem'
                                }}>
                                    {event.tags.map(tag => (
                                        <span key={tag} style={{
                                            display: 'inline-block',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.025em',
                                            backgroundColor: '#e5e5e5',
                                            color: '#1a1a1a',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '9999px',
                                            border: '1px solid #d4d4d4'
                                        }}>
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{
                            marginTop: '1rem',
                            color: '#1a1a1a',
                            fontFamily: 'monospace',
                            lineHeight: '1.625',
                            wordBreak: 'break-word',
                            textAlign: 'justify'
                        }}>
                            <p>{event.description}</p>
                        </div>

                        {event.image && (
                            <div style={{
                                marginTop: '1rem',
                                border: '2px solid #1a1a1a',
                                padding: '4px',
                                backgroundColor: 'white',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                width: '100%',
                                maxWidth: '100%',
                                overflow: 'hidden',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <img
                                    src={event.image}
                                    alt={event.title}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '400px',
                                        width: 'auto',
                                        height: 'auto',
                                        display: 'block',
                                        filter: 'sepia(0.3)'
                                    }}
                                />
                            </div>
                        )}

                        {event.slug && (
                            <div className="mt-6 text-right">
                                <a
                                    href={`/lore/${event.slug}`}
                                    className="text-[#c41e3a] hover:text-[#8a1529] uppercase font-bold text-sm tracking-widest border-b-2 border-[#c41e3a] pb-1 hover:pb-2 transition-all"
                                >
                                    VER ARCHIVO &rarr;
                                </a>
                            </div>
                        )}

                        {event.characterSlug && (
                            <div className="mt-6 text-right">
                                <a
                                    href={`/personajes/${event.characterSlug}`}
                                    className="text-[#c41e3a] hover:text-[#8a1529] uppercase font-bold text-sm tracking-widest border-b-2 border-[#c41e3a] pb-1 hover:pb-2 transition-all"
                                >
                                    VER PERFIL &rarr;
                                </a>
                            </div>
                        )}

                        {/* Stamp effect if needed */}
                        <div className="absolute top-2 right-2 opacity-10 pointer-events-none transform -rotate-12 border-2 border-red-800 p-1 text-xs font-bold text-red-800 uppercase">
                            CONFIDENTIAL
                        </div>
                    </VerticalTimelineElement>
                ))}
            </VerticalTimeline>

            {filteredEvents.length === 0 && (
                <div className="text-center text-gray-500 mt-10 font-mono italic">
                    -- [ NO SE ENCONTRARON EVENTOS CON ESTOS CRITERIOS ] --
                </div>
            )}
        </div>
    );
};
