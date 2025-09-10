// Settings Manager - Comprehensive Application Configuration
class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
        this.defaultSettings = {
            // API Configuration
            openaiApiKey: '',
            apiModel: 'gpt-4',
            alphaVantageApiKey: '',
            
            // Display Preferences
            darkMode: false,
            showDecimals: true,
            currency: 'USD',
            
            // Data & Updates
            refreshInterval: 60, // seconds
            autoSave: true,
            dataSource: 'simulated',
            
            // Notifications
            priceAlerts: false,
            portfolioAlerts: false,
            alertThreshold: 5,
            
            // Advanced
            debugMode: false,
            version: '2.0.0'
        };
        
        this.init();
    }
    
    init() {
        console.log('🔧 Initializing Settings Manager...');
        this.setupEventListeners();
        this.loadSettingsToUI();
        this.applySettings();
        console.log('✅ Settings Manager initialized');
    }
    
    setupEventListeners() {
        // API Key visibility toggles
        const toggleApiKey = document.getElementById('toggleApiKeyVisibility');
        const toggleAlphaApiKey = document.getElementById('toggleAlphaApiKeyVisibility');
        
        if (toggleApiKey) {
            toggleApiKey.addEventListener('click', () => this.togglePasswordVisibility('openaiApiKey'));
        }
        
        if (toggleAlphaApiKey) {
            toggleAlphaApiKey.addEventListener('click', () => this.togglePasswordVisibility('alphaVantageApiKey'));
        }
        
        // Save buttons
        const saveApiKey = document.getElementById('saveApiKey');
        const saveAlphaApiKey = document.getElementById('saveAlphaApiKey');
        const testAlphaApiKey = document.getElementById('testAlphaApiKey');
        
        if (saveApiKey) {
            saveApiKey.addEventListener('click', () => this.saveApiKey('openai'));
        }
        
        if (saveAlphaApiKey) {
            saveAlphaApiKey.addEventListener('click', () => this.saveApiKey('alpha'));
        }
        
        if (testAlphaApiKey) {
            testAlphaApiKey.addEventListener('click', () => this.testAlphaVantageApi());
        }
        
        // Settings form elements
        this.setupSettingsListeners();
        
        // Action buttons
        const clearCache = document.getElementById('clearCache');
        const clearData = document.getElementById('clearData');
        const exportData = document.getElementById('exportData');
        const importData = document.getElementById('importData');
        const saveAllSettings = document.getElementById('saveAllSettings');
        const resetSettings = document.getElementById('resetSettings');
        
        if (clearCache) clearCache.addEventListener('click', () => this.clearCache());
        if (clearData) clearData.addEventListener('click', () => this.clearAllData());
        if (exportData) exportData.addEventListener('click', () => this.exportData());
        if (importData) importData.addEventListener('click', () => this.importData());
        if (saveAllSettings) saveAllSettings.addEventListener('click', () => this.saveAllSettings());
        if (resetSettings) resetSettings.addEventListener('click', () => this.resetToDefaults());
    }
    
    setupSettingsListeners() {
        // Auto-save for most settings
        const settingsInputs = [
            'apiModel', 'darkMode', 'showDecimals', 'currency',
            'refreshInterval', 'autoSave', 'dataSource',
            'priceAlerts', 'portfolioAlerts', 'alertThreshold'
        ];
        
        settingsInputs.forEach(settingId => {
            const element = document.getElementById(settingId);
            if (element) {
                element.addEventListener('change', () => {
                    this.updateSetting(settingId, this.getElementValue(element));
                    if (this.settings.autoSave) {
                        this.saveSettings();
                    }
                });
            }
        });
    }
    
    getElementValue(element) {
        if (element.type === 'checkbox') {
            return element.checked;
        } else if (element.type === 'number') {
            return parseFloat(element.value);
        } else {
            return element.value;
        }
    }
    
    togglePasswordVisibility(fieldId) {
        const field = document.getElementById(fieldId);
        const button = document.getElementById(fieldId === 'openaiApiKey' ? 'toggleApiKeyVisibility' : 'toggleAlphaApiKeyVisibility');
        
        if (field && button) {
            if (field.type === 'password') {
                field.type = 'text';
                button.textContent = '🙈';
            } else {
                field.type = 'password';
                button.textContent = '👁️';
            }
        }
    }
    
    saveApiKey(type) {
        const fieldId = type === 'openai' ? 'openaiApiKey' : 'alphaVantageApiKey';
        const field = document.getElementById(fieldId);
        
        if (field && field.value.trim()) {
            // Basic validation
            if (type === 'openai' && !field.value.startsWith('sk-')) {
                this.showNotification('⚠️ La API key de OpenAI debe comenzar con "sk-"', 'warning');
                return;
            }
            
            // Encrypt and save
            const encryptedKey = this.encryptApiKey(field.value.trim());
            this.updateSetting(fieldId, encryptedKey);
            this.saveSettings();
            
            // Clear field for security
            field.value = '••••••••••••••••';
            
            this.showNotification('✅ API Key guardada correctamente', 'success');
            
            // Initialize AI if OpenAI key was saved
            if (type === 'openai' && typeof window.advancedAI !== 'undefined') {
                window.advancedAI.setApiKey(this.decryptApiKey(encryptedKey));
            }
        } else {
            this.showNotification('⚠️ Por favor ingresa una API key válida', 'warning');
        }
    }
    
    encryptApiKey(key) {
        // Simple base64 encoding (not secure, but better than plain text)
        // In production, use proper encryption
        return btoa(key);
    }
    
    decryptApiKey(encryptedKey) {
        try {
            return atob(encryptedKey);
        } catch (error) {
            console.error('Error decrypting API key:', error);
            return '';
        }
    }
    
    async testAlphaVantageApi() {
        const apiKey = document.getElementById('alphaVantageApiKey').value;
        const statusDiv = document.getElementById('alphaApiStatus');
        
        if (!apiKey || apiKey === '••••••••••••••••') {
            this.showNotification('⚠️ Primero guarda tu API key de Alpha Vantage', 'warning');
            return;
        }
        
        if (statusDiv) {
            statusDiv.innerHTML = '<div class="testing">🔍 Probando conexión...</div>';
        }
        
        try {
            const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${apiKey}`);
            const data = await response.json();
            
            if (data['Global Quote']) {
                if (statusDiv) {
                    statusDiv.innerHTML = '<div class="success">✅ Conexión exitosa</div>';
                }
                this.showNotification('✅ Alpha Vantage API funcionando correctamente', 'success');
            } else if (data['Error Message']) {
                throw new Error(data['Error Message']);
            } else if (data['Information']) {
                throw new Error('Rate limit reached');
            } else {
                throw new Error('Invalid response');
            }
        } catch (error) {
            console.error('Alpha Vantage API test failed:', error);
            if (statusDiv) {
                statusDiv.innerHTML = '<div class="error">❌ Error en la conexión</div>';
            }
            this.showNotification('❌ Error probando Alpha Vantage API: ' + error.message, 'error');
        }
    }
    
    updateSetting(key, value) {
        this.settings[key] = value;
        console.log(`Setting updated: ${key} = ${value}`);
        this.applySettings();
    }
    
    applySettings() {
        // Apply dark mode
        if (this.settings.darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        // Apply other settings as needed
        this.applyRefreshInterval();
    }
    
    applyRefreshInterval() {
        // Clear existing interval
        if (window.portfolioRefreshInterval) {
            clearInterval(window.portfolioRefreshInterval);
        }
        
        // Set new interval if not manual
        if (this.settings.refreshInterval > 0) {
            window.portfolioRefreshInterval = setInterval(() => {
                if (typeof portfolio !== 'undefined' && portfolio.fetchAllData) {
                    portfolio.fetchAllData();
                }
            }, this.settings.refreshInterval * 1000);
        }
    }
    
    loadSettingsToUI() {
        // Load API keys (show placeholder if exists)
        const openaiField = document.getElementById('openaiApiKey');
        const alphaField = document.getElementById('alphaVantageApiKey');
        
        if (openaiField && this.settings.openaiApiKey) {
            openaiField.value = '••••••••••••••••';
        }
        
        if (alphaField && this.settings.alphaVantageApiKey) {
            alphaField.value = '••••••••••••••••';
        }
        
        // Load other settings
        Object.keys(this.defaultSettings).forEach(key => {
            const element = document.getElementById(key);
            if (element && key !== 'openaiApiKey' && key !== 'alphaVantageApiKey') {
                if (element.type === 'checkbox') {
                    element.checked = this.settings[key];
                } else {
                    element.value = this.settings[key];
                }
            }
        });
    }
    
    saveAllSettings() {
        // Collect all settings from UI
        Object.keys(this.defaultSettings).forEach(key => {
            const element = document.getElementById(key);
            if (element && key !== 'openaiApiKey' && key !== 'alphaVantageApiKey') {
                this.settings[key] = this.getElementValue(element);
            }
        });
        
        this.saveSettings();
        this.applySettings();
        this.showNotification('✅ Configuración guardada correctamente', 'success');
    }
    
    resetToDefaults() {
        if (confirm('¿Estás seguro de que quieres restaurar todos los valores por defecto? Esta acción no se puede deshacer.')) {
            this.settings = { ...this.defaultSettings };
            this.saveSettings();
            this.loadSettingsToUI();
            this.applySettings();
            this.showNotification('🔄 Configuración restaurada a valores por defecto', 'info');
        }
    }
    
    clearCache() {
        // Clear application cache
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => {
                    caches.delete(name);
                });
            });
        }
        
        // Clear portfolio data cache if exists
        if (typeof portfolio !== 'undefined' && portfolio.apiCache) {
            portfolio.apiCache.clear();
        }
        
        this.showNotification('🗑️ Caché limpiado correctamente', 'success');
    }
    
    clearAllData() {
        if (confirm('⚠️ ADVERTENCIA: Esto borrará TODOS tus datos incluyendo configuración, portfolios y preferencias. Esta acción NO se puede deshacer. ¿Continuar?')) {
            localStorage.clear();
            sessionStorage.clear();
            this.clearCache();
            
            this.showNotification('⚠️ Todos los datos han sido borrados. La página se recargará.', 'warning');
            
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }
    }
    
    exportData() {
        const exportData = {
            settings: this.settings,
            portfolioTickers: localStorage.getItem('portfolioTickers'),
            userProfiles: localStorage.getItem('userProfiles'),
            timestamp: new Date().toISOString(),
            version: this.settings.version
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showNotification('📥 Datos exportados correctamente', 'success');
    }
    
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importData = JSON.parse(e.target.result);
                        
                        // Validate data structure
                        if (importData.settings && importData.timestamp) {
                            // Import settings
                            this.settings = { ...this.defaultSettings, ...importData.settings };
                            this.saveSettings();
                            
                            // Import other data
                            if (importData.portfolioTickers) {
                                localStorage.setItem('portfolioTickers', importData.portfolioTickers);
                            }
                            if (importData.userProfiles) {
                                localStorage.setItem('userProfiles', importData.userProfiles);
                            }
                            
                            this.loadSettingsToUI();
                            this.applySettings();
                            
                            this.showNotification('📤 Datos importados correctamente. La página se recargará.', 'success');
                            
                            setTimeout(() => {
                                window.location.reload();
                            }, 2000);
                            
                        } else {
                            throw new Error('Invalid file format');
                        }
                    } catch (error) {
                        console.error('Import error:', error);
                        this.showNotification('❌ Error importando datos. Verifica que el archivo sea válido.', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }
    
    loadSettings() {
        try {
            const stored = localStorage.getItem('appSettings');
            if (stored) {
                return { ...this.defaultSettings, ...JSON.parse(stored) };
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
        return { ...this.defaultSettings };
    }
    
    saveSettings() {
        try {
            localStorage.setItem('appSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `settings-notification settings-notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
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
            fontSize: '14px'
        });
        
        // Set background color based on type
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8',
            warning: '#ffc107'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        // Add animation
        notification.style.transform = 'translateX(100%)';
        notification.style.transition = 'transform 0.3s ease-out';
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }
    
    // Public API
    get(key) {
        return this.settings[key];
    }
    
    set(key, value) {
        this.updateSetting(key, value);
        this.saveSettings();
    }
    
    getApiKey(type) {
        const key = type === 'openai' ? 'openaiApiKey' : 'alphaVantageApiKey';
        return this.settings[key] ? this.decryptApiKey(this.settings[key]) : '';
    }
}

// Initialize settings manager
const settingsManager = new SettingsManager();

// Make available globally
window.settingsManager = settingsManager;

console.log('✅ Settings Manager loaded');