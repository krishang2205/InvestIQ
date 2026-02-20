import { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Custom hook to fetch market data.
 * @param {string} dataType - One of: 'indices', 'mood', 'movers', 'news'
 * @param {number} refreshInterval - Auto-refresh interval in ms (default: 0 = disabled)
 * @param {object} params - Optional parameters to pass to API calls (e.g., { category: 'top-gainers' } for movers)
 */
const useMarketData = (dataType, refreshInterval = 0, params = {}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async (isInitial = false) => {
            if (isInitial) setLoading(true); // Only show loading on initial fetch
            try {
                // Determine which API function to call
                let result;
                switch (dataType) {
                    case 'indices':
                        result = await api.getIndices();
                        break;
                    case 'mood':
                        result = await api.getMarketMood();
                        break;
                    case 'movers':
                        result = await api.getMovers(params.category); // Pass category
                        break;
                    case 'news':
                        result = await api.getNews();
                        break;
                    default:
                        throw new Error(`Invalid data type: ${dataType}`);
                }

                if (isMounted) {
                    if (result && result.error) {
                        setError(result.error);
                    } else {
                        setData(result);
                        setError(null);
                    }
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.message);
                    setLoading(false);
                }
            }
        };

        fetchData(true); // Initial fetch with loading

        let intervalId;
        if (refreshInterval > 0) {
            intervalId = setInterval(() => fetchData(false), refreshInterval);
        }

        return () => {
            isMounted = false;
            if (intervalId) clearInterval(intervalId);
        };
    }, [dataType, refreshInterval]);

    return { data, loading, error };
};

export default useMarketData;
