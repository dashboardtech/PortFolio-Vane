// Error Handler - Centralized error handling and logging
class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 100;
        this.setupGlobalErrorHandlers();
    }
    
    setupGlobalErrorHandlers() {
        // Catch unhandled JavaScript errors
        window.addEventListener('error', (event) => {
            this.logError({
                type: 'javascript',
                message: event.message,
                source: event.filename,
                line: event.lineno,
                column: event.colno,
                error: event.error
            });
        });
        
        // Catch unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                type: 'promise',
                message: event.reason?.message || 'Unhandled promise rejection',
                reason: event.reason
            });
        });
    }
    
    logError(errorInfo) {
        const errorEntry = {
            timestamp: new Date().toISOString(),
            id: this.generateErrorId(),
            ...errorInfo
        };
        
        this.errors.unshift(errorEntry);
        
        // Keep only the most recent errors
        if (this.errors.length > this.maxErrors) {
            this.errors = this.errors.slice(0, this.maxErrors);
        }
        
        console.error('🚨 Error logged:', errorEntry);
        
        // Show user-friendly notification for critical errors
        if (this.isCriticalError(errorInfo)) {
            this.showErrorNotification(errorInfo);
        }
    }
    
    generateErrorId() {
        return 'err_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    isCriticalError(errorInfo) {
        const criticalKeywords = ['api', 'network', 'fetch', 'storage', 'auth'];
        const message = (errorInfo.message || '').toLowerCase();
        return criticalKeywords.some(keyword => message.includes(keyword));
    }
    
    showErrorNotification(errorInfo) {
        const message = this.getErrorMessage(errorInfo);
        this.showNotification(message, 'error');
    }
    
    getErrorMessage(errorInfo) {
        if (errorInfo.message?.includes('fetch')) {
            return '❌ Error de conexión. Verifica tu conexión a internet.';
        }
        if (errorInfo.message?.includes('api')) {
            return '❌ Error en API. Verifica tu configuración.';
        }
        if (errorInfo.message?.includes('storage')) {
            return '❌ Error de almacenamiento. Verifica el espacio disponible.';
        }
        return '❌ Ha ocurrido un error inesperado.';
    }
    
    showNotification(message, type = 'error') {
        const notification = document.createElement('div');
        notification.className = `error-notification error-notification-${type}`;
        notification.textContent = message;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            zIndex: '10000',
            maxWidth: '350px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontSize: '14px',
            backgroundColor: '#dc3545'
        });
        
        notification.style.transform = 'translateX(100%)';
        notification.style.transition = 'transform 0.3s ease-out';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }
    
    // Handle API errors specifically
    handleApiError(error, apiName = 'API') {
        let message;
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            message = `Error de red conectando a ${apiName}`;
        } else if (error.status === 401) {
            message = `API key inválida para ${apiName}`;
        } else if (error.status === 403) {
            message = `Acceso denegado a ${apiName}`;
        } else if (error.status === 429) {
            message = `Límite de requests alcanzado para ${apiName}`;
        } else if (error.status >= 500) {
            message = `Error del servidor en ${apiName}`;
        } else {
            message = `Error en ${apiName}: ${error.message || 'Unknown error'}`;
        }
        
        this.logError({
            type: 'api',
            message: message,
            apiName: apiName,
            status: error.status,
            error: error
        });
        
        return message;
    }
    
    // Get recent errors for debugging
    getRecentErrors(limit = 10) {
        return this.errors.slice(0, limit);
    }
    
    // Clear error log
    clearErrors() {
        this.errors = [];
        console.log('✅ Error log cleared');
    }
    
    // Export errors for support
    exportErrorLog() {
        const errorData = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            errors: this.errors
        };
        
        const dataStr = JSON.stringify(errorData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `error-log-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }
}

// Initialize error handler
const errorHandler = new ErrorHandler();

// Make available globally
window.errorHandler = errorHandler;
console.log('✅ Error Handler loaded');