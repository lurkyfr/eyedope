// Session Manager - Secure session handling with browser fingerprinting
class SessionManager {
    constructor() {
        this.sessionKey = 'eyedope_session';
        this.fingerprintKey = 'eyedope_fingerprint';
        this.sessionsKey = 'eyedope_active_sessions';
        this.maxSessionsPerUser = 3;
        this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
    }

    // Generate browser fingerprint
    async generateFingerprint() {
        const components = [];
        
        // Screen info
        components.push(screen.width + 'x' + screen.height);
        components.push(screen.colorDepth);
        
        // Timezone
        components.push(new Date().getTimezoneOffset());
        
        // Languages
        components.push(navigator.languages ? navigator.languages.join(',') : navigator.language);
        
        // Platform
        components.push(navigator.platform);
        
        // User Agent
        components.push(navigator.userAgent);
        
        // Hardware concurrency
        components.push(navigator.hardwareConcurrency || 'unknown');
        
        // Device memory
        components.push(navigator.deviceMemory || 'unknown');
        
        // Canvas fingerprint
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px "Arial"';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('EyeDope Security', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText('Fingerprint Hash', 4, 17);
        components.push(canvas.toDataURL());
        
        // WebGL info
        try {
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    components.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
                    components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
                }
            }
        } catch (e) {
            components.push('webgl-error');
        }
        
        // Generate hash
        const fingerprint = await this.hashString(components.join('|||'));
        return fingerprint;
    }

    // Hash function using SubtleCrypto API
    async hashString(str) {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    // Display fingerprint (shortened for UI)
    getShortFingerprint(fingerprint) {
        return fingerprint.substring(0, 8).toUpperCase() + '...' + fingerprint.substring(fingerprint.length - 8).toUpperCase();
    }

    // Generate session ID
    generateSessionId() {
        return Date.now() + '-' + Math.random().toString(36).substring(2, 15);
    }

    // Get all active sessions
    getAllSessions() {
        try {
            const sessions = localStorage.getItem(this.sessionsKey);
            return sessions ? JSON.parse(sessions) : {};
        } catch (e) {
            console.error('Error getting sessions:', e);
            return {};
        }
    }

    // Save all sessions
    saveSessions(sessions) {
        try {
            localStorage.setItem(this.sessionsKey, JSON.stringify(sessions));
        } catch (e) {
            console.error('Error saving sessions:', e);
        }
    }

    // Clean expired sessions
    cleanExpiredSessions(userId) {
        const sessions = this.getAllSessions();
        if (!sessions[userId]) return;

        const now = Date.now();
        sessions[userId] = sessions[userId].filter(session => {
            return (now - session.timestamp) < this.sessionTimeout;
        });

        if (sessions[userId].length === 0) {
            delete sessions[userId];
        }

        this.saveSessions(sessions);
    }

    // Check if user has too many sessions
    hasMaxSessions(userId) {
        this.cleanExpiredSessions(userId);
        const sessions = this.getAllSessions();
        return sessions[userId] && sessions[userId].length >= this.maxSessionsPerUser;
    }

    // Get active session count for user
    getActiveSessionCount(userId) {
        this.cleanExpiredSessions(userId);
        const sessions = this.getAllSessions();
        return sessions[userId] ? sessions[userId].length : 0;
    }

    // Create new session
    async createSession(userId, fingerprint) {
        // Check max sessions
        if (this.hasMaxSessions(userId)) {
            // Remove oldest session
            const sessions = this.getAllSessions();
            sessions[userId].sort((a, b) => a.timestamp - b.timestamp);
            sessions[userId].shift();
            this.saveSessions(sessions);
        }

        const sessionId = this.generateSessionId();
        const session = {
            userId: userId,
            sessionId: sessionId,
            fingerprint: fingerprint,
            timestamp: Date.now(),
            lastActivity: Date.now()
        };

        // Save current session
        localStorage.setItem(this.sessionKey, JSON.stringify(session));
        
        // Add to all sessions
        const allSessions = this.getAllSessions();
        if (!allSessions[userId]) {
            allSessions[userId] = [];
        }
        allSessions[userId].push({
            sessionId: sessionId,
            fingerprint: fingerprint,
            timestamp: Date.now()
        });
        this.saveSessions(allSessions);

        return session;
    }

    // Get current session
    getCurrentSession() {
        try {
            const session = localStorage.getItem(this.sessionKey);
            if (!session) return null;
            
            const sessionData = JSON.parse(session);
            
            // Check if session expired
            if (Date.now() - sessionData.timestamp > this.sessionTimeout) {
                this.destroySession();
                return null;
            }
            
            // Update last activity
            sessionData.lastActivity = Date.now();
            localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
            
            return sessionData;
        } catch (e) {
            console.error('Error getting current session:', e);
            return null;
        }
    }

    // Validate session with fingerprint
    async validateSession() {
        const session = this.getCurrentSession();
        if (!session) return false;

        const currentFingerprint = await this.generateFingerprint();
        
        // Check if fingerprint matches
        if (session.fingerprint !== currentFingerprint) {
            console.warn('Fingerprint mismatch - possible session hijacking attempt');
            this.destroySession();
            return false;
        }

        return true;
    }

    // Destroy current session
    destroySession() {
        const session = this.getCurrentSession();
        if (session) {
            // Remove from all sessions
            const allSessions = this.getAllSessions();
            if (allSessions[session.userId]) {
                allSessions[session.userId] = allSessions[session.userId].filter(
                    s => s.sessionId !== session.sessionId
                );
                if (allSessions[session.userId].length === 0) {
                    delete allSessions[session.userId];
                }
                this.saveSessions(allSessions);
            }
        }
        
        // Clear current session
        localStorage.removeItem(this.sessionKey);
    }

    // Get stored fingerprint
    getStoredFingerprint() {
        return localStorage.getItem(this.fingerprintKey);
    }

    // Store fingerprint
    storeFingerprint(fingerprint) {
        localStorage.setItem(this.fingerprintKey, fingerprint);
    }
}

// Initialize global session manager
const sessionManager = new SessionManager();