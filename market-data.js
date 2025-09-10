async function fetchRealTimeQuote(ticker) {
    if (!config || !config.stockApiKey) {
        throw new Error('Stock API key not configured');
    }

    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${config.stockApiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
    }
    const data = await response.json();
    const quote = data['Global Quote'];
    if (!quote || !quote['05. price']) {
        throw new Error('Invalid data returned');
    }
    return {
        price: parseFloat(quote['05. price']),
        changePercent: parseFloat(quote['10. change percent']),
        volume: parseFloat(quote['06. volume'])
    };
}
