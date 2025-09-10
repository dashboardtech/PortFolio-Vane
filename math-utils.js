// Math Utilities - Safe mathematical operations
class MathUtils {
    // Safe number formatting
    static formatNumber(num, decimals = 2) {
        if (typeof num !== 'number' || isNaN(num)) return 0;
        return Number(num.toFixed(decimals));
    }
    
    // Safe currency formatting
    static formatCurrency(num, currency = 'USD') {
        if (typeof num !== 'number' || isNaN(num)) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(num);
    }
    
    // Safe percentage formatting
    static formatPercentage(num, decimals = 2) {
        if (typeof num !== 'number' || isNaN(num)) return '0%';
        return `${this.formatNumber(num, decimals)}%`;
    }
    
    // Safe addition
    static add(a, b) {
        if (typeof a !== 'number' || typeof b !== 'number') return 0;
        return this.formatNumber(a + b);
    }
    
    // Safe subtraction
    static subtract(a, b) {
        if (typeof a !== 'number' || typeof b !== 'number') return 0;
        return this.formatNumber(a - b);
    }
    
    // Safe multiplication
    static multiply(a, b) {
        if (typeof a !== 'number' || typeof b !== 'number') return 0;
        return this.formatNumber(a * b);
    }
    
    // Safe division
    static divide(a, b) {
        if (typeof a !== 'number' || typeof b !== 'number' || b === 0) return 0;
        return this.formatNumber(a / b);
    }
    
    // Calculate percentage change
    static percentageChange(oldValue, newValue) {
        if (typeof oldValue !== 'number' || typeof newValue !== 'number' || oldValue === 0) return 0;
        return this.formatNumber(((newValue - oldValue) / oldValue) * 100);
    }
}

// Make available globally
window.MathUtils = MathUtils;
console.log('✅ Math Utils loaded');