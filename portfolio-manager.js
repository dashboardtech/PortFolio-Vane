class PortfolioManager {
    constructor() {
        this.composition = this.loadComposition();
        this.investmentAmount = 100;
        this.tickerPrices = {};
        this.init();
    }

    init() {
        setupTabNavigation();
        this.loadSavedData();
        this.updateCompositionDisplay();
        this.setupCompositionEditor();
    }

    loadComposition() {
        const saved = localStorage.getItem('portfolioComposition');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            fixedIncome: 40,
            equity: 60,
            core: 42,
            explore: 9,
            protect: 9
        };
    }

    saveComposition() {
        localStorage.setItem('portfolioComposition', JSON.stringify(this.composition));
    }

    setupCompositionEditor() {
        const fixedIncomeInput = document.getElementById('fixedIncomeInput');
        const equityInput = document.getElementById('equityInput');
        const coreInput = document.getElementById('coreInput');
        const exploreInput = document.getElementById('exploreInput');
        const protectInput = document.getElementById('protectInput');
        const saveBtn = document.getElementById('saveCompositionBtn');
        const validationMsg = document.getElementById('validationMsg');

        // Exit early if composition editor elements don't exist
        if (!fixedIncomeInput || !equityInput || !coreInput || !exploreInput || !protectInput || !saveBtn || !validationMsg) {
            return;
        }

        // Update equity when fixed income changes
        fixedIncomeInput.addEventListener('input', () => {
            const fixedValue = parseFloat(fixedIncomeInput.value) || 0;
            equityInput.value = 100 - fixedValue;
        });

        // Validate composition
        const validateComposition = () => {
            const fixed = parseFloat(fixedIncomeInput.value) || 0;
            const core = parseFloat(coreInput.value) || 0;
            const explore = parseFloat(exploreInput.value) || 0;
            const protect = parseFloat(protectInput.value) || 0;
            
            if (fixed < 0 || fixed > 100) {
                return 'Renta fija debe estar entre 0 y 100%';
            }
            
            const totalEquity = core + explore + protect;
            const expectedEquity = 100 - fixed;
            
            if (Math.abs(totalEquity - expectedEquity) > 0.1) {
                return `La suma de Core + Explore + Protect debe ser ${expectedEquity.toFixed(1)}%`;
            }
            
            return null;
        };

        // Save composition
        saveBtn.addEventListener('click', () => {
            const error = validateComposition();
            
            if (error) {
                validationMsg.textContent = error;
                validationMsg.style.color = '#f44336';
                return;
            }
            
            this.composition = {
                fixedIncome: parseFloat(fixedIncomeInput.value),
                equity: parseFloat(equityInput.value),
                core: parseFloat(coreInput.value),
                explore: parseFloat(exploreInput.value),
                protect: parseFloat(protectInput.value)
            };
            
            this.saveComposition();
            this.updateCompositionDisplay();
            this.calculateDistribution();
            
            validationMsg.textContent = '✅ Composición guardada exitosamente';
            validationMsg.style.color = '#4CAF50';
            
            setTimeout(() => {
                validationMsg.textContent = '';
            }, 3000);
        });

        // Preset portfolios
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = btn.dataset.preset;
                let config = {};

                switch(preset) {
                    case 'conservative':
                        config = { fixed: 70, core: 21, explore: 4.5, protect: 4.5 };
                        break;
                    case 'balanced':
                        config = { fixed: 40, core: 42, explore: 9, protect: 9 };
                        break;
                    case 'growth':
                        config = { fixed: 20, core: 56, explore: 12, protect: 12 };
                        break;
                    case 'aggressive':
                        config = { fixed: 5, core: 66.5, explore: 14.25, protect: 14.25 };
                        break;
                }

                fixedIncomeInput.value = config.fixed;
                equityInput.value = 100 - config.fixed;
                coreInput.value = config.core;
                exploreInput.value = config.explore;
                protectInput.value = config.protect;
            });
        });
    }

    setupInvestmentCalculator() {
        const investmentInput = document.getElementById('investmentAmount');
        const calculateBtn = document.getElementById('calculateBtn');

        if (investmentInput) {
            investmentInput.addEventListener('input', (e) => {
                this.investmentAmount = parseFloat(e.target.value) || 0;
            });
        }

        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => {
                this.calculateDistribution();
            });
        }

        // Update ticker selections
        ['fixedIncomeTicker', 'coreTicker', 'exploreTicker', 'protectTicker'].forEach(id => {
            const select = document.getElementById(id);
            if (select) {
                select.addEventListener('change', () => {
                    this.saveSelectedTickers();
                    this.calculateDistribution();
                });
            }
        });
    }

    loadSavedData() {
        const savedAmount = localStorage.getItem('investmentAmount');
        if (savedAmount) {
            this.investmentAmount = parseFloat(savedAmount);
            document.getElementById('investmentAmount').value = this.investmentAmount;
        }

        const savedTickers = localStorage.getItem('selectedTickers');
        if (savedTickers) {
            const tickers = JSON.parse(savedTickers);
            if (tickers.fixedIncome) document.getElementById('fixedIncomeTicker').value = tickers.fixedIncome;
            if (tickers.core) document.getElementById('coreTicker').value = tickers.core;
            if (tickers.explore) document.getElementById('exploreTicker').value = tickers.explore;
            if (tickers.protect) document.getElementById('protectTicker').value = tickers.protect;
        }
    }

    saveSelectedTickers() {
        const tickers = {
            fixedIncome: document.getElementById('fixedIncomeTicker').value,
            core: document.getElementById('coreTicker').value,
            explore: document.getElementById('exploreTicker').value,
            protect: document.getElementById('protectTicker').value
        };
        localStorage.setItem('selectedTickers', JSON.stringify(tickers));
    }

    updateCompositionDisplay() {
        // Update composition display
        const portfolioComposition = document.getElementById('portfolioComposition');
        if (portfolioComposition) {
            portfolioComposition.innerHTML = `
                <div class="composition-summary">
                    <h2>Composición del Portfolio</h2>
                    <div class="composition-grid">
                        <div class="comp-item">
                            <span class="comp-label">Renta Fija:</span>
                            <span class="comp-value">${this.composition.fixedIncome}%</span>
                        </div>
                        <div class="comp-item">
                            <span class="comp-label">Renta Variable:</span>
                            <span class="comp-value">${this.composition.equity}%</span>
                        </div>
                        <div class="comp-item sub-item">
                            <span class="comp-label">→ Core:</span>
                            <span class="comp-value">${this.composition.core}%</span>
                        </div>
                        <div class="comp-item sub-item">
                            <span class="comp-label">→ Explore:</span>
                            <span class="comp-value">${this.composition.explore}%</span>
                        </div>
                        <div class="comp-item sub-item">
                            <span class="comp-label">→ Protect:</span>
                            <span class="comp-value">${this.composition.protect}%</span>
                        </div>
                    </div>
                </div>

                <div class="investment-distribution">
                    <h2>Distribución de Inversión</h2>
                    <table id="distributionTable">
                        <thead>
                            <tr>
                                <th>Categoría</th>
                                <th>Ticker</th>
                                <th>%</th>
                                <th>Monto</th>
                                <th>Precio</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="category-row">
                                <td>Renta Fija</td>
                                <td>
                                    <select id="fixedIncomeTicker">
                                        <option value="AGG">AGG</option>
                                        <option value="BND">BND</option>
                                        <option value="TLT">TLT</option>
                                        <option value="IEF">IEF</option>
                                    </select>
                                </td>
                                <td>${this.composition.fixedIncome}%</td>
                                <td class="amount">$0.00</td>
                                <td class="price">$0.00</td>
                                <td class="shares">0.00</td>
                            </tr>
                            <tr class="category-header">
                                <td colspan="6"><strong>Renta Variable (${this.composition.equity}%)</strong></td>
                            </tr>
                            <tr>
                                <td class="sub-category">Core</td>
                                <td>
                                    <select id="coreTicker">
                                        <option value="IVV">IVV</option>
                                        <option value="SPY">SPY</option>
                                        <option value="VOO">VOO</option>
                                        <option value="SPLG">SPLG</option>
                                        <option value="VTI">VTI</option>
                                    </select>
                                </td>
                                <td>${this.composition.core}%</td>
                                <td class="amount">$0.00</td>
                                <td class="price">$0.00</td>
                                <td class="shares">0.00</td>
                            </tr>
                            <tr>
                                <td class="sub-category">Explore</td>
                                <td>
                                    <select id="exploreTicker">
                                        <option value="QQQ">QQQ</option>
                                        <option value="ARKK">ARKK</option>
                                        <option value="VGT">VGT</option>
                                        <option value="XLK">XLK</option>
                                    </select>
                                </td>
                                <td>${this.composition.explore}%</td>
                                <td class="amount">$0.00</td>
                                <td class="price">$0.00</td>
                                <td class="shares">0.00</td>
                            </tr>
                            <tr>
                                <td class="sub-category">Protect</td>
                                <td>
                                    <select id="protectTicker">
                                        <option value="XLP">XLP</option>
                                        <option value="XLU">XLU</option>
                                        <option value="VIG">VIG</option>
                                        <option value="DVY">DVY</option>
                                    </select>
                                </td>
                                <td>${this.composition.protect}%</td>
                                <td class="amount">$0.00</td>
                                <td class="price">$0.00</td>
                                <td class="shares">0.00</td>
                            </tr>
                            <tr class="total-row">
                                <td colspan="3"><strong>Total</strong></td>
                                <td class="amount"><strong id="totalInvestment">$0.00</strong></td>
                                <td colspan="2"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;

            // Re-setup event listeners for new elements
            this.setupInvestmentCalculator();
        }

        // Update form inputs if they exist
        const fixedIncomeInput = document.getElementById('fixedIncomeInput');
        if (fixedIncomeInput) fixedIncomeInput.value = this.composition.fixedIncome;
        
        const equityInput = document.getElementById('equityInput');
        if (equityInput) equityInput.value = this.composition.equity;
        
        const coreInput = document.getElementById('coreInput');
        if (coreInput) coreInput.value = this.composition.core;
        
        const exploreInput = document.getElementById('exploreInput');
        if (exploreInput) exploreInput.value = this.composition.explore;
        
        const protectInput = document.getElementById('protectInput');
        if (protectInput) protectInput.value = this.composition.protect;
    }

    async calculateDistribution() {
        if (!this.investmentAmount || this.investmentAmount <= 0) {
            return;
        }

        const fixedTicker = document.getElementById('fixedIncomeTicker');
        const coreTicker = document.getElementById('coreTicker');
        const exploreTicker = document.getElementById('exploreTicker');
        const protectTicker = document.getElementById('protectTicker');
        const table = document.getElementById('distributionTable');

        if (!fixedTicker || !coreTicker || !exploreTicker || !protectTicker || !table) {
            return;
        }

        localStorage.setItem('investmentAmount', this.investmentAmount.toString());

        const tickers = {
            fixedIncome: fixedTicker.value,
            core: coreTicker.value,
            explore: exploreTicker.value,
            protect: protectTicker.value
        };

        // Get prices for selected tickers
        await this.fetchTickerPrices([tickers.fixedIncome, tickers.core, tickers.explore, tickers.protect]);

        const distributions = [
            {
                category: 'Renta Fija',
                ticker: tickers.fixedIncome,
                percentage: this.composition.fixedIncome,
                row: 0
            },
            {
                category: 'Core',
                ticker: tickers.core,
                percentage: this.composition.core,
                row: 2
            },
            {
                category: 'Explore',
                ticker: tickers.explore,
                percentage: this.composition.explore,
                row: 3
            },
            {
                category: 'Protect',
                ticker: tickers.protect,
                percentage: this.composition.protect,
                row: 4
            }
        ];

        const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

        distributions.forEach(dist => {
            const row = rows[dist.row];
            const amount = (this.investmentAmount * dist.percentage / 100);
            const price = this.tickerPrices[dist.ticker] || this.getEstimatedPrice(dist.ticker);
            const shares = amount / price;

            row.cells[2].textContent = `${dist.percentage}%`;
            row.cells[3].textContent = `$${amount.toFixed(2)}`;
            row.cells[4].textContent = `$${price.toFixed(2)}`;
            row.cells[5].textContent = shares.toFixed(2);
        });

        document.getElementById('totalInvestment').textContent = `$${this.investmentAmount.toFixed(2)}`;
    }

    async fetchTickerPrices(tickers) {
        // Use cached prices from main app if available
        for (let ticker of tickers) {
            if (!this.tickerPrices[ticker]) {
                this.tickerPrices[ticker] = this.getEstimatedPrice(ticker);
            }
        }
    }

    getEstimatedPrice(ticker) {
        // Use the same stable pricing system as the main app
        if (typeof portfolio !== 'undefined' && portfolio.getStableTickerData) {
            return parseFloat(portfolio.getStableTickerData(ticker).price);
        }

        // Fallback static prices if main app not available
        return PRICE_TABLE[ticker] || 150; // Default more realistic price
    }

    updatePricesFromMarket(tickerData) {
        // This method can be called from app.js to update prices
        if (tickerData.symbol && tickerData.price) {
            this.tickerPrices[tickerData.symbol] = parseFloat(tickerData.price);
            // Recalculate if this ticker is selected
            const selectedTickers = [
                document.getElementById('fixedIncomeTicker').value,
                document.getElementById('coreTicker').value,
                document.getElementById('exploreTicker').value,
                document.getElementById('protectTicker').value
            ];
            if (selectedTickers.includes(tickerData.symbol)) {
                this.calculateDistribution();
            }
        }
    }
}

// Initialize portfolio manager
const portfolioManager = new PortfolioManager();
