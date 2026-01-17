/**
 * Utility to play dice roll sound effect using Web Audio API
 * Creates a realistic dice rolling sound with multiple bounces
 */

import Logger from './Logger';

let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext;
};

/**
 * Plays a dice roll sound effect
 * The sound simulates a dice bouncing and rolling on a surface
 */
export const playDiceRollSound = () => {
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;

        // Create multiple "bounce" sounds that decrease in intensity
        const bounces = [
            { time: 0, frequency: 200, duration: 0.05, volume: 0.6 },
            { time: 0.08, frequency: 180, duration: 0.04, volume: 0.5 },
            { time: 0.15, frequency: 160, duration: 0.035, volume: 0.4 },
            { time: 0.21, frequency: 150, duration: 0.03, volume: 0.3 },
            { time: 0.26, frequency: 140, duration: 0.025, volume: 0.2 },
            { time: 0.30, frequency: 130, duration: 0.02, volume: 0.1 },
        ];

        bounces.forEach(bounce => {
            // Create oscillator for the bounce sound
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            // Configure filter for a more realistic "thud" sound
            filter.type = 'lowpass';
            filter.frequency.value = 800;
            filter.Q.value = 1;

            // Configure oscillator
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(bounce.frequency, now + bounce.time);
            oscillator.frequency.exponentialRampToValueAtTime(
                bounce.frequency * 0.5,
                now + bounce.time + bounce.duration
            );

            // Configure volume envelope
            gainNode.gain.setValueAtTime(0, now + bounce.time);
            gainNode.gain.linearRampToValueAtTime(bounce.volume, now + bounce.time + 0.005);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + bounce.time + bounce.duration);

            // Connect nodes
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(ctx.destination);

            // Play the sound
            oscillator.start(now + bounce.time);
            oscillator.stop(now + bounce.time + bounce.duration);
        });

        // Add a subtle rolling/rattling sound
        const noiseBuffer = createNoiseBuffer(ctx, 0.15);
        const noiseSource = ctx.createBufferSource();
        const noiseGain = ctx.createGain();
        const noiseFilter = ctx.createBiquadFilter();

        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = 400;
        noiseFilter.Q.value = 2;

        noiseSource.buffer = noiseBuffer;
        noiseGain.gain.setValueAtTime(0, now);
        noiseGain.gain.linearRampToValueAtTime(0.15, now + 0.05);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        noiseSource.start(now);
        noiseSource.stop(now + 0.35);

    } catch (error) {
        Logger.warn('Could not play dice roll sound:', error);
    }
};

/**
 * Creates a noise buffer for the rolling sound effect
 */
const createNoiseBuffer = (ctx: AudioContext, duration: number): AudioBuffer => {
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    return buffer;
};
