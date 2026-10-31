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
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-2xl bg-card border border-border shadow-sm p-8 space-y-6 animate-in fade-in">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mx-auto shadow-sm">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight pt-2">
            ProjectVault Admin
          </h1>
          <p className="text-xs text-muted-foreground">
            {isSignUp ? 'Create an authorized administrator account' : 'Sign in to access admin project controls'}
          </p>
        </div>

        {/* Demo Mode Helper Notice */}
        {!isConfigured && (
          <div className="p-4 rounded-xl bg-muted/60 border border-border text-xs text-foreground space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <Sparkles className="w-4 h-4 text-primary" />
              Local Development Mode
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Supabase cloud credentials are not detected in the environment. You can use the quick login button below to explore all admin capabilities immediately:
            </p>
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full mt-1 py-2.5 px-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 font-medium text-xs shadow-sm transition-all"
            >
              1-Click Owner Sign In (Demo Mode)
            </button>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
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
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
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
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{isLoading ? 'Signing In...' : isSignUp ? 'Create Account' : 'Sign In'}</span>
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
