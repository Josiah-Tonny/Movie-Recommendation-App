import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { authService } from '../lib/mongodb';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setMessage({ text: 'Please enter your email address', type: 'error' });
      return;
    }
    
    try {
      setIsSubmitting(true);
      const response = await authService.requestPasswordReset(email);
      setMessage({ text: response.message, type: 'success' });
      // For development, you might want to show the reset link
      console.log('Reset URL:', response.resetUrl);
    } catch (error) {
      let errorMessage = 'Failed to process request';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setMessage({ text: errorMessage, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <div className="m-auto w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-xl shadow-2xl">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold">Forgot Password</h2>
          <p className="mt-2 text-sm text-gray-400">
            Enter your email to receive a password reset link
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {message && (
            <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
              {message.text}
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 pr-4 py-3 w-full bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="your.email@example.com"
              />
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isSubmitting ? 'Processing...' : 'Send Reset Link'}
            </button>
          </div>
          
          <div className="text-center">
            <a href="/auth" className="text-sm text-blue-400 hover:text-blue-300">
              Back to login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;