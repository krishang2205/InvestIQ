const API_BASE_URL =
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
    'http://localhost:5001/api';

const api = {
    /**
     * Fetch Market Indices (NIFTY 50, SENSEX, etc.)
     */
    getIndices: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/market/indices`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error("Error fetching indices:", error);
            return null;
        }
    },

    /**
     * Fetch Market Mood Index
     */
    getMarketMood: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/market/mood`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error("Error fetching market mood:", error);
            return null;
        }
    },

    /**
     * Fetch Top Movers (Gainers/Losers)
     */
    getMovers: async (category = 'large_cap') => {
        try {
            const response = await fetch(`${API_BASE_URL}/market/movers?category=${category}`);
            return await response.json();
        } catch (error) {
            return { error: error.message };
        }
    },

    /**
     * Fetch Market News
     */
    getNews: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/market/news`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error("Error fetching news:", error);
            return null; // Return null so UI can handle empty state
        }
    }
    ,

    /**
     * Portfolio APIs
     */
    /** One request: summary + holdings + XIRR (faster than parallel /summary + /holdings + /xirr). */
    getPortfolioBootstrap: async () => {
        const response = await fetch(`${API_BASE_URL}/portfolio/bootstrap`);
        if (!response.ok) throw new Error('Failed to fetch portfolio bootstrap');
        return await response.json();
    },

    getPortfolioSummary: async () => {
        const response = await fetch(`${API_BASE_URL}/portfolio/summary`);
        if (!response.ok) throw new Error('Failed to fetch portfolio summary');
        return await response.json();
    },

    getPortfolioHoldings: async () => {
        const response = await fetch(`${API_BASE_URL}/portfolio/holdings`);
        if (!response.ok) throw new Error('Failed to fetch portfolio holdings');
        return await response.json();
    },

    getPortfolioHistory: async (days = 365) => {
        const response = await fetch(`${API_BASE_URL}/portfolio/history?days=${days}`);
        if (!response.ok) throw new Error('Failed to fetch portfolio history');
        return await response.json();
    },

    getPortfolioIntelligence: async () => {
        const response = await fetch(`${API_BASE_URL}/portfolio/intelligence`);
        if (!response.ok) throw new Error('Failed to fetch portfolio intelligence');
        return await response.json();
    },

    getPortfolioXirr: async () => {
        const response = await fetch(`${API_BASE_URL}/portfolio/analytics/xirr`);
        if (!response.ok) throw new Error('Failed to fetch portfolio XIRR');
        return await response.json();
    },

    addPortfolioTransaction: async (payload) => {
        const response = await fetch(`${API_BASE_URL}/portfolio/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data?.error || 'Failed to add transaction');
        }
        return data;
    },

    removeStock: async (symbol) => {
        const response = await fetch(`${API_BASE_URL}/portfolio/transactions/${symbol}`, {
            method: 'DELETE',
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data?.error || 'Failed to delete stock');
        }
        return data;
    },
};

export default api;
