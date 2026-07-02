import { Lock, User } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Logo from '../components/Logo.jsx';
import { apiFetch } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

function ProductBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#101326]">
      {Array.from({ length: 14 }).map((_, index) => {
        const colors = ['bg-brand-navy/50', 'bg-fuchsia-950/40', 'bg-cyan-950/40', 'bg-amber-950/35'];
        return (
          <div
            key={index}
            className={`absolute rounded-2xl ${colors[index % colors.length]}`}
            style={{
              left: `${4 + (index % 7) * 14}%`,
              top: `${9 + Math.floor(index / 7) * 45}%`,
              width: `${7 + (index % 3) * 1.6}%`,
              height: `${26 + (index % 4) * 2}%`,
            }}
          >
            <span className="absolute left-4 right-4 top-7 h-9 rounded-lg bg-white/10" />
            <span className="absolute bottom-12 left-5 right-5 h-24 rounded-xl bg-white/5" />
            <span className="absolute bottom-8 left-0 right-0 text-center text-xs font-black text-white/20">BEAUTY</span>
          </div>
        );
      })}
      <div className="absolute inset-0 bg-[#070817]/70" />
      <div className="absolute inset-0 bg-brand-purple/20" />
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, reloadUser } = useAuth();
  const [username, setUsername] = useState('administrator');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!authLoading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const submitLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiFetch('/auth/login', {
        method: 'POST',
        body: { username, password },
      });
      await reloadUser();
      navigate('/loading');
    } catch (err) {
      setError(err.message ?? 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-12">
      <ProductBackdrop />
      <div className="relative z-10 mx-auto flex max-w-7xl items-start justify-between">
        <Logo dark />
      </div>

      <section className="relative z-10 mx-auto mt-16 w-full max-w-[440px] rounded-lg bg-white px-12 py-14 shadow-2xl">
        <h1 className="text-center text-3xl font-black text-brand-purple">Sign in</h1>
        <div className="mx-auto mt-3 h-1.5 w-16 rounded-full bg-brand-purple" />

        <form
          className="mt-20 space-y-8"
          onSubmit={submitLogin}
        >
          <label className="relative block">
            <User size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="control w-full pl-12" value={username} onChange={(event) => setUsername(event.target.value)} aria-label="Username" />
          </label>
          <label className="relative block">
            <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="control w-full pl-12" value={password} onChange={(event) => setPassword(event.target.value)} type="password" aria-label="Password" />
          </label>
          <p className="text-center text-sm">
            Lost Password?{' '}
            <Link to="/forgot-password" className="font-bold text-brand-purple">
              Click Here
            </Link>
          </p>
          <Button type="submit" className="h-12 w-full rounded-full bg-brand-purple hover:bg-violet-800" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        {error ? (
          <div className="mt-9 rounded-lg bg-red-50 px-5 py-4 text-center">
            <p className="text-sm font-black text-brand-red">{error}</p>
            <p className="mt-1 text-xs text-brand-red">Try administrator / password again.</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
