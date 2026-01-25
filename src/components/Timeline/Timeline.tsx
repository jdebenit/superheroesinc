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

const getIcon = (iconName?: string) => {
    if (iconName === 'star') return <StarIcon />;
    if (iconName === 'skull') return <SkullIcon />;
    return undefined;
};

const getIconStyle = (iconName?: string) => {
    if (iconName === 'star') return { background: '#fbbf24', color: '#1a1a1a', boxShadow: 'none', border: '2px solid #1a1a1a' };
    if (iconName === 'skull') return { background: '#1a1a1a', color: '#f4f1e8', boxShadow: 'none', border: '2px solid #f4f1e8' };
    return { background: '#c41e3a', color: '#fff', boxShadow: 'none', border: '2px solid #1a1a1a' };
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
            if (event.tags) {
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
                            borderRadius: '0',
                            overflow: 'hidden', // Prevent overflow
                            display: 'flex',
                            flexDirection: 'column'
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
