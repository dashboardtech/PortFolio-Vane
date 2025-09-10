// Security Utilities - Input validation and sanitization
class SecurityUtils {
    // Sanitize HTML input to prevent XSS
    static sanitizeHTML(str) {
        if (typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
    
    // Validate email format
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Validate ticker symbol
    static validateTicker(ticker) {
        if (typeof ticker !== 'string') return false;
        const tickerRegex = /^[A-Z]{1,5}(\.[A-Z]{1,2})?$/;
        return tickerRegex.test(ticker.toUpperCase());
    }
    
    // Validate API key format
    static validateApiKey(key, type = 'openai') {
        if (typeof key !== 'string' || !key.trim()) return false;
        
        switch (type.toLowerCase()) {
            case 'openai':
                return key.startsWith('sk-') && key.length > 10;
            case 'alpha':
                return key.length >= 8 && /^[A-Z0-9]+$/.test(key);
            default:
                return key.length > 5;
        }
    }
    
    // Validate numeric input
    static validateNumber(value, min = null, max = null) {
        const num = parseFloat(value);
        if (isNaN(num)) return false;
        if (min !== null && num < min) return false;
        if (max !== null && num > max) return false;
        return true;
    }
    
    // Escape special characters for safe display
    static escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
    
    // Rate limiting helper
    static createRateLimiter(maxRequests, windowMs) {
        const requests = new Map();
        
        return function(key = 'default') {
            const now = Date.now();
            const windowStart = now - windowMs;
            
            if (!requests.has(key)) {
                requests.set(key, []);
            }
            
            const userRequests = requests.get(key);
            const validRequests = userRequests.filter(time => time > windowStart);
            
            if (validRequests.length >= maxRequests) {
                return false;
            }
            
            validRequests.push(now);
            requests.set(key, validRequests);
            return true;
        };
    }
}

// Make available globally
window.SecurityUtils = SecurityUtils;
console.log('✅ Security Utils loaded');