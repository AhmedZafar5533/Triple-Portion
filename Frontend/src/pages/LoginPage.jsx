import React, { useState, useEffect } from 'react';
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { authenticationState, loading, sendLoginRequest } = useAuthStore();

  useEffect(() => {
    document.title = "Login | Triple Portion";
    if (authenticationState) {
      navigate("/");
    }
  }, [authenticationState, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    await sendLoginRequest({ email, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/50 to-pink-50/30 flex flex-col relative">
      {/* Logo Top Left */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          to="/"
          aria-label="Go to homepage"
          className="flex items-center space-x-2 p-1 focus:outline-none focus:ring-2 focus:ring-rose-500 rounded-full group"
        >
          <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 shadow-lg flex items-center justify-center transition-transform transform group-hover:scale-110">
            <span className="text-white font-bold text-xl sm:text-2xl">T</span>
            <span className="absolute inset-0 rounded-full ring-2 ring-white opacity-0 group-hover:opacity-20 transition-opacity"></span>
          </div>
          <span className="text-xl sm:text-2xl font-bold text-gray-900 transition-colors group-hover:text-rose-600 hidden sm:block">
            Triple Portion
          </span>
        </Link>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md w-full">
          {/* Login Card */}
          <div className="bg-white/95 backdrop-blur-xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] border border-white/20 rounded-[2rem] p-8 md:p-10 w-full relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-rose-500/10 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 rounded-full bg-pink-500/10 blur-3xl"></div>
            
            <div className="text-center mb-8 relative z-10">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
              <p className="text-gray-500 mt-2 font-medium">Sign in to access your account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5 relative z-10">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 outline-none transition-all bg-gray-50/50 hover:bg-gray-50 focus:bg-white shadow-sm placeholder:text-gray-400"
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5 ml-1">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <Link to="/forget-password" className="text-xs font-semibold text-rose-600 hover:text-rose-500 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 outline-none transition-all bg-gray-50/50 hover:bg-gray-50 focus:bg-white shadow-sm placeholder:text-gray-400"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full cursor-pointer flex justify-center items-center px-4 py-3.5 border border-transparent rounded-xl shadow-[0_8px_20px_rgb(225,29,72,0.25)] text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-400 hover:shadow-[0_8px_25px_rgb(225,29,72,0.35)] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-rose-600 hover:text-rose-500">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
