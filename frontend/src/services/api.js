const API_BASE_URL = 'http://localhost:5001/api';

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
    getMovers: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/market/movers`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error("Error fetching movers:", error);
            return null;
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
};

export default api;
