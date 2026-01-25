import React, { useState, useMemo } from 'react';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';

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
    // Get unique realities from events, defaulting to 'Principal' if not found
    const realities = useMemo(() => {
        const allRealities = events.map(e => e.reality || 'Principal');
        return Array.from(new Set(allRealities)).sort();
    }, [events]);

    const [selectedRealities, setSelectedRealities] = useState<string[]>(realities.length > 0 ? [realities[0]] : ['Principal']);

    const toggleReality = (reality: string) => {
        setSelectedRealities(prev => {
            if (prev.includes(reality)) {
                return prev.filter(r => r !== reality);
            } else {
                return [...prev, reality];
            }
        });
    };

    const filteredEvents = useMemo(() => {
        return events.filter(e => selectedRealities.includes(e.reality || 'Principal'));
    }, [events, selectedRealities]);

    return (
        <div className="timeline-container w-full max-w-6xl mx-auto py-8">
            <div className="flex flex-col items-center mb-12 gap-4">
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
                            borderRadius: '0'
                        }}
                        contentArrowStyle={{ borderRight: '7px solid #fff' }}
                        date={event.date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        dateClassName="text-[#1a1a1a] font-bold font-mono"
                        iconStyle={getIconStyle(event.icon)}
                        icon={getIcon(event.icon)}
                    >
                        <h3 className="vertical-timeline-element-title text-xl font-bold uppercase tracking-tighter" style={{ fontFamily: "'Courier Prime', monospace", color: '#c41e3a' }}>
                            {event.title}
                        </h3>
                        {/* <h4 className="vertical-timeline-element-subtitle text-sm text-gray-500 mt-1 capitalize font-mono">{event.type}</h4> */}

                        <div className="mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider bg-[#1a1a1a] text-white px-2 py-0.5">
                                {event.reality || 'Principal'}
                            </span>
                        </div>

                        <div className="mt-4 text-[#1a1a1a] font-mono leading-relaxed">
                            <p>{event.description}</p>
                        </div>

                        {event.image && (
                            <div className="mt-4 border-2 border-[#1a1a1a] p-1 bg-white transform rotate-1 shadow-md">
                                <img
                                    src={event.image}
                                    alt={event.title}
                                    className="w-full h-48 object-cover filter sepia-[.3]"
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
                    -- [ SELECCIONE UNA REALIDAD PARA VISUALIZAR DATOS ] --
                </div>
            )}
        </div>
    );
};
