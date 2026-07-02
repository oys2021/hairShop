import { useCallback, useEffect, useState } from 'react';

export function useApiResource(loader, dependencies = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      setData(await loader());
    } catch (err) {
      setError(err.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    data,
    setData,
    error,
    loading,
    reload,
  };
}
