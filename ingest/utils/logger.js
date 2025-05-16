const levels = ['info', 'warn', 'error'];

export function log(level, message, data = {}) {
    if (!levels.includes(level)) level = 'info';
    const timestamp = new Date().toISOString();
    const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    if (Object.keys(data).length > 0) {
        console.log(base, JSON.stringify(data));
    } else {
        console.log(base);
    }
}

export const logger = {
    info: (msg, data) => log('info', msg, data),
    warn: (msg, data) => log('warn', msg, data),
    error: (msg, data) => log('error', msg, data),
};
