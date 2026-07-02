import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoadingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setTimeout(() => navigate('/dashboard'), 900);
    return () => window.clearTimeout(timer);
  }, [navigate]);

  return (
    <main className="grid min-h-screen place-items-center bg-white">
      <div className="text-center">
        <div className="mx-auto h-28 w-28 animate-spin rounded-full border-[18px] border-orange-100 border-t-brand-orange" />
        <h1 className="mt-7 text-lg font-black">Loading dashboard</h1>
        <p className="mt-3 text-sm text-brand-muted">Preparing products, sales, and stock counts.</p>
      </div>
    </main>
  );
}
