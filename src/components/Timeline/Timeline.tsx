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
        <div className="timeline-container w-full max-w-6xl mx-auto px-4 py-8">
            <div className="flex justify-center mb-8 gap-4 flex-wrap">
                {realities.map(reality => (
                    <button
                        key={reality}
                        onClick={() => setSelectedReality(reality)}
                        className={`px-4 py-2 rounded-full transition-all duration-300 ${selectedReality === reality
                                ? 'bg-primary-500 text-white shadow-lg scale-105'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                    >
                        {reality}
                    </button>
                ))}
            </div>

            <VerticalTimeline lineColor="#374151">
                {filteredEvents.map((event) => (
                    <VerticalTimelineElement
                        key={`${event.type}-${event.id}`}
                        className="vertical-timeline-element--work"
                        contentStyle={{ background: '#1f2937', color: '#fff', border: '1px solid #374151' }}
                        contentArrowStyle={{ borderRight: '7px solid  #1f2937' }}
                        date={event.date.toLocaleDateString()} // improved date formatting can be done here
                        iconStyle={{ background: '#3b82f6', color: '#fff' }}
                    // You can add custom icons here based on event.icon
                    >
                        <h3 className="vertical-timeline-element-title text-xl font-bold">{event.title}</h3>
                        <h4 className="vertical-timeline-element-subtitle text-sm text-gray-400 mt-1 capitalize">{event.type}</h4>
                        <div className="mt-4 text-gray-300">
                            <p>{event.description}</p>
                        </div>

                        {event.image && (
                            <img
                                src={event.image}
                                alt={event.title}
                                className="mt-4 rounded-lg w-full h-48 object-cover"
                            />
                        )}

                        {event.slug && (
                            <div className="mt-4">
                                <a
                                    href={`/lore/${event.slug}`} // Assuming 'lore' structure, might need adjustment
                                    className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                                >
                                    Read more
                                </a>
                            </div>
                        )}
                    </VerticalTimelineElement>
                ))}
            </VerticalTimeline>

            {filteredEvents.length === 0 && (
                <div className="text-center text-gray-400 mt-10">
                    No events found for this timeline reality.
                </div>
            )}
        </div>
    );
};
