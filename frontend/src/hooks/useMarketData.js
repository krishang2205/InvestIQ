import { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Custom hook to fetch market data.
 * @param {string} dataType - One of: 'indices', 'mood', 'movers', 'news'
 * @param {number} refreshInterval - Auto-refresh interval in ms (default: 0 = disabled)
 */
const useMarketData = (dataType, refreshInterval = 0) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
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
                        result = await api.getMovers();
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

        fetchData(); // Initial fetch

        let intervalId;
        if (refreshInterval > 0) {
            intervalId = setInterval(fetchData, refreshInterval);
        }

        return () => {
            isMounted = false;
            if (intervalId) clearInterval(intervalId);
        };
    }, [dataType, refreshInterval]);

    return { data, loading, error };
};

export default useMarketData;
