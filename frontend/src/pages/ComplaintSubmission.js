import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PhotoIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  HomeIcon,
  ClockIcon,
  PlusCircleIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const ComplaintSubmission = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    latitude: '',
    longitude: '',
    priority: 'medium',
    images: []
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const categories = [
    'Infrastructure',
    'Sanitation',
    'Water Supply',
    'Electricity',
    'Roads',
    'Public Safety',
    'Noise Pollution',
    'Other'
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError('');
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const getCurrentLocation = () => {
    setFetchingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          }));
          setFetchingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to fetch location. Please enter manually.');
          setFetchingLocation(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setFetchingLocation(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to submit a complaint');
        setLoading(false);
        return;
      }

      const submissionData = new FormData();
      submissionData.append('title', formData.title);
      submissionData.append('description', formData.description);
      submissionData.append('category', formData.category);
      submissionData.append('location[address]', formData.location);
      submissionData.append('priority', formData.priority);
      
      if (formData.latitude) submissionData.append('location[latitude]', formData.latitude);
      if (formData.longitude) submissionData.append('location[longitude]', formData.longitude);

      formData.images.forEach((image, index) => {
        submissionData.append(`images`, image);
      });

      const response = await fetch('http://localhost:5000/api/complaints', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submissionData
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          title: '',
          description: '',
          category: '',
          location: '',
          latitude: '',
          longitude: '',
          priority: 'medium',
          images: []
        });
      } else {
        setError(data.message || 'Failed to submit complaint');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden font-sans">
        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-blue-600 to-blue-800 lg:relative lg:translate-x-0">
          <div className="h-full flex flex-col">
            {/* Logo Section */}
            <div className="p-8 border-b border-blue-400/30 bg-gradient-to-br from-blue-500/20 to-blue-700/20 backdrop-blur-sm">
              <Link to="/" className="flex items-center space-x-3 group relative">
                <div className="absolute -inset-2 bg-white/10 rounded-2xl scale-75 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 blur-xl"></div>
                <div className="relative w-11 h-11 bg-gradient-to-tr from-white to-blue-100 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/30 group-hover:shadow-blue-900/50 transition-all duration-500 group-hover:-rotate-6">
                  <MapPinIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="relative text-left">
                  <h1 className="text-xl font-bold text-white tracking-tight leading-none">
                    Urban<span className="text-cyan-300">Insights</span>
                  </h1>
                  <p className="text-xs font-medium text-cyan-200 mt-1 opacity-90">Citizen Portal</p>
                </div>
              </Link>
            </div>

            {/* User Section */}
            <div className="px-6 py-4 border-b border-blue-400/30">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-900/20">
                  <UserIcon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-cyan-200 opacity-80 truncate">{user?.email || 'user@example.com'}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              <Link
                to="/dashboard"
                className="group flex items-center space-x-3 px-4 py-3 text-white/90 hover:bg-white/10 hover:text-white rounded-xl font-medium transition-all duration-300 hover:translate-x-1 hover:shadow-lg hover:shadow-blue-900/20"
              >
                <HomeIcon className="h-5 w-5 text-cyan-300 transition-transform group-hover:scale-110 group-hover:text-white" />
                <span className="tracking-tight">Overview</span>
              </Link>
              <Link
                to="/complaint-history"
                className="group flex items-center space-x-3 px-4 py-3 text-white/70 hover:bg-white/10 hover:text-white rounded-xl font-medium transition-all duration-300 hover:translate-x-1 hover:shadow-lg hover:shadow-blue-900/20"
              >
                <ClockIcon className="h-5 w-5 text-blue-300 transition-colors group-hover:text-cyan-300" />
                <span className="tracking-tight">Complaint History</span>
              </Link>
              <Link
                to="/submit-complaint"
                className="group flex items-center space-x-3 px-4 py-3 text-white/90 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-all duration-300 hover:translate-x-1 hover:shadow-lg hover:shadow-blue-900/20"
              >
                <PlusCircleIcon className="h-5 w-5 text-cyan-300 transition-transform group-hover:scale-110 group-hover:text-white" />
                <span className="tracking-tight">New Incident</span>
              </Link>
            </nav>

            {/* Sign Out Section */}
            <div className="p-4 border-t border-blue-400/30">
              <button
                onClick={handleLogout}
                className="group w-full flex items-center space-x-3 px-4 py-3 text-white/70 hover:bg-red-500/20 hover:text-white rounded-xl font-medium transition-all duration-300 hover:translate-x-1 hover:shadow-lg hover:shadow-red-900/20"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 text-red-300 transition-colors group-hover:text-white" />
                <span className="tracking-tight">Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white rounded-3xl shadow-2xl p-8 text-center border border-gray-100/50">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CheckCircleIcon className="h-10 w-10" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-3">Incident Reported!</h2>
              <p className="text-gray-600 mb-8 font-medium leading-relaxed">
                Your report has been successfully logged. We'll keep you posted on the status.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl text-sm font-bold shadow-lg hover:shadow-xl hover:shadow-blue-200/50 active:scale-95 transition-all duration-300"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      title: '',
                      description: '',
                      category: '',
                      location: '',
                      latitude: '',
                      longitude: '',
                      priority: 'medium',
                      images: []
                    });
                  }}
                  className="w-full py-4 px-6 bg-white border border-gray-200 text-gray-700 rounded-2xl text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 active:scale-95 transition-all duration-300"
                >
                  Report Another Incident
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden font-sans">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-4 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 transition-all active:scale-95"
        >
          {isMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-blue-600 to-blue-800 transform transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] lg:relative lg:translate-x-0 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div className="p-8 border-b border-blue-400/30 bg-gradient-to-br from-blue-500/20 to-blue-700/20 backdrop-blur-sm">
            <Link to="/" className="flex items-center space-x-3 group relative">
              <div className="absolute -inset-2 bg-white/10 rounded-2xl scale-75 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 blur-xl"></div>
              <div className="relative w-11 h-11 bg-gradient-to-tr from-white to-blue-100 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/30 group-hover:shadow-blue-900/50 transition-all duration-500 group-hover:-rotate-6">
                <MapPinIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="relative text-left">
                <h1 className="text-xl font-bold text-white tracking-tight leading-none">
                  Urban<span className="text-cyan-300">Insights</span>
                </h1>
                <p className="text-xs font-medium text-cyan-200 mt-1 opacity-90">Citizen Portal</p>
              </div>
            </Link>
          </div>

          {/* User Section */}
          <div className="px-6 py-4 border-b border-blue-400/30">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-900/20">
                <UserIcon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-cyan-200 opacity-80 truncate">{user?.email || 'user@example.com'}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <Link
              to="/dashboard"
              className="group flex items-center space-x-3 px-4 py-3 text-white/90 hover:bg-white/10 hover:text-white rounded-xl font-medium transition-all duration-300 hover:translate-x-1 hover:shadow-lg hover:shadow-blue-900/20"
            >
              <HomeIcon className="h-5 w-5 text-cyan-300 transition-transform group-hover:scale-110 group-hover:text-white" />
              <span className="tracking-tight">Overview</span>
            </Link>
            <Link
              to="/complaint-history"
              className="group flex items-center space-x-3 px-4 py-3 text-white/70 hover:bg-white/10 hover:text-white rounded-xl font-medium transition-all duration-300 hover:translate-x-1 hover:shadow-lg hover:shadow-blue-900/20"
            >
              <ClockIcon className="h-5 w-5 text-blue-300 transition-colors group-hover:text-cyan-300" />
              <span className="tracking-tight">Complaint History</span>
            </Link>
            <Link
              to="/submit-complaint"
              className="group flex items-center space-x-3 px-4 py-3 text-white/90 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-all duration-300 hover:translate-x-1 hover:shadow-lg hover:shadow-blue-900/20"
            >
              <PlusCircleIcon className="h-5 w-5 text-cyan-300 transition-transform group-hover:scale-110 group-hover:text-white" />
              <span className="tracking-tight">New Incident</span>
            </Link>
          </nav>

          {/* Sign Out Section */}
          <div className="p-4 border-t border-blue-400/30">
            <button
              onClick={handleLogout}
              className="group w-full flex items-center space-x-3 px-4 py-3 text-white/70 hover:bg-red-500/20 hover:text-white rounded-xl font-medium transition-all duration-300 hover:translate-x-1 hover:shadow-lg hover:shadow-red-900/20"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 text-red-300 transition-colors group-hover:text-white" />
              <span className="tracking-tight">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-30 transition-opacity" onClick={() => setIsMenuOpen(false)}></div>
      )}

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto">
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-2xl shadow-sm">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-3" />
                <div>
                  <h3 className="text-sm font-semibold text-red-800 uppercase tracking-wider">Submission Error</h3>
                  <p className="text-xs text-red-600 font-medium mt-0.5">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100/50 overflow-hidden">
            <div className="px-12 py-16 sm:px-16">
              <div className="mb-12 text-center">
                <div className="inline-flex p-4 rounded-3xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 mb-6 shadow-lg">
                  <ExclamationTriangleIcon className="h-8 w-8" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-3">Report Incident</h2>
                <p className="text-base text-gray-600 font-medium">Help us keep our city humming. Share the details below.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Two Column Layout - Top Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Complaint Title */}
                  <div className="space-y-2">
                    <label htmlFor="title" className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">Complaint Title</label>
                    <input 
                      type="text" 
                      name="title" 
                      id="title" 
                      required 
                      className="block w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white shadow-sm transition-all duration-200 hover:border-gray-300" 
                      placeholder="What's the issue?" 
                      value={formData.title} 
                      onChange={handleChange} 
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <label htmlFor="category" className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">Category</label>
                    <div className="relative">
                      <select 
                        id="category" 
                        name="category" 
                        required 
                        className="block w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white shadow-sm transition-all duration-200 cursor-pointer hover:border-gray-300" 
                        value={formData.category} 
                        onChange={handleChange}
                      >
                        <option value="">Select Category</option>
                        {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Full Width Description */}
                <div className="space-y-2">
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">Description</label>
                  <textarea 
                    id="description" 
                    name="description" 
                    rows={4} 
                    required 
                    className="block w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white shadow-sm transition-all duration-200 resize-none hover:border-gray-300" 
                    placeholder="Tell us exactly what happened..." 
                    value={formData.description} 
                    onChange={handleChange} 
                  />
                </div>

                {/* Two Column Layout - Location and Priority */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Location */}
                  <div className="space-y-2">
                    <label htmlFor="location" className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">Location</label>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        name="location" 
                        id="location" 
                        required 
                        className="flex-1 px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white shadow-sm transition-all duration-200 hover:border-gray-300" 
                        placeholder="Address or Landmark" 
                        value={formData.location} 
                        onChange={handleChange} 
                      />
                      <button 
                        type="button" 
                        onClick={getCurrentLocation} 
                        disabled={fetchingLocation} 
                        className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 rounded-xl hover:from-blue-100 hover:to-blue-200 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md group"
                      >
                        <MapPinIcon className={`h-5 w-5 ${fetchingLocation ? 'animate-bounce' : 'group-hover:scale-110 transition-transform duration-200'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Priority Level */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">Priority Level</label>
                    <div className="grid grid-cols-3 gap-3">
                      {priorities.map((p) => (
                        <button 
                          key={p.value} 
                          type="button" 
                          onClick={() => setFormData(prev => ({ ...prev, priority: p.value }))} 
                          className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md ${
                            formData.priority === p.value 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Two Column Layout - Coordinates */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">Latitude</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 font-medium outline-none opacity-60 shadow-sm" 
                      value={formData.latitude} 
                      readOnly 
                      placeholder="0.000000" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">Longitude</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 font-medium outline-none opacity-60 shadow-sm" 
                      value={formData.longitude} 
                      readOnly 
                      placeholder="0.000000" 
                    />
                  </div>
                </div>

                {/* Evidence Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">Evidence / Photos</label>
                  <label className="group relative block w-full aspect-video border-2 border-dashed border-gray-300 rounded-2xl hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200 cursor-pointer overflow-hidden">
                    <input type="file" multiple accept="image/*" className="sr-only" onChange={handleImageUpload} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200 shadow-sm">
                        <PhotoIcon className="h-8 w-8" />
                      </div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Click to upload photos</p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 10MB each</p>
                    </div>
                  </label>
                  
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-24 object-cover rounded-xl shadow-sm group-hover:shadow-md transition-shadow duration-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:bg-red-600"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl hover:shadow-blue-200/50 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      'Submit Report'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className="mt-8 flex items-center justify-center space-x-2 text-gray-400">
            <CheckCircleIcon className="h-4 w-4" />
            <p className="text-[10px] font-medium text-gray-400 uppercase">End-to-End Encrypted Data Submission</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ComplaintSubmission;
