class AIPortfolioAssistant {
    constructor() {
        this.analysisCache = new Map();
        this.recommendations = [];
    }

    analyzeUserProfile(questionnaire) {
        const profile = this.determineRiskProfile(questionnaire);
        const recommendations = this.generateRecommendations(profile);
        
        return {
            profile,
            recommendations,
            analysis: this.generateAnalysis(profile, questionnaire)
        };
    }

    determineRiskProfile(answers) {
        let riskScore = 0;
        let timeHorizon = 1;
        
        // Análisis de respuestas
        if (answers.age) {
            if (answers.age < 30) riskScore += 3;
            else if (answers.age < 45) riskScore += 2;
            else if (answers.age < 60) riskScore += 1;
            else riskScore += 0;
        }
        
        if (answers.experience) {
            switch(answers.experience) {
                case 'beginner': riskScore += 0; break;
                case 'intermediate': riskScore += 1; break;
                case 'advanced': riskScore += 2; break;
                case 'expert': riskScore += 3; break;
            }
        }
        
        if (answers.timeHorizon) {
            timeHorizon = parseInt(answers.timeHorizon);
            if (timeHorizon >= 10) riskScore += 3;
            else if (timeHorizon >= 5) riskScore += 2;
            else if (timeHorizon >= 2) riskScore += 1;
        }
        
        if (answers.volatilityTolerance) {
            switch(answers.volatilityTolerance) {
                case 'very-low': riskScore += 0; break;
                case 'low': riskScore += 1; break;
                case 'medium': riskScore += 2; break;
                case 'high': riskScore += 3; break;
                case 'very-high': riskScore += 4; break;
            }
        }
        
        if (answers.primaryGoal) {
            switch(answers.primaryGoal) {
                case 'capital-preservation': riskScore += 0; break;
                case 'income': riskScore += 1; break;
                case 'balanced': riskScore += 2; break;
                case 'growth': riskScore += 3; break;
                case 'aggressive-growth': riskScore += 4; break;
            }
        }
        
        // Determinar perfil basado en score
        let profileType = 'conservative';
        if (riskScore >= 15) profileType = 'aggressive';
        else if (riskScore >= 12) profileType = 'growth';
        else if (riskScore >= 8) profileType = 'balanced';
        else if (riskScore >= 5) profileType = 'dividend-income';
        
        return {
            type: profileType,
            score: riskScore,
            timeHorizon,
            characteristics: this.getProfileCharacteristics(profileType)
        };
    }

    getProfileCharacteristics(profileType) {
        const characteristics = {
            'conservative': {
                riskLevel: 'Bajo',
                expectedReturn: '4-6% anual',
                volatility: 'Baja (5-10%)',
                suitableFor: 'Preservación capital, jubilados, plazo corto'
            },
            'dividend-income': {
                riskLevel: 'Medio-Bajo',
                expectedReturn: '5-7% anual',
                volatility: 'Media (8-15%)',
                suitableFor: 'Ingresos regulares, semi-jubilados'
            },
            'balanced': {
                riskLevel: 'Medio',
                expectedReturn: '6-8% anual',
                volatility: 'Media (10-18%)',
                suitableFor: 'Equilibrio crecimiento-estabilidad'
            },
            'growth': {
                riskLevel: 'Medio-Alto',
                expectedReturn: '7-10% anual',
                volatility: 'Alta (15-25%)',
                suitableFor: 'Crecimiento largo plazo, adultos jóvenes'
            },
            'aggressive': {
                riskLevel: 'Alto',
                expectedReturn: '8-12% anual',
                volatility: 'Muy Alta (20-35%)',
                suitableFor: 'Máximo crecimiento, alta tolerancia riesgo'
            }
        };
        
        return characteristics[profileType] || characteristics.balanced;
    }

    generateRecommendations(userProfile) {
        const recommendations = tickerDB.getRecommendedTickers(userProfile.type, 10000);
        
        // Agregar análisis personalizado para cada recomendación
        const enhancedRecommendations = recommendations.map(rec => {
            const analysis = this.analyzeTickerFit(rec, userProfile);
            return {
                ...rec,
                aiAnalysis: analysis,
                confidence: this.calculateConfidence(rec, userProfile),
                pros: this.getTickerPros(rec),
                cons: this.getTickerCons(rec),
                alternativeOptions: this.getAlternatives(rec)
            };
        });

        return enhancedRecommendations;
    }

    analyzeTickerFit(ticker, userProfile) {
        const sector = tickerDB.getSectorInfo(ticker.sectorId);
        let analysis = `${ticker.symbol} es adecuado para tu perfil ${userProfile.type} porque:\n`;
        
        // Análisis basado en características del sector
        if (sector) {
            analysis += `• Sector ${sector.name}: ${sector.description}\n`;
            analysis += `• Nivel de riesgo: ${sector.riskLevel}\n`;
            analysis += `• Volatilidad esperada: ${sector.volatility}\n`;
            analysis += `• Rendimiento por dividendos: ${sector.dividendYield}\n`;
        }
        
        // Análisis específico del ticker
        if (ticker.expense <= 0.10) {
            analysis += `• Expense ratio muy competitivo (${ticker.expense}%)\n`;
        } else if (ticker.expense <= 0.20) {
            analysis += `• Expense ratio razonable (${ticker.expense}%)\n`;
        } else {
            analysis += `• Expense ratio elevado (${ticker.expense}%) - considera alternativas\n`;
        }
        
        return analysis;
    }

    calculateConfidence(ticker, userProfile) {
        let confidence = 70; // Base confidence
        
        // Ajustar por expense ratio
        if (ticker.expense <= 0.05) confidence += 15;
        else if (ticker.expense <= 0.15) confidence += 5;
        else if (ticker.expense > 0.50) confidence -= 20;
        
        // Ajustar por match de perfil
        const profileAllocation = tickerDB.getProfileInfo(userProfile.type);
        if (profileAllocation && profileAllocation.allocation[ticker.sectorId]) {
            const allocation = profileAllocation.allocation[ticker.sectorId];
            if (allocation >= 20) confidence += 10;
            else if (allocation >= 10) confidence += 5;
        }
        
        return Math.min(95, Math.max(40, confidence));
    }

    getTickerPros(ticker) {
        const pros = [];
        
        if (ticker.expense <= 0.05) {
            pros.push('Expense ratio muy bajo');
        }
        
        if (ticker.name.includes('Vanguard')) {
            pros.push('Gestora reconocida por costos bajos');
        }
        
        if (ticker.name.includes('Core')) {
            pros.push('ETF de amplia diversificación');
        }
        
        const sector = tickerDB.getSectorInfo(ticker.sectorId);
        if (sector) {
            if (sector.riskLevel === 'Bajo') {
                pros.push('Sector de bajo riesgo');
            }
            if (sector.dividendYield.includes('3.') || sector.dividendYield.includes('4.')) {
                pros.push('Buenos dividendos');
            }
        }
        
        return pros.length > 0 ? pros : ['ETF bien establecido', 'Buena liquidez'];
    }

    getTickerCons(ticker) {
        const cons = [];
        
        if (ticker.expense > 0.30) {
            cons.push('Expense ratio elevado');
        }
        
        const sector = tickerDB.getSectorInfo(ticker.sectorId);
        if (sector) {
            if (sector.volatility === 'Muy Alta') {
                cons.push('Alta volatilidad esperada');
            }
            if (sector.riskLevel === 'Alto') {
                cons.push('Sector de alto riesgo');
            }
        }
        
        if (ticker.sectorId === 'energia') {
            cons.push('Sector cíclico y volátil');
        }
        
        return cons.length > 0 ? cons : ['Considerar diversificación adicional'];
    }

    getAlternatives(ticker) {
        const sector = tickerDB.getSectorInfo(ticker.sectorId);
        if (!sector) return [];
        
        return sector.tickers
            .filter(t => t.symbol !== ticker.symbol)
            .slice(0, 2)
            .map(t => ({
                symbol: t.symbol,
                name: t.name,
                reason: `Expense ratio: ${t.expense}%`
            }));
    }

    generateMarketInsights() {
        const analysis = tickerDB.getMarketAnalysis();
        
        return {
            marketPhase: analysis.conditions.marketPhase,
            keyInsights: [
                'El mercado está en fase de expansión, favoreciendo sectores cíclicos',
                'Tasas de interés neutrales benefician al sector financiero',
                'La innovación tecnológica continúa impulsando el sector tech',
                'Los servicios básicos muestran menor atractivo relativo'
            ],
            sectorRecommendations: analysis.recommendations,
            rationale: analysis.rationale
        };
    }

    generatePersonalizedTips(userProfile, currentPortfolio = []) {
        const tips = [];
        
        // Tips basados en el perfil
        switch(userProfile.type) {
            case 'conservative':
                tips.push('Considera rebalancear trimestralmente para mantener la asignación objetivo');
                tips.push('Los bonos del tesoro pueden ofrecer estabilidad adicional');
                break;
            case 'balanced':
                tips.push('Revisa tu portfolio semestralmente para mantener el equilibrio');
                tips.push('Considera dollar-cost averaging para reducir el riesgo temporal');
                break;
            case 'growth':
                tips.push('Mantén al menos 6 meses de gastos en efectivo antes de invertir');
                tips.push('La diversificación internacional puede reducir el riesgo');
                break;
            case 'aggressive':
                tips.push('Ten paciencia - los portfolios agresivos requieren tiempo para mostrar resultados');
                tips.push('Considera mantener algo de exposición a mercados emergentes');
                break;
        }
        
        // Tips generales
        tips.push('Revisa los expense ratios regularmente - las diferencias se acumulan');
        tips.push('No intentes hacer timing del mercado - la consistencia es clave');
        
        return tips;
    }

    simulateScenarios(portfolio, scenarios = ['bull', 'bear', 'sideways']) {
        const results = {};
        
        scenarios.forEach(scenario => {
            let expectedReturn = 0;
            
            switch(scenario) {
                case 'bull':
                    expectedReturn = 0.12; // 12% anual
                    break;
                case 'bear':
                    expectedReturn = -0.15; // -15% anual
                    break;
                case 'sideways':
                    expectedReturn = 0.03; // 3% anual
                    break;
            }
            
            results[scenario] = {
                expectedReturn: expectedReturn * 100,
                description: this.getScenarioDescription(scenario),
                recommendation: this.getScenarioRecommendation(scenario)
            };
        });
        
        return results;
    }

    getScenarioDescription(scenario) {
        const descriptions = {
            'bull': 'Mercado alcista: Crecimiento económico fuerte, confianza alta',
            'bear': 'Mercado bajista: Recesión económica, alta volatilidad',
            'sideways': 'Mercado lateral: Crecimiento moderado, volatilidad normal'
        };
        return descriptions[scenario] || 'Escenario neutral';
    }

    getScenarioRecommendation(scenario) {
        const recommendations = {
            'bull': 'Mantén la estrategia, considera rebalancear si hay desviaciones grandes',
            'bear': 'No entres en pánico, considera oportunidades de compra si tienes liquidez',
            'sideways': 'Enfócate en ingresos por dividendos y rebalanceo regular'
        };
        return recommendations[scenario] || 'Mantén la disciplina de inversión';
    }
}

const aiAssistant = new AIPortfolioAssistant();