import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://eatoes-backend-2j1t.onrender.com/api';

/**
 * Custom hook for fetching data
 * @param {string} url - API endpoint URL
 * @param {Array} dependencies - Dependencies array for re-fetching
 * @returns {Object} { data, loading, error, refetch }
 */
export function useFetch(url, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}${url}`);
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (url) {
      fetchData();
    }
  }, [url, ...dependencies]);

  return { data, loading, error, refetch: fetchData };
}

export const API_BASE_URL = API_URL;
