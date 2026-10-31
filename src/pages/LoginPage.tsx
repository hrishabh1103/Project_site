import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage: React.FC = () => {
  const { signIn, signUp, enableDemoAuth, isConfigured } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Input Required', 'Please enter your email and password');
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        const { error: signUpError } = await signUp(email, password);
        if (signUpError) {
          error('Sign Up Failed', signUpError.message);
        } else {
          success('Account Registered', 'Verification link sent if email confirmation is enabled.');
          navigate('/');
        }
      } else {
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          error('Authentication Failed', signInError.message);
        } else {
          success('Welcome Back', 'Authorized session started');
          navigate('/');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    enableDemoAuth();
    success('Admin Session Activated', 'Logged in as authorized ProjectVault owner');
    navigate('/');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-3xl bg-card border border-border shadow-2xl p-8 space-y-6 animate-in fade-in">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-500/25">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            PROJECT<span className="text-indigo-500">VAULT</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            {isSignUp ? 'Create administrator account' : 'Authorized administrator authentication'}
          </p>
        </div>

        {/* Demo Mode Helper Notice */}
        {!isConfigured && (
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Local Development Mode
            </div>
            <p className="leading-relaxed">
              Supabase env variables are not yet configured. You can use the quick login button below to test all admin features (Add, Edit, Delete, GitHub Sync) immediately:
            </p>
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full mt-1 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm transition-all"
            >
              1-Click Owner / Admin Sign In
            </button>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="admin@projectvault.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow-md shadow-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{isLoading ? 'Authenticating...' : isSignUp ? 'Create Account' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-muted-foreground hover:text-foreground font-medium"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Need to create an owner account? Switch to Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};
