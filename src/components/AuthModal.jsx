import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { X } from 'lucide-react';
import './AuthModal.css';

export default function AuthModal({ isOpen, onClose, addNotification }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      try {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name
            }
          }
        });

        if (signUpError) throw signUpError;

        if (signUpData?.user) {
          // Store profile in customer_profiles table
          const { error: profileError } = await supabase
            .from('customer_profiles')
            .insert([
              {
                id: signUpData.user.id,
                email: email,
                full_name: name
              }
            ]);
          if (profileError) {
            console.error("Error creating customer profile:", profileError);
          }
        }

        // If email confirmation is required, Supabase might not create a session right away
        if (signUpData?.user && !signUpData.session) {
          addNotification('Check your inbox to confirm your email address!');
        } else {
          addNotification('Account created successfully! Welcome to Urban Clothing.');
        }
        
        onClose();
        resetForm();
      } catch (err) {
        console.error('Error signing up:', err);
        setError(err.message || 'An error occurred during registration');
      } finally {
        setLoading(false);
      }
    } else {
      try {
        // 1. Check if email exists in customer_profiles first
        const { data: profile, error: profileFetchError } = await supabase
          .from('customer_profiles')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        if (profileFetchError) {
          console.error("Profile check failed:", profileFetchError);
        }

        if (!profile) {
          // Check standard Supabase users table by doing a trial login
          const { data: trialData, error: trialError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (!trialError) {
            // User exists in auth.users, create profile on-the-fly
            await supabase.from('customer_profiles').insert([
              {
                id: trialData.user.id,
                email: email,
                full_name: email.split('@')[0]
              }
            ]);
            addNotification('Signed in successfully.');
            onClose();
            resetForm();
            return;
          }

          setError('Email does not exist. Please sign up first.');
          setLoading(false);
          return;
        }

        // 2. Authenticate
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        addNotification('Signed in successfully.');
        onClose();
        resetForm();
      } catch (err) {
        console.error('Error signing in:', err);
        setError(err.message || 'Invalid email or password');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
  };

  const handleTabChange = (newMode) => {
    setMode(newMode);
    resetForm();
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <h2 className="auth-modal-title">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>

        <div className="auth-tabs">
          <button
            className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => handleTabChange('login')}
          >
            Sign In
          </button>
          <button
            className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
            onClick={() => handleTabChange('register')}
          >
            Sign Up
          </button>
        </div>

        {error && <div className="auth-error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="auth-input-group">
              <label className="auth-input-label">Full Name</label>
              <input
                type="text"
                className="auth-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
          )}

          <div className="auth-input-group">
            <label className="auth-input-label">Email Address</label>
            <input
              type="email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="auth-input-group">
            <label className="auth-input-label">Password</label>
            <input
              type="password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {mode === 'register' && (
            <div className="auth-input-group">
              <label className="auth-input-label">Confirm Password</label>
              <input
                type="password"
                className="auth-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          )}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
