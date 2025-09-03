// Configuration file for Portfolio Tracker
// This file contains configuration settings that should be customized per deployment

class Config {
    constructor() {
        // OpenAI Configuration
        this.openAIApiKey = null; // Set this to your OpenAI API key
        
        // You can set the API key here (NOT RECOMMENDED for production)
        // this.openAIApiKey = 'your-api-key-here';
        
        // Or prompt user to enter it
        this.promptForApiKey = true;
    }

    initializeOpenAI() {
        if (typeof openAIAssistant !== 'undefined') {
            if (this.openAIApiKey) {
                openAIAssistant.setApiKey(this.openAIApiKey);
                console.log('OpenAI API key configured successfully');
            } else if (this.promptForApiKey) {
                const apiKey = localStorage.getItem('openai_api_key');
                if (apiKey) {
                    openAIAssistant.setApiKey(apiKey);
                    console.log('OpenAI API key loaded from localStorage');
                } else {
                    this.showApiKeyPrompt();
                }
            }
        }
    }

    showApiKeyPrompt() {
        const apiKey = prompt(`
🤖 Para usar las funciones de IA, ingresa tu OpenAI API Key:

Puedes obtener una clave en: https://platform.openai.com/api-keys

La clave se guardará localmente en tu navegador.
        `.trim());

        if (apiKey && apiKey.trim()) {
            localStorage.setItem('openai_api_key', apiKey.trim());
            openAIAssistant.setApiKey(apiKey.trim());
            alert('✅ API Key configurada correctamente');
            console.log('OpenAI API key configured by user');
        } else {
            console.log('OpenAI API key configuration cancelled by user');
        }
    }

    clearStoredApiKey() {
        localStorage.removeItem('openai_api_key');
        if (typeof openAIAssistant !== 'undefined') {
            openAIAssistant.setApiKey(null);
        }
        console.log('OpenAI API key cleared');
    }
}

// Initialize global config
const config = new Config();

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => config.initializeOpenAI(), 1000);
    });
} else {
    setTimeout(() => config.initializeOpenAI(), 1000);
}