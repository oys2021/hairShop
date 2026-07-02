import { Link } from 'react-router-dom';
import { useState } from 'react';
import Button from '../components/Button.jsx';
import FormField from '../components/FormField.jsx';
import Logo from '../components/Logo.jsx';
import { apiFetch } from '../lib/api.js';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('administrator@hairmartpos.com');
  const [message, setMessage] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);

  const requestReset = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setResetToken('');
    try {
      const response = await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: { email },
      });
      setMessage('Reset instructions generated');
      setResetToken(response.data?.resetToken ?? '');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-brand-page px-5">
      <section className="panel w-full max-w-lg px-12 py-12 text-center">
        <div className="mx-auto flex justify-center">
          <Logo />
        </div>
        <h1 className="mt-10 text-3xl font-black">Forgot password</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-brand-muted">Enter the email linked to your admin account.</p>
        <form className="mt-10 space-y-6 text-left" onSubmit={requestReset}>
          <FormField label="Email address">
            <input className="control w-full" value={email} onChange={(event) => setEmail(event.target.value)} />
          </FormField>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Sending...' : 'Send Reset Link'}</Button>
          <Link to="/login" className="btn btn-secondary w-full">
            Back to Sign In
          </Link>
        </form>
        {message ? <p className="mt-8 rounded-lg bg-green-50 px-4 py-3 text-sm font-bold text-brand-green">{message}</p> : null}
        {resetToken ? <p className="mt-4 break-all rounded-lg bg-slate-50 px-4 py-3 text-xs font-bold text-brand-muted">Local reset token: {resetToken}</p> : null}
      </section>
    </main>
  );
}
