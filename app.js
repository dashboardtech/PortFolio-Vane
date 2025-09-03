class PortfolioTracker {
    constructor() {
        this.tickers = this.loadTickersFromStorage();
        this.apiCache = new Map();
        this.currentProfile = null;
        this.profiles = this.loadProfiles();
        this.init();
    }

    init() {
        this.setupTabNavigation();
        this.setupEventListeners();
        this.setupSectorAnalysis();
        this.setupAIAssistant();
        this.setupProfileManager();
        this.initializeProfiles();
        
        if (this.tickers.length > 0) {
            this.fetchAllData();
        }
        setInterval(() => this.fetchAllData(), 60000);
    }

    setupTabNavigation() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;
                
                // Update active button
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update active content
                tabContents.forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(`${targetTab}-tab`).classList.add('active');
                
                // Load tab-specific content
                this.loadTabContent(targetTab);
            });
        });
    }

    setupEventListeners() {
        // Market tab events
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.apiCache.clear();
            this.fetchAllData();
        });

        document.getElementById('addTickerBtn').addEventListener('click', () => {
            this.addTicker();
        });

        document.getElementById('tickerInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTicker();
            }
        });

        document.getElementById('searchSectorBtn').addEventListener('click', () => {
            this.openSectorModal();
        });

        // Portfolio tab events
        const calculateBtn = document.getElementById('calculateBtn');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => {
                if (typeof portfolioManager !== 'undefined') {
                    portfolioManager.calculateDistribution();
                }
            });
        }

        const aiRecommendBtn = document.getElementById('aiRecommendBtn');
        if (aiRecommendBtn) {
            aiRecommendBtn.addEventListener('click', () => {
                this.getAIRecommendations();
            });
        }

        // Modal events
        this.setupModals();
    }

    setupModals() {
        const modals = document.querySelectorAll('.modal');
        const closes = document.querySelectorAll('.close');
        
        closes.forEach(close => {
            close.addEventListener('click', () => {
                modals.forEach(modal => modal.style.display = 'none');
            });
        });

        window.addEventListener('click', (e) => {
            modals.forEach(modal => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
    }

    loadTickersFromStorage() {
        const stored = localStorage.getItem('portfolioTickers');
        return stored ? JSON.parse(stored) : ['SPLG', 'SPY', 'QQQ', 'VTI', 'VOO'];
    }

    saveTickersToStorage() {
        localStorage.setItem('portfolioTickers', JSON.stringify(this.tickers));
    }

    loadProfiles() {
        const stored = localStorage.getItem('userProfiles');
        return stored ? JSON.parse(stored) : {};
    }

    saveProfiles() {
        localStorage.setItem('userProfiles', JSON.stringify(this.profiles));
    }

    addTicker() {
        const input = document.getElementById('tickerInput');
        const ticker = input.value.trim().toUpperCase();
        
        if (ticker && !this.tickers.includes(ticker)) {
            this.tickers.push(ticker);
            this.saveTickersToStorage();
            this.fetchTickerData(ticker);
            input.value = '';
        }
    }

    removeTicker(ticker) {
        this.tickers = this.tickers.filter(t => t !== ticker);
        this.saveTickersToStorage();
        this.renderTable();
        this.updateStats();
    }

    async fetchAllData() {
        this.showLoading(true);
        this.clearError();
        
        try {
            const promises = this.tickers.map(ticker => this.fetchTickerData(ticker));
            await Promise.all(promises);
        } catch (error) {
            this.showError('Error al obtener datos. Por favor intenta de nuevo.');
        } finally {
            this.showLoading(false);
            this.updateLastUpdate();
        }
    }

    async fetchTickerData(ticker) {
        try {
            // Check if ticker exists in our database first
            const tickerInfo = this.getTickerFromDatabase(ticker);
            
            if (tickerInfo) {
                // Use consistent data for each ticker based on the current day
                const baseData = this.getStableTickerData(ticker);
                
                const tickerData = {
                    symbol: ticker,
                    name: tickerInfo.name,
                    category: tickerInfo.sector,
                    price: baseData.price,
                    changePercent: baseData.changePercent,
                    marketCap: baseData.marketCap,
                    volume: baseData.volume,
                    peRatio: baseData.peRatio,
                    dividendYield: baseData.dividendYield,
                    fiftyTwoWeekHigh: baseData.fiftyTwoWeekHigh,
                    fiftyTwoWeekLow: baseData.fiftyTwoWeekLow,
                    expenseRatio: tickerInfo.expense,
                    riskLevel: this.getSectorRiskLevel(tickerInfo.sectorId)
                };

                this.updateOrAddRow(tickerData);
                this.updateStats();
                
                // Update portfolio manager with new prices
                if (typeof portfolioManager !== 'undefined') {
                    portfolioManager.updatePricesFromMarket(tickerData);
                }
                return;
            }

            // Fallback for unknown tickers - also stable
            const baseData = this.getStableTickerData(ticker);
            const fallbackData = {
                symbol: ticker,
                name: this.getCompanyName(ticker),
                category: this.getCategory(ticker),
                price: baseData.price,
                changePercent: baseData.changePercent,
                marketCap: baseData.marketCap,
                volume: baseData.volume,
                peRatio: baseData.peRatio,
                dividendYield: baseData.dividendYield,
                fiftyTwoWeekHigh: baseData.fiftyTwoWeekHigh,
                fiftyTwoWeekLow: baseData.fiftyTwoWeekLow,
                expenseRatio: 'N/A',
                riskLevel: 'Medio'
            };
            
            this.updateOrAddRow(fallbackData);
            this.updateStats();
            
        } catch (error) {
            console.error(`Error fetching ${ticker}:`, error);
        }
    }

    getStableTickerData(ticker) {
        // Generate a "seed" based on ticker and current date (but not time)
        // This ensures prices stay the same throughout the day but can change daily
        const today = new Date().toDateString(); // Gets date without time
        const seed = this.hashCode(ticker + today);
        
        // Use the seed to generate consistent "random" values
        const basePrice = this.getEstimatedPrice(ticker);
        const priceSeed = Math.abs(seed) / 2147483647; // Normalize to 0-1
        
        // Small daily variation (±2%) instead of large random changes
        const priceVariation = 1 + ((priceSeed * 4) - 2) / 100; // ±2%
        const currentPrice = (basePrice * priceVariation).toFixed(2);
        
        // Generate other stable values
        const changeSeed = Math.abs(this.hashCode(ticker + today + 'change')) / 2147483647;
        const changePercent = ((changeSeed * 6) - 3).toFixed(2); // ±3%
        
        const volSeed = Math.abs(this.hashCode(ticker + today + 'volume')) / 2147483647;
        const volume = Math.floor(volSeed * 100000000); // Up to 100M
        
        const peSeed = Math.abs(this.hashCode(ticker + today + 'pe')) / 2147483647;
        const peRatio = (15 + (peSeed * 25)).toFixed(2); // 15-40
        
        const divSeed = Math.abs(this.hashCode(ticker + today + 'div')) / 2147483647;
        const dividendYield = (divSeed * 4).toFixed(2); // 0-4%
        
        const capSeed = Math.abs(this.hashCode(ticker + today + 'cap')) / 2147483647;
        const marketCap = this.formatMarketCap(capSeed * 3000000000000); // Up to 3T
        
        return {
            price: currentPrice,
            changePercent: changePercent,
            marketCap: marketCap,
            volume: this.formatVolume(volume),
            peRatio: peRatio,
            dividendYield: dividendYield,
            fiftyTwoWeekHigh: (parseFloat(currentPrice) * 1.25).toFixed(2),
            fiftyTwoWeekLow: (parseFloat(currentPrice) * 0.75).toFixed(2)
        };
    }

    // Simple hash function to generate consistent "random" numbers
    hashCode(str) {
        let hash = 0;
        if (str.length === 0) return hash;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash;
    }

    getTickerFromDatabase(ticker) {
        const sectors = tickerDB.getAllSectors();
        for (let sector of sectors) {
            const tickerInfo = sector.tickers.find(t => t.symbol === ticker);
            if (tickerInfo) {
                return {
                    ...tickerInfo,
                    sector: sector.name,
                    sectorId: sector.id
                };
            }
        }
        return null;
    }

    getSectorRiskLevel(sectorId) {
        const sector = tickerDB.getSectorInfo(sectorId);
        return sector ? sector.riskLevel : 'Medio';
    }

    getEstimatedPrice(ticker) {
        const prices = {
            // Core ETFs
            'SPLG': 106.75, 'SPY': 585.23, 'QQQ': 508.45, 'VTI': 278.34, 'VOO': 538.75,
            'IVV': 587.34, 'SCHX': 61.23, 'ITOT': 115.67, 'VEA': 49.87, 'VWO': 42.15,
            
            // Bond ETFs
            'AGG': 98.45, 'BND': 71.23, 'TLT': 92.34, 'IEF': 98.67, 'LQD': 112.45,
            
            // Sector ETFs
            'IYR': 89.34, 'VNQ': 87.23, 'XLRE': 45.67, 'IYZ': 78.34, 'VOX': 89.45,
            'XLC': 67.89, 'IYK': 145.67, 'VDC': 198.34, 'XLP': 78.34, 'IYC': 89.45,
            'VCR': 234.56, 'XLY': 167.89, 'IYE': 45.67, 'VDE': 98.34, 'XLE': 89.45,
            'IYF': 67.89, 'VFH': 89.45, 'XLF': 43.21, 'IYJ': 123.45, 'VIS': 178.90,
            'XLI': 134.56, 'IYM': 78.90, 'VAW': 189.23, 'XLB': 89.45, 'IYH': 267.89,
            'VHT': 245.67, 'XLV': 134.56, 'IDU': 67.89, 'VPU': 156.78, 'XLU': 69.45,
            'IYW': 134.56, 'VGT': 543.21, 'XLK': 215.45, 'ARKK': 45.67,
            
            // Individual Stocks - Realistic Prices
            'AAPL': 233.45, 'MSFT': 450.23, 'GOOGL': 178.89, 'AMZN': 218.76,
            'NVDA': 138.67, 'META': 590.45, 'TSLA': 381.23, 'BRK.B': 487.90,
            'JPM': 234.56, 'V': 289.34, 'UNH': 634.78, 'JNJ': 178.45,
            'WMT': 89.23, 'PG': 167.89, 'MA': 523.67, 'HD': 412.34,
            'DIS': 123.89, 'BAC': 45.67, 'NFLX': 567.89, 'ADBE': 634.23,
            'CRM': 345.67, 'PYPL': 78.90, 'INTC': 56.78, 'AMD': 189.45
        };
        return prices[ticker] || 150; // Default more realistic price
    }

    getCompanyName(ticker) {
        const tickerInfo = this.getTickerFromDatabase(ticker);
        return tickerInfo ? tickerInfo.name : ticker;
    }

    getCategory(ticker) {
        const tickerInfo = this.getTickerFromDatabase(ticker);
        return tickerInfo ? tickerInfo.sector : 'Equity';
    }

    formatMarketCap(value) {
        if (!value || value === 0) return '---';
        if (value >= 1e12) return (value / 1e12).toFixed(2) + 'T';
        if (value >= 1e9) return (value / 1e9).toFixed(2) + 'B';
        if (value >= 1e6) return (value / 1e6).toFixed(2) + 'M';
        return value.toFixed(0);
    }

    formatVolume(value) {
        if (!value || value === 0) return '---';
        if (value >= 1e9) return (value / 1e9).toFixed(2) + 'B';
        if (value >= 1e6) return (value / 1e6).toFixed(2) + 'M';
        if (value >= 1e3) return (value / 1e3).toFixed(2) + 'K';
        return value.toFixed(0);
    }

    updateOrAddRow(data) {
        const tbody = document.getElementById('portfolioBody');
        let row = document.getElementById(`row-${data.symbol}`);
        
        if (!row) {
            row = document.createElement('tr');
            row.id = `row-${data.symbol}`;
            tbody.appendChild(row);
        }

        const changeClass = parseFloat(data.changePercent) >= 0 ? 'positive' : 'negative';
        const changeSymbol = parseFloat(data.changePercent) >= 0 ? '+' : '';

        row.innerHTML = `
            <td class="ticker-symbol">${data.symbol}</td>
            <td>${data.name}</td>
            <td>${data.category}</td>
            <td>$${data.price}</td>
            <td class="${changeClass}">${changeSymbol}${data.changePercent}%</td>
            <td>${data.expenseRatio}%</td>
            <td>${data.dividendYield}%</td>
            <td class="risk-${data.riskLevel.toLowerCase().replace('-', '')}">${data.riskLevel}</td>
            <td>
                <button class="remove-btn" onclick="portfolio.removeTicker('${data.symbol}')">
                    Eliminar
                </button>
            </td>
        `;
    }

    renderTable() {
        const tbody = document.getElementById('portfolioBody');
        const rows = tbody.querySelectorAll('tr');
        
        rows.forEach(row => {
            const symbol = row.id.replace('row-', '');
            if (!this.tickers.includes(symbol)) {
                row.remove();
            }
        });
    }

    updateStats() {
        const rows = document.querySelectorAll('#portfolioBody tr');
        let totalValue = 0;
        let totalReturn = 0;
        let totalDividend = 0;
        let count = 0;

        rows.forEach(row => {
            const cells = row.cells;
            const price = parseFloat(cells[3].textContent.replace('$', '')) || 0;
            const changePercent = parseFloat(cells[4].textContent.replace('%', '')) || 0;
            const dividendYield = parseFloat(cells[6].textContent.replace('%', '')) || 0;
            
            if (price > 0) {
                totalValue += price;
                totalReturn += changePercent;
                totalDividend += dividendYield;
                count++;
            }
        });

        document.getElementById('totalValue').textContent = `$${totalValue.toFixed(2)}`;
        document.getElementById('avgReturn').textContent = count > 0 ? 
            `${(totalReturn / count).toFixed(2)}%` : '0%';
        document.getElementById('avgDividend').textContent = count > 0 ? 
            `${(totalDividend / count).toFixed(2)}%` : '0%';
    }

    // Sector Analysis
    setupSectorAnalysis() {
        // Will be loaded when tab is accessed
    }

    loadSectorAnalysis() {
        const sectorsGrid = document.getElementById('sectorsGrid');
        const marketConditions = document.getElementById('marketConditions');
        
        if (!sectorsGrid || !marketConditions) return;

        // Market conditions
        const analysis = tickerDB.getMarketAnalysis();
        marketConditions.innerHTML = `
            <div class="market-summary">
                <h3>Condiciones de Mercado</h3>
                <div class="conditions-grid">
                    <div class="condition-item">
                        <strong>Fase del Mercado:</strong> ${analysis.conditions.marketPhase}
                    </div>
                    <div class="condition-item">
                        <strong>Tasas de Interés:</strong> ${analysis.conditions.interestRateEnvironment}
                    </div>
                    <div class="condition-item">
                        <strong>Inflación:</strong> ${analysis.conditions.inflationTrend}
                    </div>
                    <div class="condition-item">
                        <strong>Ciclo Económico:</strong> ${analysis.conditions.economicCycle}
                    </div>
                </div>
            </div>
        `;

        // Sectors grid
        const sectors = tickerDB.getAllSectors();
        sectorsGrid.innerHTML = sectors.map(sector => `
            <div class="sector-card" data-sector="${sector.id}">
                <div class="sector-header">
                    <h4>${sector.name}</h4>
                    <span class="sector-code">${sector.code}</span>
                </div>
                <div class="sector-info">
                    <p class="sector-description">${sector.description}</p>
                    <div class="sector-metrics">
                        <div class="metric">
                            <span class="label">Riesgo:</span>
                            <span class="value risk-${sector.riskLevel.toLowerCase().replace(/[^a-z]/g, '')}">${sector.riskLevel}</span>
                        </div>
                        <div class="metric">
                            <span class="label">Volatilidad:</span>
                            <span class="value">${sector.volatility}</span>
                        </div>
                        <div class="metric">
                            <span class="label">Dividendo:</span>
                            <span class="value">${sector.dividendYield}</span>
                        </div>
                    </div>
                    <div class="sector-tickers">
                        <strong>Tickers principales:</strong>
                        <div class="ticker-chips">
                            ${sector.tickers.slice(0, 3).map(ticker => 
                                `<span class="ticker-chip" onclick="portfolio.addSpecificTicker('${ticker.symbol}')">${ticker.symbol}</span>`
                            ).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    addSpecificTicker(ticker) {
        if (!this.tickers.includes(ticker)) {
            this.tickers.push(ticker);
            this.saveTickersToStorage();
            this.fetchTickerData(ticker);
            
            // Switch to market tab
            document.querySelector('[data-tab="market"]').click();
        }
    }

    // AI Assistant
    setupAIAssistant() {
        // Setup AI feature navigation
        this.setupAIFeatureNavigation();

        // Profile analysis
        const analyzeBtn = document.getElementById('analyzeProfileBtn');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => {
                this.analyzeUserProfileWithOpenAI();
            });
        }

        // Chat functionality
        this.setupAIChat();

        // Portfolio review
        const reviewBtn = document.getElementById('reviewPortfolioBtn');
        if (reviewBtn) {
            reviewBtn.addEventListener('click', () => {
                this.reviewPortfolioWithAI();
            });
        }

        // Market insights
        const insightsBtn = document.getElementById('getMarketInsightsBtn');
        if (insightsBtn) {
            insightsBtn.addEventListener('click', () => {
                this.getMarketInsightsFromAI();
            });
        }

        // ETF analysis
        this.setupETFAnalyzer();
    }

    setupAIFeatureNavigation() {
        const featureBtns = document.querySelectorAll('.ai-feature-btn');
        const features = document.querySelectorAll('.ai-feature');

        featureBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetFeature = btn.dataset.feature;
                
                // Update active button
                featureBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update active feature
                features.forEach(feature => {
                    feature.classList.remove('active');
                });
                const targetElement = document.getElementById(`${targetFeature}-feature`);
                if (targetElement) {
                    targetElement.classList.add('active');
                }
            });
        });
    }

    setupAIChat() {
        const chatInput = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendChatBtn');
        const clearBtn = document.getElementById('clearChatBtn');

        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                this.sendChatMessage();
            });
        }

        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendChatMessage();
                }
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearChat();
            });
        }
    }

    setupETFAnalyzer() {
        const analyzeBtn = document.getElementById('analyzeETFBtn');
        const compareBtn = document.getElementById('compareETFsBtn');

        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => {
                this.analyzeETFWithAI();
            });
        }

        if (compareBtn) {
            compareBtn.addEventListener('click', () => {
                this.compareETFsWithAI();
            });
        }
    }

    async analyzeUserProfileWithOpenAI() {
        const questionnaire = {
            age: this.getSelectValue('ageSelect'),
            experience: this.getSelectValue('experienceSelect'),
            timeHorizon: this.getSelectValue('timeHorizonSelect'),
            volatilityTolerance: this.getSelectValue('volatilitySelect'),
            primaryGoal: this.getSelectValue('goalSelect')
        };

        // Validate all questions answered
        if (!questionnaire.age || !questionnaire.experience || !questionnaire.timeHorizon || 
            !questionnaire.volatilityTolerance || !questionnaire.primaryGoal) {
            alert('Por favor completa todas las preguntas del cuestionario.');
            return;
        }

        // Show loading
        this.showAILoading('Analizando tu perfil con IA...');

        try {
            const currentPortfolio = this.tickers;
            const analysis = await openAIAssistant.analyzeUserProfileAdvanced(questionnaire, currentPortfolio);
            this.displayOpenAIResults(analysis);
            
            // Store user profile for context
            this.currentProfile = analysis.riskProfile;
            openAIAssistant.setUserContext({
                portfolio: this.tickers.join(', '),
                riskProfile: analysis.riskProfile,
                investmentAmount: portfolioManager?.investmentAmount || 0
            });
            
        } catch (error) {
            console.error('Error analyzing profile:', error);
            this.showAIError('Error al analizar el perfil. Intenta de nuevo.');
        } finally {
            this.hideAILoading();
        }
    }

    async sendChatMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;

        // Add user message to chat
        this.addChatMessage(message, 'user');
        input.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            const context = {
                portfolio: this.tickers.join(', '),
                riskProfile: this.currentProfile || 'No determinado',
                investmentAmount: portfolioManager?.investmentAmount || 0
            };

            const response = await openAIAssistant.askQuestion(message, context);
            this.hideTypingIndicator();
            this.addChatMessage(response, 'ai');
            
        } catch (error) {
            console.error('Error in chat:', error);
            this.hideTypingIndicator();
            this.addChatMessage('Lo siento, hubo un error al procesar tu pregunta. Intenta de nuevo.', 'ai');
        }
    }

    async reviewPortfolioWithAI() {
        if (this.tickers.length === 0) {
            alert('Primero agrega algunos tickers a tu portfolio para poder analizarlo.');
            return;
        }

        this.showAILoading('Revisando tu portfolio con IA...');

        try {
            const investmentAmount = portfolioManager?.investmentAmount || 10000;
            const portfolioData = this.tickers.map(ticker => ({ symbol: ticker }));
            
            const review = await openAIAssistant.getPortfolioReview(portfolioData, investmentAmount);
            
            const resultsDiv = document.getElementById('portfolioReviewResults');
            if (resultsDiv) {
                resultsDiv.innerHTML = `
                    <div class="ai-review-result">
                        <h4>📊 Análisis de tu Portfolio</h4>
                        <div class="review-content">${this.formatAIResponse(review)}</div>
                        <div class="review-actions">
                            <button onclick="portfolio.applyReviewSuggestions()" class="apply-suggestions-btn">
                                ✅ Aplicar Sugerencias
                            </button>
                        </div>
                    </div>
                `;
            }
            
        } catch (error) {
            console.error('Error reviewing portfolio:', error);
            this.showAIError('Error al revisar el portfolio. Intenta de nuevo.');
        } finally {
            this.hideAILoading();
        }
    }

    async getMarketInsightsFromAI() {
        this.showAILoading('Obteniendo insights de mercado...');

        try {
            const insights = await openAIAssistant.getMarketInsights();
            
            const resultsDiv = document.getElementById('marketInsightsResults');
            if (resultsDiv) {
                resultsDiv.innerHTML = `
                    <div class="ai-insights-result">
                        <h4>📈 Análisis de Mercado IA</h4>
                        <div class="insights-content">${this.formatAIResponse(insights)}</div>
                        <div class="insights-timestamp">
                            <small>Generado: ${new Date().toLocaleString('es-ES')}</small>
                        </div>
                    </div>
                `;
            }
            
        } catch (error) {
            console.error('Error getting market insights:', error);
            this.showAIError('Error al obtener insights de mercado. Intenta de nuevo.');
        } finally {
            this.hideAILoading();
        }
    }

    async analyzeETFWithAI() {
        const input = document.getElementById('etfAnalyzeInput');
        const ticker = input.value.trim().toUpperCase();
        
        if (!ticker) {
            alert('Por favor ingresa un ticker para analizar.');
            return;
        }

        this.showAILoading('Analizando ETF con IA...');

        try {
            const analysis = await openAIAssistant.explainETF(ticker);
            
            const resultsDiv = document.getElementById('etfAnalysisResults');
            if (resultsDiv) {
                resultsDiv.innerHTML = `
                    <div class="ai-etf-analysis">
                        <h4>🔬 Análisis de ${ticker}</h4>
                        <div class="analysis-content">${this.formatAIResponse(analysis)}</div>
                        <div class="analysis-actions">
                            <button onclick="portfolio.addSpecificTicker('${ticker}')" class="add-to-portfolio-btn">
                                ➕ Agregar a Portfolio
                            </button>
                        </div>
                    </div>
                `;
            }
            
        } catch (error) {
            console.error('Error analyzing ETF:', error);
            this.showAIError('Error al analizar el ETF. Intenta de nuevo.');
        } finally {
            this.hideAILoading();
        }
    }

    async compareETFsWithAI() {
        const ticker1 = document.getElementById('etfCompare1').value.trim().toUpperCase();
        const ticker2 = document.getElementById('etfCompare2').value.trim().toUpperCase();
        
        if (!ticker1 || !ticker2) {
            alert('Por favor ingresa dos tickers para comparar.');
            return;
        }

        this.showAILoading('Comparando ETFs con IA...');

        try {
            const comparison = await openAIAssistant.compareETFs(ticker1, ticker2);
            
            const resultsDiv = document.getElementById('etfComparisonResults');
            if (resultsDiv) {
                resultsDiv.innerHTML = `
                    <div class="ai-etf-comparison">
                        <h4>⚖️ Comparación: ${ticker1} vs ${ticker2}</h4>
                        <div class="comparison-content">${this.formatAIResponse(comparison)}</div>
                        <div class="comparison-actions">
                            <button onclick="portfolio.addSpecificTicker('${ticker1}')" class="add-btn">➕ Agregar ${ticker1}</button>
                            <button onclick="portfolio.addSpecificTicker('${ticker2}')" class="add-btn">➕ Agregar ${ticker2}</button>
                        </div>
                    </div>
                `;
            }
            
        } catch (error) {
            console.error('Error comparing ETFs:', error);
            this.showAIError('Error al comparar ETFs. Intenta de nuevo.');
        } finally {
            this.hideAILoading();
        }
    }

    getSelectValue(selectId) {
        const select = document.getElementById(selectId);
        return select ? select.value : '';
    }

    displayAIResults(analysis) {
        const resultsDiv = document.getElementById('aiResults');
        if (!resultsDiv) return;

        resultsDiv.style.display = 'block';
        resultsDiv.innerHTML = `
            <div class="ai-analysis">
                <h3>🎯 Tu Perfil de Inversión</h3>
                <div class="profile-summary">
                    <div class="profile-type">
                        <strong>Perfil:</strong> ${analysis.profile.characteristics.riskLevel} - ${tickerDB.getProfileInfo(analysis.profile.type).name}
                    </div>
                    <div class="profile-details">
                        <p><strong>Retorno Esperado:</strong> ${analysis.profile.characteristics.expectedReturn}</p>
                        <p><strong>Volatilidad:</strong> ${analysis.profile.characteristics.volatility}</p>
                        <p><strong>Adecuado para:</strong> ${analysis.profile.characteristics.suitableFor}</p>
                    </div>
                </div>

                <h4>💡 Recomendaciones Personalizadas</h4>
                <div class="recommendations-grid">
                    ${analysis.recommendations.slice(0, 4).map(rec => `
                        <div class="recommendation-card">
                            <div class="rec-header">
                                <span class="ticker-large">${rec.symbol}</span>
                                <span class="confidence">Confianza: ${rec.confidence}%</span>
                            </div>
                            <h5>${rec.name}</h5>
                            <p class="sector">${rec.sector}</p>
                            <p class="allocation">${rec.percentage}% de tu portfolio</p>
                            <div class="rec-analysis">
                                <div class="pros">
                                    <strong>Pros:</strong>
                                    <ul>
                                        ${rec.pros.map(pro => `<li>${pro}</li>`).join('')}
                                    </ul>
                                </div>
                            </div>
                            <button class="add-rec-btn" onclick="portfolio.addSpecificTicker('${rec.symbol}')">
                                Agregar al Portfolio
                            </button>
                        </div>
                    `).join('')}
                </div>

                <div class="ai-tips">
                    <h4>📋 Consejos Personalizados</h4>
                    <ul>
                        ${aiAssistant.generatePersonalizedTips(analysis.profile).map(tip => 
                            `<li>${tip}</li>`
                        ).join('')}
                    </ul>
                </div>
            </div>
        `;

        // Scroll to results
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
    }

    // Profile Management
    setupProfileManager() {
        const newProfileBtn = document.getElementById('newProfileBtn');
        if (newProfileBtn) {
            newProfileBtn.addEventListener('click', () => {
                this.openProfileModal();
            });
        }

        const profileSelector = document.getElementById('profileSelector');
        if (profileSelector) {
            profileSelector.addEventListener('change', (e) => {
                this.switchProfile(e.target.value);
            });
        }
    }

    initializeProfiles() {
        const profileSelector = document.getElementById('profileSelector');
        if (!profileSelector) return;

        // Add predefined profiles to selector
        const predefinedProfiles = tickerDB.getAllProfiles();
        predefinedProfiles.forEach(profile => {
            const option = document.createElement('option');
            option.value = profile.id;
            option.textContent = profile.name;
            profileSelector.appendChild(option);
        });

        // Add user profiles
        Object.keys(this.profiles).forEach(profileId => {
            const profile = this.profiles[profileId];
            const option = document.createElement('option');
            option.value = profileId;
            option.textContent = profile.name;
            profileSelector.appendChild(option);
        });
    }

    openProfileModal() {
        const modal = document.getElementById('profileModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    openSectorModal() {
        const modal = document.getElementById('sectorModal');
        const sectorSearch = document.getElementById('sectorSearch');
        
        if (modal && sectorSearch) {
            // Populate sector search
            const sectors = tickerDB.getAllSectors();
            sectorSearch.innerHTML = `
                <div class="sector-search-grid">
                    ${sectors.map(sector => `
                        <div class="sector-search-item" onclick="portfolio.selectSectorTickers('${sector.id}')">
                            <h4>${sector.name}</h4>
                            <p>${sector.description}</p>
                            <div class="sector-tickers-preview">
                                ${sector.tickers.slice(0, 3).map(t => t.symbol).join(', ')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            modal.style.display = 'block';
        }
    }

    selectSectorTickers(sectorId) {
        const sector = tickerDB.getSectorInfo(sectorId);
        if (sector) {
            // Add first ticker from sector
            const ticker = sector.tickers[0];
            if (ticker && !this.tickers.includes(ticker.symbol)) {
                this.tickers.push(ticker.symbol);
                this.saveTickersToStorage();
                this.fetchTickerData(ticker.symbol);
            }
        }
        
        // Close modal and switch to market tab
        document.getElementById('sectorModal').style.display = 'none';
        document.querySelector('[data-tab="market"]').click();
    }

    loadTabContent(tabName) {
        switch(tabName) {
            case 'sectors':
                this.loadSectorAnalysis();
                break;
            case 'profiles':
                this.loadProfilesContent();
                break;
        }
    }

    loadProfilesContent() {
        const profilesList = document.getElementById('profilesList');
        const templatesGrid = document.getElementById('templatesGrid');
        
        if (templatesGrid) {
            const templates = tickerDB.getAllProfiles();
            templatesGrid.innerHTML = templates.map(template => `
                <div class="template-card">
                    <h4>${template.name}</h4>
                    <p class="template-desc">${template.description}</p>
                    <div class="template-details">
                        <div><strong>Riesgo:</strong> ${template.riskTolerance}</div>
                        <div><strong>Horizonte:</strong> ${template.timeHorizon}</div>
                    </div>
                    <div class="template-characteristics">
                        ${template.characteristics.map(char => `<span class="char-tag">${char}</span>`).join('')}
                    </div>
                    <button class="select-template-btn" onclick="portfolio.selectProfileTemplate('${template.id}')">
                        Usar Template
                    </button>
                </div>
            `).join('');
        }
    }

    selectProfileTemplate(profileId) {
        if (typeof portfolioManager !== 'undefined') {
            const profile = tickerDB.getProfileInfo(profileId);
            if (profile) {
                // Update portfolio manager composition
                portfolioManager.composition = {
                    fixedIncome: Object.entries(profile.allocation)
                        .filter(([key]) => key === 'bonos')
                        .reduce((sum, [, value]) => sum + value, 0),
                    equity: Object.entries(profile.allocation)
                        .filter(([key]) => key !== 'bonos')
                        .reduce((sum, [, value]) => sum + value, 0),
                    core: profile.allocation['core-broad'] || 0,
                    explore: profile.allocation['tecnologia'] || 0,
                    protect: profile.allocation['servicios-basicos'] || profile.allocation['consumo-basico'] || 0
                };
                
                portfolioManager.saveComposition();
                portfolioManager.updateCompositionDisplay();
                
                // Switch to portfolio tab
                document.querySelector('[data-tab="portfolio"]').click();
            }
        }
    }

    getAIRecommendations() {
        // Simple AI recommendation based on current profile
        if (this.currentProfile) {
            const recommendations = tickerDB.getRecommendedTickers(this.currentProfile, 10000);
            alert(`Recomendaciones basadas en tu perfil:\n${recommendations.slice(0, 3).map(r => r.symbol).join(', ')}`);
        } else {
            alert('Por favor completa el cuestionario del Asistente IA primero.');
        }
    }

    updateLastUpdate() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('es-ES');
        const updateElement = document.getElementById('lastUpdate');
        if (updateElement) {
            updateElement.textContent = `Última actualización: ${timeString}`;
        }
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        if (loading) {
            if (show) {
                loading.classList.add('active');
            } else {
                loading.classList.remove('active');
            }
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.add('active');
            
            setTimeout(() => {
                errorDiv.classList.remove('active');
            }, 5000);
        }
    }

    clearError() {
        const errorDiv = document.getElementById('errorMessage');
        if (errorDiv) {
            errorDiv.classList.remove('active');
        }
    }

    // AI Helper Functions
    displayOpenAIResults(analysis) {
        const resultsDiv = document.getElementById('aiResults');
        if (!resultsDiv) return;

        resultsDiv.style.display = 'block';
        
        if (analysis && analysis.riskProfile) {
            resultsDiv.innerHTML = `
                <div class="openai-analysis">
                    <h3>🎯 Análisis de Perfil IA</h3>
                    <div class="profile-summary">
                        <div class="profile-type">
                            <strong>Perfil de Riesgo:</strong> ${analysis.riskProfile}
                        </div>
                        <div class="profile-justification">
                            ${analysis.riskJustification}
                        </div>
                        <div class="profile-details">
                            <p><strong>Retorno Esperado:</strong> ${analysis.expectedReturn}</p>
                            <p><strong>Volatilidad:</strong> ${analysis.volatilityRange}</p>
                        </div>
                    </div>

                    <h4>📊 Asignación de Activos Recomendada</h4>
                    <div class="asset-allocation">
                        <div class="allocation-grid">
                            <div class="allocation-item">
                                <span class="label">Bonos:</span>
                                <span class="value">${analysis.assetAllocation.bonds}</span>
                            </div>
                            <div class="allocation-item">
                                <span class="label">Acciones:</span>
                                <span class="value">${analysis.assetAllocation.stocks}</span>
                            </div>
                            <div class="allocation-item">
                                <span class="label">Internacional:</span>
                                <span class="value">${analysis.assetAllocation.international}</span>
                            </div>
                            <div class="allocation-item">
                                <span class="label">Alternativos:</span>
                                <span class="value">${analysis.assetAllocation.alternatives}</span>
                            </div>
                        </div>
                    </div>

                    <h4>💡 ETFs Recomendados</h4>
                    <div class="recommendations-grid">
                        ${analysis.recommendations.map(rec => `
                            <div class="recommendation-card">
                                <div class="rec-header">
                                    <span class="ticker-large">${rec.ticker}</span>
                                    <span class="allocation">${rec.allocation}</span>
                                </div>
                                <h5>${rec.name}</h5>
                                <p class="reasoning">${rec.reasoning}</p>
                                <button class="add-rec-btn" onclick="portfolio.addSpecificTicker('${rec.ticker}')">
                                    Agregar al Portfolio
                                </button>
                            </div>
                        `).join('')}
                    </div>

                    <div class="ai-tips">
                        <h4>📋 Consejos Personalizados IA</h4>
                        <ul>
                            ${analysis.personalizedTips.map(tip => `<li>${tip}</li>`).join('')}
                        </ul>
                    </div>

                    ${analysis.aiResponse ? `
                        <div class="ai-raw-response">
                            <details>
                                <summary>Ver respuesta completa de IA</summary>
                                <div class="raw-response">${this.formatAIResponse(analysis.aiResponse)}</div>
                            </details>
                        </div>
                    ` : ''}
                </div>
            `;
        } else {
            resultsDiv.innerHTML = `
                <div class="ai-error">
                    <h4>⚠️ Error en el análisis</h4>
                    <p>No se pudo completar el análisis. Usando análisis básico de respaldo.</p>
                    ${analysis ? `<div class="fallback-response">${this.formatAIResponse(JSON.stringify(analysis, null, 2))}</div>` : ''}
                </div>
            `;
        }

        resultsDiv.scrollIntoView({ behavior: 'smooth' });
    }

    addChatMessage(message, sender) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = sender === 'user' ? 'user-message' : 'ai-message';
        
        if (sender === 'user') {
            messageDiv.innerHTML = `<strong>Tú:</strong> ${message}`;
        } else {
            messageDiv.innerHTML = `<strong>Asesor IA:</strong> ${this.formatAIResponse(message)}`;
        }

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    clearChat() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.innerHTML = `
                <div class="ai-message">
                    <strong>Asesor IA:</strong> ¡Hola! Soy tu asesor de inversiones personal. ¿En qué puedo ayudarte?
                </div>
            `;
        }
        
        if (typeof openAIAssistant !== 'undefined') {
            openAIAssistant.clearChatHistory();
        }
    }

    showTypingIndicator() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'ai-message typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = '<strong>Asesor IA:</strong> <span class="dots">Escribiendo<span>.</span><span>.</span><span>.</span></span>';
        
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    formatAIResponse(response) {
        if (!response) return '';
        
        // Convert newlines to HTML breaks and format basic markdown
        return response
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^(.*)$/gm, '<p>$1</p>')
            .replace(/<p><\/p>/g, '')
            .replace(/<p><br>/g, '<p>')
            .replace(/<br><\/p>/g, '</p>');
    }

    showAILoading(message) {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.innerHTML = `<div class="ai-loading">${message}</div>`;
            loading.classList.add('active');
        }
    }

    hideAILoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.remove('active');
            loading.innerHTML = 'Cargando datos...';
        }
    }

    showAIError(message) {
        const errorDiv = document.getElementById('errorMessage');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.add('active');
            
            setTimeout(() => {
                errorDiv.classList.remove('active');
            }, 5000);
        }
    }

    applyReviewSuggestions() {
        alert('Esta funcionalidad aplicará automáticamente las sugerencias del análisis IA a tu portfolio.');
        // TODO: Implement automatic application of AI suggestions
    }
}

// Global functions for HTML onclick events
function askSuggestion(question) {
    const chatInput = document.getElementById('chatInput');
    if (chatInput && portfolio) {
        chatInput.value = question;
        portfolio.sendChatMessage();
    }
}

// Initialize the portfolio tracker
const portfolio = new PortfolioTracker();