class TickerDatabase {
    constructor() {
        this.sectors = this.initializeSectors();
        this.profiles = this.initializeProfiles();
    }

    initializeSectors() {
        return {
            'bienes-raices': {
                name: 'Bienes Raíces',
                code: 'REITs',
                tickers: [
                    { symbol: 'IYR', name: 'iShares U.S. Real Estate ETF', expense: 0.42, type: 'ETF' },
                    { symbol: 'VNQ', name: 'Vanguard Real Estate ETF', expense: 0.12, type: 'ETF' },
                    { symbol: 'XLRE', name: 'Real Estate Select Sector SPDR Fund', expense: 0.10, type: 'ETF' },
                    { symbol: 'REET', name: 'iShares Global REIT ETF', expense: 0.14, type: 'ETF' },
                    { symbol: 'SCHH', name: 'Schwab US REIT ETF', expense: 0.07, type: 'ETF' }
                ],
                description: 'Sector inmobiliario incluyendo REITs, empresas de desarrollo y gestión inmobiliaria',
                riskLevel: 'Medio-Alto',
                volatility: 'Alta',
                dividendYield: '3.5-5.0%'
            },
            'comunicaciones': {
                name: 'Comunicaciones',
                code: 'COMM',
                tickers: [
                    { symbol: 'IYZ', name: 'iShares U.S. Telecommunications ETF', expense: 0.42, type: 'ETF' },
                    { symbol: 'VOX', name: 'Vanguard Communication Services ETF', expense: 0.10, type: 'ETF' },
                    { symbol: 'XLC', name: 'Communication Services Select Sector SPDR Fund', expense: 0.10, type: 'ETF' }
                ],
                description: 'Servicios de comunicación, telecomunicaciones, medios y entretenimiento',
                riskLevel: 'Medio',
                volatility: 'Media',
                dividendYield: '1.5-3.0%'
            },
            'consumo-basico': {
                name: 'Consumo Básico',
                code: 'STPL',
                tickers: [
                    { symbol: 'IYK', name: 'iShares U.S. Consumer Staples ETF', expense: 0.42, type: 'ETF' },
                    { symbol: 'VDC', name: 'Vanguard Consumer Staples ETF', expense: 0.10, type: 'ETF' },
                    { symbol: 'XLP', name: 'Consumer Staples Select Sector SPDR Fund', expense: 0.10, type: 'ETF' }
                ],
                description: 'Productos de primera necesidad: alimentos, bebidas, productos del hogar',
                riskLevel: 'Bajo',
                volatility: 'Baja',
                dividendYield: '2.5-3.5%'
            },
            'consumo-discrecional': {
                name: 'Consumo Discrecional',
                code: 'DISC',
                tickers: [
                    { symbol: 'IYC', name: 'iShares U.S. Consumer Discretionary ETF', expense: 0.42, type: 'ETF' },
                    { symbol: 'VCR', name: 'Vanguard Consumer Discretionary ETF', expense: 0.10, type: 'ETF' },
                    { symbol: 'XLY', name: 'Consumer Discretionary Select Sector SPDR Fund', expense: 0.10, type: 'ETF' }
                ],
                description: 'Bienes y servicios no esenciales: retail, restaurantes, automóviles, lujo',
                riskLevel: 'Medio-Alto',
                volatility: 'Alta',
                dividendYield: '1.0-2.5%'
            },
            'energia': {
                name: 'Energía',
                code: 'ENRG',
                tickers: [
                    { symbol: 'IYE', name: 'iShares U.S. Energy ETF', expense: 0.42, type: 'ETF' },
                    { symbol: 'VDE', name: 'Vanguard Energy ETF', expense: 0.10, type: 'ETF' },
                    { symbol: 'XLE', name: 'Energy Select Sector SPDR Fund', expense: 0.10, type: 'ETF' }
                ],
                description: 'Petróleo, gas natural, energías renovables y servicios energéticos',
                riskLevel: 'Alto',
                volatility: 'Muy Alta',
                dividendYield: '4.0-6.0%'
            },
            'finanzas': {
                name: 'Finanzas',
                code: 'FINL',
                tickers: [
                    { symbol: 'IYF', name: 'iShares U.S. Financials ETF', expense: 0.42, type: 'ETF' },
                    { symbol: 'VFH', name: 'Vanguard Financials ETF', expense: 0.10, type: 'ETF' },
                    { symbol: 'XLF', name: 'Financial Select Sector SPDR Fund', expense: 0.10, type: 'ETF' }
                ],
                description: 'Bancos, seguros, servicios financieros e inversiones',
                riskLevel: 'Medio-Alto',
                volatility: 'Alta',
                dividendYield: '2.5-4.0%'
            },
            'industria': {
                name: 'Industria',
                code: 'INDL',
                tickers: [
                    { symbol: 'IYJ', name: 'iShares U.S. Industrials ETF', expense: 0.42, type: 'ETF' },
                    { symbol: 'VIS', name: 'Vanguard Industrials ETF', expense: 0.10, type: 'ETF' },
                    { symbol: 'XLI', name: 'Industrial Select Sector SPDR Fund', expense: 0.10, type: 'ETF' }
                ],
                description: 'Manufacturing, transporte, construcción, maquinaria y defensa',
                riskLevel: 'Medio',
                volatility: 'Media-Alta',
                dividendYield: '1.8-2.8%'
            },
            'materiales': {
                name: 'Materiales',
                code: 'MATL',
                tickers: [
                    { symbol: 'IYM', name: 'iShares U.S. Basic Materials ETF', expense: 0.42, type: 'ETF' },
                    { symbol: 'VAW', name: 'Vanguard Materials ETF', expense: 0.10, type: 'ETF' },
                    { symbol: 'XLB', name: 'Materials Select Sector SPDR Fund', expense: 0.10, type: 'ETF' }
                ],
                description: 'Minería, químicos, metales, papel y materiales de construcción',
                riskLevel: 'Medio-Alto',
                volatility: 'Alta',
                dividendYield: '2.0-3.0%'
            },
            'salud': {
                name: 'Salud',
                code: 'HLTH',
                tickers: [
                    { symbol: 'IYH', name: 'iShares U.S. Healthcare ETF', expense: 0.42, type: 'ETF' },
                    { symbol: 'VHT', name: 'Vanguard Health Care ETF', expense: 0.10, type: 'ETF' },
                    { symbol: 'XLV', name: 'Health Care Select Sector SPDR Fund', expense: 0.10, type: 'ETF' }
                ],
                description: 'Farmacéuticas, biotecnología, equipos médicos y servicios de salud',
                riskLevel: 'Medio',
                volatility: 'Media',
                dividendYield: '1.5-2.5%'
            },
            'servicios-basicos': {
                name: 'Servicios Básicos',
                code: 'UTIL',
                tickers: [
                    { symbol: 'IDU', name: 'iShares U.S. Utilities ETF', expense: 0.42, type: 'ETF' },
                    { symbol: 'VPU', name: 'Vanguard Utilities ETF', expense: 0.10, type: 'ETF' },
                    { symbol: 'XLU', name: 'Utilities Select Sector SPDR Fund', expense: 0.10, type: 'ETF' }
                ],
                description: 'Electricidad, gas, agua y servicios públicos esenciales',
                riskLevel: 'Bajo',
                volatility: 'Baja',
                dividendYield: '3.0-4.5%'
            },
            'tecnologia': {
                name: 'Tecnología',
                code: 'TECH',
                tickers: [
                    { symbol: 'IYW', name: 'iShares U.S. Technology ETF', expense: 0.42, type: 'ETF' },
                    { symbol: 'VGT', name: 'Vanguard Information Technology ETF', expense: 0.10, type: 'ETF' },
                    { symbol: 'XLK', name: 'Technology Select Sector SPDR Fund', expense: 0.10, type: 'ETF' },
                    { symbol: 'QQQ', name: 'Invesco QQQ Trust ETF', expense: 0.20, type: 'ETF' },
                    { symbol: 'ARKK', name: 'ARK Innovation ETF', expense: 0.75, type: 'ETF' }
                ],
                description: 'Software, hardware, semiconductores, internet y servicios tecnológicos',
                riskLevel: 'Alto',
                volatility: 'Muy Alta',
                dividendYield: '0.5-1.5%'
            },
            'core-broad': {
                name: 'Mercado Total (Core)',
                code: 'CORE',
                tickers: [
                    { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', expense: 0.09, type: 'ETF' },
                    { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', expense: 0.03, type: 'ETF' },
                    { symbol: 'IVV', name: 'iShares Core S&P 500 ETF', expense: 0.03, type: 'ETF' },
                    { symbol: 'SPLG', name: 'SPDR Portfolio S&P 500 ETF', expense: 0.02, type: 'ETF' },
                    { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', expense: 0.03, type: 'ETF' },
                    { symbol: 'ITOT', name: 'iShares Core S&P Total U.S. Stock Market ETF', expense: 0.03, type: 'ETF' }
                ],
                description: 'ETFs diversificados que representan el mercado estadounidense completo',
                riskLevel: 'Medio',
                volatility: 'Media',
                dividendYield: '1.2-1.8%'
            },
            'bonos': {
                name: 'Renta Fija',
                code: 'BOND',
                tickers: [
                    { symbol: 'AGG', name: 'iShares Core U.S. Aggregate Bond ETF', expense: 0.03, type: 'ETF' },
                    { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', expense: 0.03, type: 'ETF' },
                    { symbol: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF', expense: 0.15, type: 'ETF' },
                    { symbol: 'IEF', name: 'iShares 7-10 Year Treasury Bond ETF', expense: 0.15, type: 'ETF' },
                    { symbol: 'LQD', name: 'iShares iBoxx Investment Grade Corporate Bond ETF', expense: 0.14, type: 'ETF' }
                ],
                description: 'Bonos del gobierno y corporativos para estabilidad y ingresos',
                riskLevel: 'Bajo',
                volatility: 'Baja',
                dividendYield: '3.0-4.5%'
            }
        };
    }

    initializeProfiles() {
        return {
            'conservative': {
                name: 'Conservador',
                description: 'Enfoque en preservación de capital con crecimiento estable',
                riskTolerance: 'Bajo',
                timeHorizon: '1-3 años',
                allocation: {
                    'bonos': 70,
                    'core-broad': 20,
                    'servicios-basicos': 5,
                    'consumo-basico': 5
                },
                characteristics: ['Baja volatilidad', 'Ingresos regulares', 'Preservación capital']
            },
            'balanced': {
                name: 'Balanceado',
                description: 'Equilibrio entre crecimiento y estabilidad',
                riskTolerance: 'Medio',
                timeHorizon: '3-7 años',
                allocation: {
                    'bonos': 40,
                    'core-broad': 35,
                    'tecnologia': 8,
                    'salud': 7,
                    'finanzas': 5,
                    'consumo-basico': 5
                },
                characteristics: ['Diversificación sectorial', 'Crecimiento moderado', 'Volatilidad controlada']
            },
            'growth': {
                name: 'Crecimiento',
                description: 'Enfoque en crecimiento a largo plazo',
                riskTolerance: 'Medio-Alto',
                timeHorizon: '5-10 años',
                allocation: {
                    'bonos': 20,
                    'core-broad': 30,
                    'tecnologia': 20,
                    'consumo-discrecional': 10,
                    'salud': 10,
                    'finanzas': 5,
                    'industria': 5
                },
                characteristics: ['Alto potencial crecimiento', 'Volatilidad moderada-alta', 'Diversificación sectorial']
            },
            'aggressive': {
                name: 'Agresivo',
                description: 'Máximo potencial de crecimiento con alta volatilidad',
                riskTolerance: 'Alto',
                timeHorizon: '7-15+ años',
                allocation: {
                    'bonos': 5,
                    'core-broad': 25,
                    'tecnologia': 30,
                    'consumo-discrecional': 15,
                    'finanzas': 10,
                    'industria': 8,
                    'materiales': 4,
                    'energia': 3
                },
                characteristics: ['Máximo potencial crecimiento', 'Alta volatilidad', 'Concentración en crecimiento']
            },
            'sector-rotation': {
                name: 'Rotación Sectorial',
                description: 'Estrategia activa basada en ciclos económicos',
                riskTolerance: 'Alto',
                timeHorizon: '3-7 años',
                allocation: {
                    'bonos': 10,
                    'core-broad': 20,
                    'tecnologia': 15,
                    'finanzas': 15,
                    'industria': 12,
                    'energia': 10,
                    'materiales': 8,
                    'consumo-discrecional': 10
                },
                characteristics: ['Estrategia activa', 'Exposición cíclica', 'Requiere monitoreo']
            },
            'dividend-income': {
                name: 'Ingresos por Dividendos',
                description: 'Enfoque en generación de ingresos regulares',
                riskTolerance: 'Medio',
                timeHorizon: '3-10 años',
                allocation: {
                    'bonos': 30,
                    'core-broad': 20,
                    'servicios-basicos': 15,
                    'consumo-basico': 12,
                    'finanzas': 10,
                    'bienes-raices': 8,
                    'energia': 5
                },
                characteristics: ['Alto rendimiento dividendos', 'Ingresos regulares', 'Menor volatilidad']
            }
        };
    }

    getSectorInfo(sectorId) {
        return this.sectors[sectorId] || null;
    }

    getProfileInfo(profileId) {
        return this.profiles[profileId] || null;
    }

    getAllSectors() {
        return Object.keys(this.sectors).map(id => ({
            id,
            ...this.sectors[id]
        }));
    }

    getAllProfiles() {
        return Object.keys(this.profiles).map(id => ({
            id,
            ...this.profiles[id]
        }));
    }

    getTickersBySector(sectorId) {
        const sector = this.getSectorInfo(sectorId);
        return sector ? sector.tickers : [];
    }

    getRecommendedTickers(profileId, amount = 10000) {
        const profile = this.getProfileInfo(profileId);
        if (!profile) return [];

        const recommendations = [];
        
        Object.entries(profile.allocation).forEach(([sectorId, percentage]) => {
            const sector = this.getSectorInfo(sectorId);
            if (sector && sector.tickers.length > 0) {
                // Recomendar el ticker con menor expense ratio
                const bestTicker = sector.tickers.reduce((best, current) => 
                    current.expense < best.expense ? current : best
                );
                
                const allocationAmount = (amount * percentage / 100);
                
                recommendations.push({
                    ...bestTicker,
                    sector: sector.name,
                    sectorId,
                    percentage,
                    recommendedAmount: allocationAmount,
                    reason: `Menor expense ratio (${bestTicker.expense}%) en sector ${sector.name}`
                });
            }
        });

        return recommendations.sort((a, b) => b.percentage - a.percentage);
    }

    searchTickers(query) {
        const results = [];
        const lowerQuery = query.toLowerCase();
        
        Object.entries(this.sectors).forEach(([sectorId, sector]) => {
            sector.tickers.forEach(ticker => {
                if (ticker.symbol.toLowerCase().includes(lowerQuery) ||
                    ticker.name.toLowerCase().includes(lowerQuery) ||
                    sector.name.toLowerCase().includes(lowerQuery)) {
                    results.push({
                        ...ticker,
                        sector: sector.name,
                        sectorId
                    });
                }
            });
        });
        
        return results;
    }

    getMarketAnalysis() {
        const currentConditions = {
            marketPhase: 'Expansión',
            interestRateEnvironment: 'Neutral',
            inflationTrend: 'Moderada',
            economicCycle: 'Mid-Cycle'
        };

        const recommendations = {
            overweight: ['tecnologia', 'finanzas', 'industria'],
            neutral: ['core-broad', 'salud', 'consumo-discrecional'],
            underweight: ['energia', 'materiales', 'servicios-basicos']
        };

        return {
            conditions: currentConditions,
            recommendations,
            rationale: {
                'tecnologia': 'Beneficiado por innovación continua y digitalización',
                'finanzas': 'Favorable por tasas de interés neutrales',
                'industria': 'Crecimiento económico sostenido impulsa demanda',
                'energia': 'Volatilidad de precios commodities',
                'materiales': 'Sensible a ciclos económicos',
                'servicios-basicos': 'Menor atractivo en entorno de crecimiento'
            }
        };
    }
}

const tickerDB = new TickerDatabase();