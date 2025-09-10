class OpenAIAssistant {
    constructor() {
        this.apiKey = null; // Set via setApiKey() method for security
        this.baseURL = 'https://api.openai.com/v1/chat/completions';
        this.chatHistory = [];
        this.userContext = null;
    }

    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    async makeOpenAIRequest(messages, temperature = 0.7) {
        if (!this.apiKey) {
            throw new Error('OpenAI API key not configured.');
        }

        try {
            const response = await fetch(this.baseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: messages,
                    temperature: temperature,
                    max_tokens: 1500
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`OpenAI API error ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Error calling OpenAI API:', error);
            throw error;
        }
    }

    async analyzeUserProfileAdvanced(questionnaire, currentPortfolio = []) {
        const systemPrompt = `Eres un asesor financiero experto especializado en análisis de perfiles de inversión y recomendaciones de ETFs. 
        
        Debes analizar el perfil del usuario basándote en sus respuestas y generar:
        1. Un análisis detallado de su perfil de riesgo
        2. Recomendaciones específicas de ETFs con justificación
        3. Una estrategia de asignación de activos personalizada
        4. Consejos prácticos y específicos
        
        Enfócate en ETFs populares y bien diversificados. Sé específico con porcentajes y tickers.`;

        const userPrompt = `Analiza este perfil de inversión:
        
        PERFIL DEL USUARIO:
        - Edad: ${questionnaire.age}
        - Experiencia: ${questionnaire.experience}
        - Horizonte temporal: ${questionnaire.timeHorizon} años
        - Tolerancia a volatilidad: ${questionnaire.volatilityTolerance}
        - Objetivo principal: ${questionnaire.primaryGoal}
        
        PORTFOLIO ACTUAL: ${currentPortfolio.length > 0 ? currentPortfolio.join(', ') : 'Ninguno'}
        
        Por favor proporciona:
        1. Perfil de riesgo determinado y justificación
        2. Asignación de activos recomendada (% específicos)
        3. 5-7 ETFs recomendados con tickers específicos y razones
        4. 3-5 consejos prácticos personalizados
        
        Formato tu respuesta en JSON con esta estructura:
        {
            "riskProfile": "conservador/moderado/agresivo",
            "riskJustification": "explicación del perfil",
            "assetAllocation": {
                "bonds": "porcentaje",
                "stocks": "porcentaje",
                "international": "porcentaje",
                "alternatives": "porcentaje"
            },
            "recommendations": [
                {
                    "ticker": "SPY",
                    "name": "SPDR S&P 500 ETF",
                    "allocation": "25%",
                    "reasoning": "razón específica"
                }
            ],
            "personalizedTips": ["consejo 1", "consejo 2"],
            "expectedReturn": "rango de retorno esperado",
            "volatilityRange": "rango de volatilidad"
        }`;

        try {
            const response = await this.makeOpenAIRequest([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ], 0.3);

            if (response) {
                // Try to parse JSON response
                try {
                    return JSON.parse(response);
                } catch (parseError) {
                    console.error('Error parsing OpenAI response:', parseError);
                    return this.parseNonJSONResponse(response);
                }
            }
        } catch (error) {
            console.error('Error in OpenAI analysis:', error);
        }

        // Fallback to local analysis if API fails
        return this.fallbackAnalysis(questionnaire);
    }

    parseNonJSONResponse(response) {
        // If OpenAI doesn't return valid JSON, try to extract useful information
        return {
            riskProfile: this.extractRiskProfile(response),
            riskJustification: "Análisis basado en respuesta de IA",
            assetAllocation: {
                bonds: "40%",
                stocks: "60%",
                international: "0%",
                alternatives: "0%"
            },
            recommendations: [
                {
                    ticker: "SPY",
                    name: "SPDR S&P 500 ETF",
                    allocation: "35%",
                    reasoning: "ETF diversificado del S&P 500"
                },
                {
                    ticker: "AGG",
                    name: "iShares Core U.S. Aggregate Bond ETF",
                    allocation: "40%",
                    reasoning: "Exposición a bonos para estabilidad"
                }
            ],
            personalizedTips: [
                "Mantén una estrategia de inversión disciplinada",
                "Rebalancea tu portfolio cada 6 meses",
                "No intentes hacer timing del mercado"
            ],
            expectedReturn: "6-8% anual",
            volatilityRange: "10-15%",
            aiResponse: response
        };
    }

    extractRiskProfile(text) {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('conservador') || lowerText.includes('bajo riesgo')) return 'conservador';
        if (lowerText.includes('agresivo') || lowerText.includes('alto riesgo')) return 'agresivo';
        return 'moderado';
    }

    async getPortfolioReview(currentPortfolio, investmentAmount) {
        const systemPrompt = `Eres un asesor financiero que revisa portfolios de inversión. 
        Analiza el portfolio actual y proporciona recomendaciones específicas de mejora.
        Enfócate en diversificación, costos, y optimización de la asignación de activos.`;

        const tickers = currentPortfolio.map(item => item.symbol || item).join(', ');
        
        const userPrompt = `Revisa este portfolio de inversión:
        
        PORTFOLIO ACTUAL: ${tickers}
        MONTO INVERTIDO: $${investmentAmount}
        
        Proporciona:
        1. Análisis de diversificación actual
        2. Identificación de concentraciones de riesgo
        3. Sugerencias de rebalanceo
        4. ETFs alternativos con menores costos
        5. Score general del portfolio (1-10)
        
        Mantén tus recomendaciones específicas y accionables.`;

        try {
            const response = await this.makeOpenAIRequest([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ], 0.4);

            return response || "No se pudo obtener análisis del portfolio en este momento.";
        } catch (error) {
            console.error('Error in portfolio review:', error);
            return "Error al analizar el portfolio. Intenta de nuevo más tarde.";
        }
    }

    async getMarketInsights() {
        const systemPrompt = `Eres un analista de mercados financieros experto. 
        Proporciona insights actuales sobre el mercado de valores estadounidense, 
        tendencias sectoriales, y recomendaciones de asignación estratégica.
        Enfócate en ETFs y mantén un tono profesional pero accesible.`;

        const userPrompt = `Proporciona un análisis actual del mercado con:
        
        1. Estado general de los mercados (S&P 500, NASDAQ)
        2. Sectores con mejor performance reciente
        3. Sectores a evitar o reducir exposición
        4. Recomendaciones tácticas para los próximos 3-6 meses
        5. ETFs específicos que están en buen momento
        
        Mantén el análisis conciso pero informativo (máximo 300 palabras).`;

        try {
            const response = await this.makeOpenAIRequest([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ], 0.6);

            return response || "No se pudieron obtener insights de mercado en este momento.";
        } catch (error) {
            console.error('Error getting market insights:', error);
            return "Error al obtener análisis de mercado. Intenta de nuevo más tarde.";
        }
    }

    async askQuestion(question, context = {}) {
        // Add question to chat history
        this.chatHistory.push({ role: 'user', content: question });

        const systemPrompt = `Eres un asesor financiero experto especializado en ETFs y inversiones pasivas.
        Responde preguntas sobre inversiones de manera clara y educativa.
        
        CONTEXTO DEL USUARIO:
        - Portfolio actual: ${context.portfolio || 'No especificado'}
        - Perfil de riesgo: ${context.riskProfile || 'No determinado'}
        - Monto invertido: ${context.investmentAmount || 'No especificado'}
        
        Mantén tus respuestas:
        - Educativas y fáciles de entender
        - Específicas con tickers cuando sea relevante
        - Balanceadas (riesgos y beneficios)
        - Prácticas y accionables`;

        try {
            const messages = [
                { role: 'system', content: systemPrompt },
                ...this.chatHistory.slice(-6) // Keep last 6 messages for context
            ];

            const response = await this.makeOpenAIRequest(messages, 0.7);
            
            if (response) {
                // Add AI response to chat history
                this.chatHistory.push({ role: 'assistant', content: response });
                return response;
            }
        } catch (error) {
            console.error('Error in chat question:', error);
        }

        return "Lo siento, no pude procesar tu pregunta en este momento. Intenta de nuevo más tarde.";
    }

    async explainETF(ticker) {
        const systemPrompt = `Eres un experto en ETFs que explica productos financieros de manera clara.
        Proporciona información detallada pero accesible sobre ETFs específicos.`;

        const userPrompt = `Explica el ETF ${ticker} incluyendo:
        
        1. ¿Qué es y qué rastrea?
        2. Principales holdings (top 5-10)
        3. Expense ratio y costos
        4. Performance histórica típica
        5. ¿Para qué tipo de inversor es adecuado?
        6. Ventajas y desventajas
        
        Mantén la explicación clara y educativa (máximo 250 palabras).`;

        try {
            const response = await this.makeOpenAIRequest([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ], 0.3);

            return response || `No se pudo obtener información detallada sobre ${ticker}.`;
        } catch (error) {
            console.error('Error explaining ETF:', error);
            return `Error al obtener información sobre ${ticker}. Intenta de nuevo más tarde.`;
        }
    }

    async compareETFs(ticker1, ticker2) {
        const systemPrompt = `Eres un analista financiero que compara ETFs para ayudar a inversores a tomar decisiones.
        Proporciona comparaciones objetivas y balanceadas.`;

        const userPrompt = `Compara estos dos ETFs: ${ticker1} vs ${ticker2}
        
        Incluye:
        1. Diferencias principales en estrategia/holdings
        2. Comparación de expense ratios
        3. Performance histórica relativa
        4. Cuál podría ser mejor para diferentes perfiles
        5. Recomendación final con justificación
        
        Mantén la comparación objetiva y educativa (máximo 300 palabras).`;

        try {
            const response = await this.makeOpenAIRequest([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ], 0.4);

            return response || `No se pudo comparar ${ticker1} y ${ticker2}.`;
        } catch (error) {
            console.error('Error comparing ETFs:', error);
            return `Error al comparar los ETFs. Intenta de nuevo más tarde.`;
        }
    }

    fallbackAnalysis(questionnaire) {
        // Fallback analysis when OpenAI API is not available
        let riskScore = 0;
        
        // Age scoring
        const ageRanges = {
            '18-25': 4, '26-35': 3, '36-45': 2, '46-55': 1, '56-65': 0, '65+': 0
        };
        riskScore += ageRanges[questionnaire.age] || 1;
        
        // Experience scoring
        const expScores = { 'beginner': 0, 'intermediate': 1, 'advanced': 2, 'expert': 3 };
        riskScore += expScores[questionnaire.experience] || 1;
        
        // Time horizon scoring
        const timeScore = parseInt(questionnaire.timeHorizon) || 5;
        riskScore += timeScore >= 10 ? 3 : timeScore >= 5 ? 2 : timeScore >= 2 ? 1 : 0;
        
        // Volatility tolerance
        const volScores = { 'very-low': 0, 'low': 1, 'medium': 2, 'high': 3, 'very-high': 4 };
        riskScore += volScores[questionnaire.volatilityTolerance] || 2;
        
        // Goal scoring
        const goalScores = {
            'capital-preservation': 0, 'income': 1, 'balanced': 2, 'growth': 3, 'aggressive-growth': 4
        };
        riskScore += goalScores[questionnaire.primaryGoal] || 2;

        // Determine profile
        let profile = 'moderado';
        if (riskScore >= 15) profile = 'agresivo';
        else if (riskScore >= 10) profile = 'crecimiento';
        else if (riskScore <= 5) profile = 'conservador';

        return {
            riskProfile: profile,
            riskJustification: `Basado en tus respuestas, tu score de riesgo es ${riskScore}/20`,
            assetAllocation: this.getDefaultAllocation(profile),
            recommendations: this.getDefaultRecommendations(profile),
            personalizedTips: this.getDefaultTips(profile),
            expectedReturn: this.getExpectedReturn(profile),
            volatilityRange: this.getVolatilityRange(profile)
        };
    }

    getDefaultAllocation(profile) {
        const allocations = {
            'conservador': { bonds: '70%', stocks: '30%', international: '0%', alternatives: '0%' },
            'moderado': { bonds: '40%', stocks: '50%', international: '10%', alternatives: '0%' },
            'crecimiento': { bonds: '20%', stocks: '60%', international: '15%', alternatives: '5%' },
            'agresivo': { bonds: '5%', stocks: '70%', international: '20%', alternatives: '5%' }
        };
        return allocations[profile] || allocations['moderado'];
    }

    getDefaultRecommendations(profile) {
        const recommendations = {
            'conservador': [
                { ticker: 'AGG', name: 'iShares Core U.S. Aggregate Bond ETF', allocation: '50%', reasoning: 'Estabilidad con bonos de alta calidad' },
                { ticker: 'SPY', name: 'SPDR S&P 500 ETF', allocation: '30%', reasoning: 'Exposición diversificada a grandes empresas' }
            ],
            'moderado': [
                { ticker: 'SPY', name: 'SPDR S&P 500 ETF', allocation: '35%', reasoning: 'Core del portfolio con diversificación amplia' },
                { ticker: 'AGG', name: 'iShares Core U.S. Aggregate Bond ETF', allocation: '40%', reasoning: 'Balance con renta fija' },
                { ticker: 'VEA', name: 'Vanguard FTSE Developed Markets ETF', allocation: '15%', reasoning: 'Diversificación internacional' }
            ],
            'agresivo': [
                { ticker: 'QQQ', name: 'Invesco QQQ Trust ETF', allocation: '30%', reasoning: 'Exposición a tecnología de crecimiento' },
                { ticker: 'SPY', name: 'SPDR S&P 500 ETF', allocation: '25%', reasoning: 'Base sólida del mercado estadounidense' },
                { ticker: 'VWO', name: 'Vanguard FTSE Emerging Markets ETF', allocation: '20%', reasoning: 'Alto potencial de crecimiento en mercados emergentes' }
            ]
        };
        return recommendations[profile] || recommendations['moderado'];
    }

    getDefaultTips(profile) {
        const tips = {
            'conservador': [
                'Mantén al menos 6 meses de gastos en efectivo como fondo de emergencia',
                'Rebalancea tu portfolio cada 6 meses',
                'Considera bonos del tesoro para máxima seguridad'
            ],
            'moderado': [
                'Aplica dollar-cost averaging para reducir el riesgo temporal',
                'Revisa y rebalancea tu portfolio trimestralmente',
                'Mantén disciplina durante las volatilidades del mercado'
            ],
            'agresivo': [
                'Ten paciencia - los portfolios agresivos requieren tiempo',
                'No intentes hacer timing del mercado',
                'Considera aumentar contribuciones durante caídas del mercado'
            ]
        };
        return tips[profile] || tips['moderado'];
    }

    getExpectedReturn(profile) {
        const returns = {
            'conservador': '4-6% anual',
            'moderado': '6-8% anual',
            'crecimiento': '7-9% anual',
            'agresivo': '8-12% anual'
        };
        return returns[profile] || '6-8% anual';
    }

    getVolatilityRange(profile) {
        const volatility = {
            'conservador': '5-10%',
            'moderado': '10-15%',
            'crecimiento': '15-20%',
            'agresivo': '20-30%'
        };
        return volatility[profile] || '10-15%';
    }

    clearChatHistory() {
        this.chatHistory = [];
    }

    setUserContext(context) {
        this.userContext = context;
    }
}

// Initialize the OpenAI assistant
const openAIAssistant = new OpenAIAssistant();