# Smart Portfolio Tracker

A comprehensive portfolio management application with AI-powered investment recommendations.

## 🚀 Features

### 📊 **Portfolio Management**
- Real-time portfolio tracking with stable pricing system
- 11-sector ticker categorization with comprehensive ETF database
- Multiple investment profiles (conservative, balanced, growth, aggressive)
- Portfolio composition tracking and rebalancing tools

### 🤖 **AI Assistant (OpenAI GPT-4 Powered)**
- **Profile Analysis**: Risk assessment questionnaire with personalized recommendations
- **Interactive Chat**: Ask questions about investments, ETFs, and strategies  
- **Portfolio Review**: Get AI analysis of your current holdings
- **Market Insights**: AI-generated market analysis and sector recommendations
- **ETF Analyzer**: Compare and analyze ETFs with detailed breakdowns

### 📈 **Market Analysis**
- Sector analysis with risk levels and performance metrics
- Market conditions overview
- Real-time ticker data with consistent daily pricing
- Comprehensive ETF database covering 11 major sectors

### 👤 **Profile Management**
- Create and manage multiple investment profiles
- Save ticker selections and investment amounts
- Customizable portfolio compositions
- Local data persistence

## 🛠️ Setup Instructions

### Prerequisites
- Modern web browser
- OpenAI API key (for AI features)
- Basic web server (Python, Node.js, or similar)

### Installation

1. **Clone or download the repository**
   ```bash
   git clone https://github.com/dashboardtech/PortFolio-Vane.git
   cd PortFolio-Vane
   ```

2. **Start a local web server**
   ```bash
   # Using Python
   python3 -m http.server 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   ```

3. **Access the application**
   - Open your browser to `http://localhost:8000`

### 🔐 OpenAI Configuration

The AI features require an OpenAI API key:

#### Option 1: User Prompt (Recommended)
- The app will automatically prompt for your API key on first use
- Key is stored securely in your browser's localStorage
- No code changes needed

#### Option 2: Manual Configuration
1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Edit `config.js`:
   ```javascript
   this.openAIApiKey = 'your-api-key-here';
   this.promptForApiKey = false;
   ```

> **Security Note**: Never commit API keys to version control. Use environment variables or secure configuration management in production.

## 📁 Project Structure

```
PortFolio-Vane/
├── index.html              # Main application interface
├── app.js                  # Core portfolio tracker logic
├── portfolio-manager.js    # Investment calculations & composition
├── ticker-database.js      # Comprehensive ETF & sector database
├── openai-assistant.js     # OpenAI GPT-4 integration
├── ai-assistant.js         # AI feature management
├── config.js              # Configuration settings
├── styles.css             # Complete responsive styling
└── README.md              # This file
```

## 🎯 Usage Guide

### Getting Started
1. **Add Tickers**: Use the search box to add stocks/ETFs to track
2. **Set Investment Amount**: Enter your total investment amount
3. **Choose Profile**: Select or create an investment profile
4. **AI Analysis**: Configure OpenAI API key and get personalized recommendations

### AI Features
- **Profile Analysis**: Complete the risk questionnaire for personalized advice
- **Chat**: Ask questions like "What are the best ETFs for beginners?"
- **Portfolio Review**: Get AI analysis of your current holdings
- **Market Insights**: Receive AI-generated market analysis
- **ETF Analyzer**: Compare ETFs and get detailed breakdowns

### Sector Categories
- **Technology**: Tech stocks and innovation ETFs
- **Healthcare**: Medical and pharmaceutical investments
- **Financial Services**: Banks, insurance, and financial ETFs
- **Consumer Goods**: Retail and consumer-focused investments
- **Energy**: Oil, gas, and renewable energy
- **Real Estate**: REITs and real estate investments
- **Utilities**: Utility companies and infrastructure
- **Industrials**: Manufacturing and industrial ETFs
- **Materials**: Commodities and raw materials
- **Communications**: Telecom and media companies
- **Fixed Income**: Bonds and income-focused investments

## 🔧 Technical Features

### Stable Pricing System
- Hash-based consistent daily pricing (±2% daily variation)
- Realistic stock prices for major equities
- No dramatic price swings on refresh

### Data Persistence
- Portfolio compositions saved to localStorage
- Ticker selections and investment amounts preserved
- AI chat history maintained during session

### Responsive Design
- Mobile-friendly interface
- Tab-based navigation
- Modern, clean UI with professional styling

## 🤝 Contributing

This project was created to provide comprehensive portfolio management with AI integration. Feel free to:
- Report issues
- Suggest new features  
- Submit improvements
- Add new ticker data

## 📄 License

This project is open source and available under standard terms.

---

**Built with ❤️ and powered by OpenAI GPT-4**

For support or questions, please open an issue in the repository.