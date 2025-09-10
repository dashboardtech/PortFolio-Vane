// Data Source Manager - Handle multiple data sources for market data
class DataSourceManager {
    constructor() {
        this.dataSources = {
            simulated: new SimulatedDataSource(),
            alphaVantage: new AlphaVantageDataSource()
        };
        this.currentSource = 'simulated';
        this.cache = new Map();
        this.cacheTimeout = 60000; // 1 minute
    }
    
    setDataSource(sourceName) {
        if (this.dataSources[sourceName]) {
            this.currentSource = sourceName;
            console.log(`📊 Data source set to: ${sourceName}`);
        } else {
            console.error(`❌ Unknown data source: ${sourceName}`);
        }
    }
    
    getCurrentSource() {
        return this.currentSource;
    }
    
    async getQuote(symbol) {
        const cacheKey = `quote_${symbol}_${this.currentSource}`;
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }
        
        try {
            const dataSource = this.dataSources[this.currentSource];
            const quote = await dataSource.getQuote(symbol);
            
            // Cache the result
            this.cache.set(cacheKey, {
                data: quote,
                timestamp: Date.now()
            });
            
            return quote;
        } catch (error) {
            console.error(`❌ Error fetching quote for ${symbol}:`, error);
            
            // Try fallback to simulated data
            if (this.currentSource !== 'simulated') {
                console.log('🔄 Falling back to simulated data...');
                const simulatedSource = this.dataSources.simulated;
                return await simulatedSource.getQuote(symbol);
            }
            
            throw error;
        }
    }
    
    async getHistoricalData(symbol, period = '1M') {
        const cacheKey = `history_${symbol}_${period}_${this.currentSource}`;
        
        // Check cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout * 5) { // 5 minutes for historical data
                return cached.data;
            }
        }
        
        try {
            const dataSource = this.dataSources[this.currentSource];
            const data = await dataSource.getHistoricalData(symbol, period);
            
            // Cache the result
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });
            
            return data;
        } catch (error) {
            console.error(`❌ Error fetching historical data for ${symbol}:`, error);
            
            // Try fallback to simulated data
            if (this.currentSource !== 'simulated') {
                console.log('🔄 Falling back to simulated data...');
                const simulatedSource = this.dataSources.simulated;
                return await simulatedSource.getHistoricalData(symbol, period);
            }
            
            throw error;
        }
    }
    
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Data source cache cleared');
    }
}

// Simulated Data Source
class SimulatedDataSource {
    constructor() {
        this.baseData = {
            'AAPL': { price: 175.43, change: 2.15, changePercent: 1.24 },
            'GOOGL': { price: 142.56, change: -1.23, changePercent: -0.85 },
            'MSFT': { price: 378.85, change: 4.67, changePercent: 1.25 },
            'AMZN': { price: 154.89, change: -0.95, changePercent: -0.61 },
            'TSLA': { price: 248.42, change: 8.23, changePercent: 3.43 },
            'META': { price: 518.73, change: -2.41, changePercent: -0.46 },
            'NVDA': { price: 875.28, change: 15.67, changePercent: 1.82 },
            'NFLX': { price: 485.73, change: -3.21, changePercent: -0.66 }
        };
    }
    
    async getQuote(symbol) {
        // Simulate API delay
        await this.simulateDelay(100, 300);
        
        const baseQuote = this.baseData[symbol.toUpperCase()] || this.generateRandomQuote();
        
        // Add some random variation
        const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
        const price = baseQuote.price * (1 + variation);
        const change = price - baseQuote.price;
        const changePercent = (change / baseQuote.price) * 100;
        
        return {
            symbol: symbol.toUpperCase(),
            price: MathUtils.formatNumber(price, 2),
            change: MathUtils.formatNumber(change, 2),
            changePercent: MathUtils.formatNumber(changePercent, 2),
            volume: Math.floor(Math.random() * 10000000) + 1000000,
            lastUpdated: new Date().toISOString(),
            source: 'simulated'
        };
    }
    
    async getHistoricalData(symbol, period = '1M') {
        await this.simulateDelay(200, 500);
        
        const basePrice = this.baseData[symbol.toUpperCase()]?.price || 100;
        const data = [];
        const days = this.getPeriodDays(period);
        
        for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            // Generate realistic price movement
            const variation = (Math.random() - 0.5) * 0.08; // ±4% daily variation
            const price = basePrice * (1 + variation * (i / days));
            
            data.push({
                date: date.toISOString().split('T')[0],
                price: MathUtils.formatNumber(price, 2),
                volume: Math.floor(Math.random() * 5000000) + 1000000
            });
        }
        
        return data;
    }
    
    generateRandomQuote() {
        const price = 50 + Math.random() * 450; // $50-500
        const changePercent = (Math.random() - 0.5) * 10; // ±5%
        const change = price * (changePercent / 100);
        
        return {
            price: price,
            change: change,
            changePercent: changePercent
        };
    }
    
    getPeriodDays(period) {
        const periods = {
            '1D': 1,
            '1W': 7,
            '1M': 30,
            '3M': 90,
            '6M': 180,
            '1Y': 365
        };
        return periods[period] || 30;
    }
    
    async simulateDelay(min, max) {
        const delay = Math.random() * (max - min) + min;
        return new Promise(resolve => setTimeout(resolve, delay));
    }
}

// Alpha Vantage Data Source
class AlphaVantageDataSource {
    constructor() {
        this.baseUrl = 'https://www.alphavantage.co/query';
        this.rateLimiter = SecurityUtils.createRateLimiter(5, 60000); // 5 requests per minute
    }
    
    async getQuote(symbol) {
        if (!this.rateLimiter()) {
            throw new Error('Rate limit exceeded for Alpha Vantage API');
        }
        
        const apiKey = this.getApiKey();
        if (!apiKey) {
            throw new Error('Alpha Vantage API key not configured');
        }
        
        const url = `${this.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data['Error Message']) {
                throw new Error(data['Error Message']);
            }
            
            if (data['Information']) {
                throw new Error('Alpha Vantage rate limit reached');
            }
            
            const quote = data['Global Quote'];
            if (!quote) {
                throw new Error('Invalid response from Alpha Vantage');
            }
            
            return {
                symbol: quote['01. symbol'],
                price: parseFloat(quote['05. price']),
                change: parseFloat(quote['09. change']),
                changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
                volume: parseInt(quote['06. volume']),
                lastUpdated: quote['07. latest trading day'],
                source: 'alphaVantage'
            };
        } catch (error) {
            if (window.errorHandler) {
                window.errorHandler.handleApiError(error, 'Alpha Vantage');
            }
            throw error;
        }
    }
    
    async getHistoricalData(symbol, period = '1M') {
        if (!this.rateLimiter()) {
            throw new Error('Rate limit exceeded for Alpha Vantage API');
        }
        
        const apiKey = this.getApiKey();
        if (!apiKey) {
            throw new Error('Alpha Vantage API key not configured');
        }
        
        const url = `${this.baseUrl}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data['Error Message']) {
                throw new Error(data['Error Message']);
            }
            
            if (data['Information']) {
                throw new Error('Alpha Vantage rate limit reached');
            }
            
            const timeSeries = data['Time Series (Daily)'];
            if (!timeSeries) {
                throw new Error('Invalid historical data response');
            }
            
            const days = this.getPeriodDays(period);
            const sortedDates = Object.keys(timeSeries).sort().slice(-days);
            
            return sortedDates.map(date => ({
                date: date,
                price: parseFloat(timeSeries[date]['4. close']),
                volume: parseInt(timeSeries[date]['5. volume'])
            }));
        } catch (error) {
            if (window.errorHandler) {
                window.errorHandler.handleApiError(error, 'Alpha Vantage');
            }
            throw error;
        }
    }
    
    getApiKey() {
        return window.settingsManager?.getApiKey('alpha') || '';
    }
    
    getPeriodDays(period) {
        const periods = {
            '1D': 1,
            '1W': 7,
            '1M': 30,
            '3M': 90,
            '6M': 180,
            '1Y': 365
        };
        return periods[period] || 30;
    }
}

// Initialize data source manager
const dataSourceManager = new DataSourceManager();

// Make available globally
window.dataSourceManager = dataSourceManager;
console.log('✅ Data Source Manager loaded');