import React, { useState } from 'react';
import supabase from '../supabaseClient';

interface AuthViewProps {
  onAuthSuccess: (user: any) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
    } else if (data.user) {
      onAuthSuccess(data.user);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!name.trim()) {
      setError('Please enter your name');
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name.trim(),
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else if (data.user) {
      // For new signups, we'll redirect to profile setup
      onAuthSuccess(data.user);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);

    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (googleError) {
      setError(googleError.message);
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setResetEmailSent(true);
    }
    setLoading(false);
  };

  if (showForgotPassword) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-black animate-in fade-in duration-700">
        <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic mb-2 text-center">IronMind</h1>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-10">Reset Password</p>

        {resetEmailSent ? (
          <div className="w-full max-w-xs text-center">
            <div className="bg-green-900/30 border border-green-500/30 rounded-2xl p-6 mb-6">
              <p className="text-green-400 font-bold">Check your email for a password reset link.</p>
            </div>
            <button
              onClick={() => { setShowForgotPassword(false); setResetEmailSent(false); }}
              className="text-blue-500 font-bold text-sm uppercase tracking-widest"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleForgotPassword} className="w-full max-w-xs space-y-6">
            {error && (
              <div className="bg-red-900/30 border border-red-500/30 rounded-2xl p-4">
                <p className="text-red-400 text-sm font-bold">{error}</p>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Email</label>
              <input
                required
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 font-bold text-white placeholder-slate-700 focus:border-blue-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full fire-button py-5 rounded-3xl font-black uppercase tracking-widest text-white disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <button
              type="button"
              onClick={() => setShowForgotPassword(false)}
              className="w-full text-slate-500 font-bold text-sm uppercase tracking-widest py-2"
            >
              Back to Login
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-black animate-in fade-in duration-700">
      <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic mb-2 text-center">IronMind</h1>
      <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-10">
        {isSignUp ? 'Create Account' : 'Welcome Back'}
      </p>

      <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="w-full max-w-xs space-y-6">
        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-2xl p-4">
            <p className="text-red-400 text-sm font-bold">{error}</p>
          </div>
        )}

        {isSignUp && (
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Name</label>
            <input
              required
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
              className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 font-bold text-white placeholder-slate-700 focus:border-blue-500 outline-none"
            />
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Email</label>
          <input
            required
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete={isSignUp ? 'off' : 'email'}
            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 font-bold text-white placeholder-slate-700 focus:border-blue-500 outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Password</label>
          <input
            required
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 font-bold text-white placeholder-slate-700 focus:border-blue-500 outline-none"
          />
          {isSignUp && (
            <p className="text-[10px] text-slate-600 ml-1 mt-1">Minimum 6 characters</p>
          )}
        </div>

        {!isSignUp && (
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-blue-500 text-xs font-bold"
          >
            Forgot password?
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full fire-button py-5 rounded-3xl font-black uppercase tracking-widest text-white disabled:opacity-50"
        >
          {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Login'}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-black text-slate-600 text-[10px] font-bold uppercase tracking-widest">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white text-black py-4 rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              // Clear fields when switching to signup to prevent autofill confusion
              if (!isSignUp) {
                setEmail('');
                setPassword('');
                setName('');
              }
            }}
            className="text-slate-500 font-bold text-sm"
          >
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <span className="text-blue-500">{isSignUp ? 'Login' : 'Sign Up'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
