import { useState } from 'react';
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage({ onLogin, error, isConfigured, loading }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-[70vh] px-4 py-12 grid place-items-center">
      <section className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-700 bg-slate-950/90 shadow-2xl">
        <div className="border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-950 px-6 py-6">
          <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <p className="text-xs font-bold uppercase text-amber-300">Organizer access</p>
          <h1 className="mt-1 text-2xl font-black text-white">Control Room</h1>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to manage teams, schedules, and official match results.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <label htmlFor="admin-email" className="block text-xs font-bold uppercase text-slate-400">
            Organizer email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              required
              autoFocus
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="organizer@example.com"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-10 pr-3 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-blue-500"
            />
          </div>

          <label htmlFor="admin-password" className="block text-xs font-bold uppercase text-slate-400">
            Password
          </label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-10 pr-3 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-blue-500"
            />
          </div>

          {!isConfigured && (
            <p role="status" className="text-sm text-amber-200">
              Firebase is not connected yet. Copy the values from your Firebase web app into
              <code className="mx-1 rounded bg-slate-800 px-1.5 py-0.5 text-xs">.env.local</code>
              and restart the site.
            </p>
          )}

          {error && (
            <p role="alert" className="text-sm text-rose-300">{error}</p>
          )}

          <button
            type="submit"
            disabled={!isConfigured || loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>{loading ? 'Checking session...' : 'Sign in'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <p className="text-center text-[11px] leading-relaxed text-slate-500">
            Organizer accounts are created in Firebase Console. Public sign-up is not available.
          </p>
        </form>
      </section>
    </div>
  );
}