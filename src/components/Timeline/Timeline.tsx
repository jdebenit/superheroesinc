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

export const Timeline: React.FC<TimelineProps> = ({ events }) => {
    // Get unique realities from events, defaulting to 'Principal' if not found
    const realities = useMemo(() => {
        const allRealities = events.map(e => e.reality || 'Principal');
        return Array.from(new Set(allRealities)).sort();
    }, [events]);

    const [selectedReality, setSelectedReality] = useState<string>(realities[0] || 'Principal');

    const filteredEvents = useMemo(() => {
        return events.filter(e => (e.reality || 'Principal') === selectedReality);
    }, [events, selectedReality]);

    return (
        <div className="timeline-container w-full max-w-6xl mx-auto py-8">
            <div className="flex justify-center mb-12 gap-4 flex-wrap">
                {realities.map(reality => (
                    <button
                        key={reality}
                        onClick={() => setSelectedReality(reality)}
                        className={`comic-button text-sm ${selectedReality === reality
                            ? 'bg-[#1a1a1a] text-white'
                            : ''
                            }`}
                    >
                        {reality}
                    </button>
                ))}
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
                        iconStyle={{ background: '#c41e3a', color: '#fff', boxShadow: 'none', border: '2px solid #1a1a1a' }}
                    // You can add custom icons here based on event.icon
                    >
                        <h3 className="vertical-timeline-element-title text-xl font-bold uppercase tracking-tighter" style={{ fontFamily: "'Courier Prime', monospace", color: '#c41e3a' }}>
                            {event.title}
                        </h3>
                        {/* <h4 className="vertical-timeline-element-subtitle text-sm text-gray-500 mt-1 capitalize font-mono">{event.type}</h4> */}

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
                    -- [ DATOS ELIMINADOS ] --
                </div>
            )}
        </div>
    );
};
