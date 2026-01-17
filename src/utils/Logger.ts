
/**
 * Centralized logging utility to control console output.
 * Allows enabling/disabling logs globally.
 */
class Logger {
    private static isEnabled = true;

    // Levels could be expanded, but for now we basically want On/Off
    static enable() {
        this.isEnabled = true;
        console.log('✅ Logger: Debug logs enabled');
    }

    static disable() {
        console.log('🚫 Logger: Debug logs disabled');
        this.isEnabled = false;
    }

    static log(...args: any[]) {
        if (this.isEnabled) {
            console.log(...args);
        }
    }

    static info(...args: any[]) {
        if (this.isEnabled) {
            console.info(...args);
        }
    }

    static warn(...args: any[]) {
        if (this.isEnabled) {
            console.warn(...args);
        }
    }

    // Errors are usually critical, so we might want to always show them,
    // or at least have a separate flag. For now, we'll respect the global flag
    // but maybe we should default to ALWAYS showing errors?
    // User asked to "activar y desactivarlos", usually referring to noise.
    // Errors are signal, not noise.
    // I will keep errors ALWAYS enabled for safely unless explicitly suppressed (not part of this requirement).
    // Actually, simply wrapping console.log is what was asked.
    // I'll add an error method that respects the flag just in case, but standard practice is to separate them.
    // But to keep it simple and fulfill "centralized method to activate/deactivate", I'll make error always generic console.error
    // OR create a `debugError` vs `systemError`.
    // Let's stick to safe defaults: Logger.log is for debug noise.
    
    static error(...args: any[]) {
        // Always log errors, or maybe toggle?
        // Let's assume user wants to silence "logs". Errors usually shouldn't be silenced.
        console.error(...args); 
    }

    static debug(...args: any[]) {
       if (this.isEnabled) {
            console.debug(...args);
       }
    }
}

export default Logger;
