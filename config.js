// Configuration file for Portfolio Tracker
// This file contains configuration settings that should be customized per deployment

class Config {
    constructor() {
        // Allow configuration via env.js file
        const env = window.env || {};
        this.openAIApiKey = env.OPENAI_API_KEY || null;
        this.stockApiKey = env.STOCK_API_KEY || null;

        this.promptForApiKey = !this.openAIApiKey;
        this.promptForStockApiKey = !this.stockApiKey;
    }

    initializeOpenAI() {
        if (typeof openAIAssistant !== 'undefined') {
            const storedKey = sessionStorage.getItem('openai_api_key');
            const apiKey = this.openAIApiKey || storedKey;
            if (apiKey) {
                openAIAssistant.setApiKey(apiKey);
                console.log('OpenAI API key configured successfully');
            } else if (this.promptForApiKey) {
                this.showApiKeyPrompt();
            } else {
                console.warn('OpenAI API key not configured. AI features will be limited.');
            }
        }
    }

    initializeStockAPI() {
        const storedKey = sessionStorage.getItem('stock_api_key');
        const apiKey = this.stockApiKey || storedKey;
        if (apiKey) {
            this.stockApiKey = apiKey;
            console.log('Stock API key configured successfully');
        } else if (this.promptForStockApiKey) {
            this.showStockApiKeyPrompt();
        } else {
            console.warn('Stock API key not configured. Using estimated prices.');
        }
    }

    showApiKeyPrompt() {
        const apiKey = prompt(`
🤖 Para usar las funciones de IA, ingresa tu OpenAI API Key:

Puedes obtener una clave en: https://platform.openai.com/api-keys

La clave se mantendrá solo durante la sesión actual.
        `.trim());

        if (apiKey && apiKey.trim()) {
            sessionStorage.setItem('openai_api_key', apiKey.trim());
            openAIAssistant.setApiKey(apiKey.trim());
            alert('✅ API Key configurada correctamente');
            console.log('OpenAI API key configured by user');
        } else {
            console.log('OpenAI API key configuration cancelled by user');
        }
    }

    showStockApiKeyPrompt() {
        const apiKey = prompt(`
🔑 Para obtener precios en tiempo real, ingresa tu API Key de Alpha Vantage:

Puedes conseguir una clave gratuita en: https://www.alphavantage.co/support/#api-key

La clave se mantendrá solo durante la sesión actual.
        `.trim());

        if (apiKey && apiKey.trim()) {
            sessionStorage.setItem('stock_api_key', apiKey.trim());
            this.stockApiKey = apiKey.trim();
            alert('✅ Stock API Key configurada correctamente');
            console.log('Stock API key configured by user');
        } else {
            console.log('Stock API key configuration cancelled by user');
        }
    }

    clearStoredApiKey() {
        sessionStorage.removeItem('openai_api_key');
        if (typeof openAIAssistant !== 'undefined') {
            openAIAssistant.setApiKey(null);
        }
        console.log('OpenAI API key cleared');
    }

    clearStoredStockApiKey() {
        sessionStorage.removeItem('stock_api_key');
        this.stockApiKey = null;
        console.log('Stock API key cleared');
    }
}

// Initialize global config
const config = new Config();

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            config.initializeOpenAI();
            config.initializeStockAPI();
        }, 1000);
    });
} else {
    setTimeout(() => {
        config.initializeOpenAI();
        config.initializeStockAPI();
    }, 1000);
}