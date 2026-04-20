import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, MapPinIcon } from '@heroicons/react/24/outline';
import GoogleAuth from '../components/GoogleAuth';

// Import admin login image
import adminLoginImage from '../assets/admin_login.jpg';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'citizen'
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleSuccess = (data) => {
    setLoading(false);
    setError('');

    // Redirect based on user type
    if (data.user.userType === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const handleGoogleError = (error) => {
    setLoading(false);
    setError(error.message || 'Google authentication failed');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check if using permanent admin credentials
      const isPermanentAdmin = formData.email === 'mathiyazhagan907@gmail.com' && formData.password === '123456' && formData.userType === 'admin';

      let apiUrl;
      if (isPermanentAdmin) {
        // Try permanent admin login route first
        apiUrl = 'http://localhost:5000/api/permanent-auth/permanent-admin-login';
      } else {
        // Use normal login route
        apiUrl = 'http://localhost:5000/api/auth/login';
      }

      let response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      let data = await response.json();

      // If permanent route fails (404), fallback to normal login
      if (!response.ok && response.status === 404 && isPermanentAdmin) {
        console.log('Permanent route not found, trying normal login...');
        response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });
        data = await response.json();
      }

      if (response.ok) {
        // Enforce role-based access
        if (data.user.userType !== formData.userType) {
          setError(`Access denied. This is the ${formData.userType} portal, but you are registered as a ${data.user.userType}.`);
          setLoading(false);
          return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect based on user type
        if (data.user.userType === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-300 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>

      {formData.userType === 'admin' ? (
        // Full Page Admin Layout
        <div className="relative z-10 w-full h-screen">
          <div className="flex h-full">
            {/* Left Sidebar - Full Height */}
            <div className="lg:w-1/2 w-full lg:relative absolute inset-0">
              {/* Background Image with Dark Overlay */}
              <div className="absolute inset-0">
                <img
                  src={adminLoginImage}
                  alt="Smart City Infrastructure"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div>
              </div>
              
              <div className="relative z-10 h-full flex flex-col justify-between p-8 lg:p-12 text-white">
                {/* Top Section - Logo and Title */}
                <div className="flex-1 flex flex-col justify-center">
                  {/* Logo */}
                  <div className="flex items-center mb-8">
                    <div className="h-14 w-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mr-4">
                      <MapPinIcon className="h-7 w-7 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold">Urban Insights</h1>
                  </div>

                  {/* Admin Portal Title */}
                  <div>
                    <h2 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                      Admin Portal
                    </h2>
                    <p className="text-white/90 text-2xl leading-relaxed max-w-xl">
                      Transform your city management with data-driven insights and intelligent analytics
                    </p>
                  </div>
                </div>

                {/* Bottom Section - Features and Stats */}
                <div className="space-y-8">
                  {/* Key Features */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                      <div className="flex items-center mb-3">
                        <div className="h-10 w-10 bg-emerald-500/20 rounded-full flex items-center justify-center mr-3">
                          <svg className="h-5 w-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <h4 className="font-bold text-white text-lg">Real-time Monitoring</h4>
                      </div>
                      <p className="text-white/70">Track city issues 24/7</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                      <div className="flex items-center mb-3">
                        <div className="h-10 w-10 bg-blue-500/20 rounded-full flex items-center justify-center mr-3">
                          <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                          </svg>
                        </div>
                        <h4 className="font-bold text-white text-lg">Advanced Analytics</h4>
                      </div>
                      <p className="text-white/70">Data-driven insights</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-white">10K+</div>
                      <div className="text-white/70">Issues Resolved</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-white">95%</div>
                      <div className="text-white/70">Accuracy Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-white">24/7</div>
                      <div className="text-white/70">Active Monitoring</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Login Form - Full Height */}
            <div className="lg:w-1/2 hidden lg:block bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
              <div className="h-full flex items-center justify-center p-12">
                <div className="w-full max-w-md">
                  {/* Header */}
                  <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-600 to-orange-500 rounded-2xl mb-4">
                      <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Admin Login</h2>
                    <p className="text-slate-400">Access your administrative dashboard</p>
                  </div>

                  {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  )}

                  <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* Email Field */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <UserIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          className="block w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                          placeholder="Admin email address"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <LockClosedIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          required
                          className="block w-full pl-12 pr-12 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                          placeholder="Admin password"
                          value={formData.password}
                          onChange={handleChange}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="h-5 w-5 text-slate-400 hover:text-slate-300" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-slate-400 hover:text-slate-300" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="remember-me"
                          name="remember-me"
                          type="checkbox"
                          className="h-4 w-4 text-amber-500 focus:ring-amber-500 border-slate-600 rounded"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300">
                          Remember me
                        </label>
                      </div>
                      <div className="text-sm">
                        <a href="#" className="font-medium text-amber-400 hover:text-amber-300 transition-colors">
                          Forgot password?
                        </a>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all hover:scale-[1.02] text-lg"
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Signing in...
                          </div>
                        ) : (
                          'Sign In as Admin'
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Switch to Citizen */}
                  <div className="mt-8 text-center">
                    <span className="text-sm text-slate-400">
                      Not an admin?{' '}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, userType: 'citizen' })}
                        className="font-medium text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        Sign in as Citizen
                      </button>
                    </span>
                  </div>

                  {/* Google Sign-In */}
                  <div className="mt-8">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-700" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-slate-900 text-slate-500">Or continue with</span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <GoogleAuth
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        text="Continue with Google"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Regular Citizen Layout
        <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg ring-4 ring-white/50">
              <MapPinIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <p className="mt-2 text-gray-600">Sign in to your Urban Insights account</p>
          </div>

          {/* Login Form */}
          <div className="bg-white/80 backdrop-blur-lg py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/20">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Account Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Login As</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, userType: 'citizen' })}
                    className={`py-2 px-4 rounded-lg font-medium transition-all ${formData.userType === 'citizen'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    Citizen
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, userType: 'admin' })}
                    className={`py-2 px-4 rounded-lg font-medium transition-all ${formData.userType === 'admin'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur transition-all"
                    placeholder="Your email address"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur transition-all"
                    placeholder="Your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                    Forgot password?
                  </a>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all hover:scale-[1.02]"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </div>
                  ) : (
                    'Sign In as Citizen'
                  )}
                </button>
              </div>
            </form>

            {/* Account Type Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 font-medium mb-2">🔐 Account Access</p>
              <div className="text-xs text-blue-700 space-y-1">
                <p><strong>Citizen Login:</strong> Use your registered email and password</p>
                <p><strong>New User?</strong> Register for a citizen account below</p>
              </div>
            </div>

            {/* Google Sign-In */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6">
                <GoogleAuth
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  text="Continue with Google"
                />
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <span className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                  Sign up as Citizen
                </Link>
              </span>
            </div>

            {/* Switch to Admin */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, userType: 'admin' })}
                className="text-xs text-gray-500 hover:text-purple-600 transition-colors"
              >
                Are you an admin? Switch to Admin Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
