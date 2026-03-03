import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  Bars3Icon,
  XMarkIcon,
  MapPinIcon,
  UserIcon,
  HomeIcon,
  PlusCircleIcon,
  ArrowRightOnRectangleIcon,
  TrashIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

const ComplaintHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, complaintId: null, complaintTitle: '' });
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
    setTimeout(() => setToast({ isVisible: false, message: '', type: 'success' }), 3000);
  };

  const handleDeleteClick = (complaintId, complaintTitle) => {
    setDeleteModal({ isOpen: true, complaintId, complaintTitle });
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/complaints/${deleteModal.complaintId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setComplaints(complaints.filter(c => c._id !== deleteModal.complaintId));
        showToast('Complaint deleted successfully', 'success');
        setDeleteModal({ isOpen: false, complaintId: null, complaintTitle: '' });
      } else {
        showToast('Failed to delete complaint', 'error');
      }
    } catch (error) {
      showToast('Network error. Please try again.', 'error');
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to view complaints');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/complaints/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setComplaints(data.complaints || []);
      } else {
        setError(data.message || 'Failed to fetch complaints');
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'Infrastructure', 'Sanitation', 'Water Supply', 'Electricity', 'Roads', 'Public Safety', 'Noise Pollution', 'Other'];
  const statuses = ['all', 'pending', 'in-progress', 'resolved', 'rejected', 'closed'];

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (complaint.complaintId && complaint.complaintId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || complaint.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || complaint.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: ClockIcon },
      'in-progress': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: EyeIcon },
      'resolved': { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircleIcon },
      'rejected': { color: 'bg-red-100 text-red-800 border-red-200', icon: ExclamationTriangleIcon },
      'closed': { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: CheckCircleIcon }
    };

    const config = statusConfig[status] || statusConfig['pending'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold uppercase rounded-full border shadow-sm ${config.color} transition-all duration-200`}>
        <Icon className="h-3 w-3 mr-1.5" />
        {status.replace('-', ' ')}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      'low': { color: 'bg-gray-100 text-gray-800 border-gray-200' },
      'medium': { color: 'bg-orange-100 text-orange-800 border-orange-200' },
      'high': { color: 'bg-red-100 text-red-800 border-red-200' }
    };

    const config = priorityConfig[priority] || priorityConfig['medium'];

    return (
      <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold uppercase rounded-full border shadow-sm ${config.color} transition-all duration-200`}>
        {priority}
      </span>
    );
  };

  const getStatusBorderColor = (status) => {
    const borderColors = {
      'pending': 'border-l-yellow-400',
      'in-progress': 'border-l-blue-400',
      'resolved': 'border-l-green-400',
      'rejected': 'border-l-red-400',
      'closed': 'border-l-gray-400'
    };
    return borderColors[status] || 'border-l-gray-400';
  };

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
              className="group flex items-center space-x-3 px-4 py-3 text-white/90 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-all duration-300 hover:translate-x-1 hover:shadow-lg hover:shadow-blue-900/20"
            >
              <ClockIcon className="h-5 w-5 text-cyan-300 transition-transform group-hover:scale-110 group-hover:text-white" />
              <span className="tracking-tight">Complaint History</span>
            </Link>
            <Link
              to="/submit-complaint"
              className="group flex items-center space-x-3 px-4 py-3 text-white/70 hover:bg-white/10 hover:text-white rounded-xl font-medium transition-all duration-300 hover:translate-x-1 hover:shadow-lg hover:shadow-blue-900/20"
            >
              <PlusCircleIcon className="h-5 w-5 text-blue-300 transition-colors group-hover:text-cyan-300" />
              <span className="tracking-tight">New Incident</span>
            </Link>
          </nav>

          {/* Sign Out Section (Bottom) */}
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

      {/* Overlay for mobile sidebar */}
      {isMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-30 transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
          {/* Page Header */}
          <header className="mb-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Activity Log</h1>
                <p className="text-lg text-gray-600 font-medium">Monitoring and managing your community reports.</p>
              </div>
              <Link
                to="/submit-complaint"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl text-sm font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-200/50 active:scale-95 transform"
              >
                <PlusCircleIcon className="h-5 w-5 mr-3" />
                New Report
              </Link>
            </div>
          </header>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && (
            <div>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                {[
                  { label: 'Total Reports', count: complaints.length, icon: ClockIcon, color: 'blue' },
                  { label: 'Pending', count: complaints.filter(c => c.status === 'pending').length, icon: ExclamationTriangleIcon, color: 'yellow' },
                  { label: 'In Progress', count: complaints.filter(c => c.status === 'in-progress').length, icon: EyeIcon, color: 'indigo' },
                  { label: 'Resolved', count: complaints.filter(c => c.status === 'resolved').length, icon: CheckCircleIcon, color: 'green' }
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  const colorClasses = {
                    blue: 'from-blue-500 to-blue-600 text-blue-600 shadow-blue-200/50',
                    yellow: 'from-yellow-500 to-yellow-600 text-yellow-600 shadow-yellow-200/50',
                    indigo: 'from-indigo-500 to-indigo-600 text-indigo-600 shadow-indigo-200/50',
                    green: 'from-green-500 to-green-600 text-green-600 shadow-green-200/50'
                  };
                  return (
                    <div key={i} className="group relative overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[stat.color]} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
                      <div className="relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100/50">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[stat.color]} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div className={`text-3xl font-bold text-gray-900 group-hover:scale-105 transition-transform duration-300`}>
                            {stat.count}
                          </div>
                        </div>
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">{stat.label}</h3>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Filters */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 p-8 mb-10">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  <div className="flex-1 relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-300 group-focus-within:text-blue-500 transition-colors duration-200" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-gray-900 font-semibold placeholder-gray-400 transition-all duration-200 outline-none"
                      placeholder="Search incident ID, title, or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <select
                      className="px-6 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-900 font-semibold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 cursor-pointer hover:border-gray-300"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      {statuses.map(s => (
                        <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.replace('-', ' ').toUpperCase()}</option>
                      ))}
                    </select>

                    <select
                      className="px-6 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-900 font-semibold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 cursor-pointer hover:border-gray-300"
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                    >
                      {categories.map(c => (
                        <option key={c} value={c}>{c === 'all' ? 'All Categories' : c.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Complaints List */}
              <div className="space-y-6">
                {filteredComplaints.length === 0 ? (
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 p-16 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                      <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">No matching logs found</h3>
                    <p className="text-sm text-gray-600 max-w-md mx-auto">Try adjusting your search terms or filters to find what you're looking for.</p>
                  </div>
                ) : (
                  filteredComplaints.map((complaint) => (
                    <div key={complaint._id} className={`group bg-white rounded-3xl shadow-sm border border-gray-100/50 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${getStatusBorderColor(complaint.status)} border-l-4`}>
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="px-4 py-2 bg-blue-50 text-blue-700 text-xs font-bold uppercase rounded-full border border-blue-200 shadow-sm">
                              {complaint.complaintId || `CMP-${complaint._id.slice(-6).toUpperCase()}`}
                            </span>
                            {getStatusBadge(complaint.status)}
                            {getPriorityBadge(complaint.priority)}
                          </div>

                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 tracking-tight group-hover:text-blue-700 transition-colors duration-200">{complaint.title}</h3>
                            <p className="text-gray-600 mt-3 font-medium leading-relaxed max-w-3xl">{complaint.description}</p>
                          </div>

                          <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-gray-500">
                            <span className="flex items-center space-x-2 px-3 py-1 bg-gray-50 rounded-lg">
                              <MapPinIcon className="h-4 w-4 text-blue-500" />
                              <span>{complaint.location?.address || 'Geolocation Recorded'}</span>
                            </span>
                            <span className="flex items-center space-x-2 px-3 py-1 bg-gray-50 rounded-lg">
                              <PlusCircleIcon className="h-4 w-4 text-indigo-500" />
                              <span>{complaint.category}</span>
                            </span>
                            <span className="flex items-center space-x-2 px-3 py-1 bg-gray-50 rounded-lg">
                              <ClockIcon className="h-4 w-4 text-gray-400" />
                              <span>{new Date(complaint.createdAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                          <button className="inline-flex items-center px-6 py-3 bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:text-blue-700 hover:border-blue-300 hover:bg-blue-50 rounded-2xl shadow-sm transition-all duration-200 active:scale-95">
                            <EyeIcon className="h-4 w-4 mr-2" />
                            Details
                          </button>
                          <Link to="/submit-complaint" className="inline-flex items-center px-6 py-3 bg-blue-50 text-blue-700 text-sm font-semibold rounded-2xl text-center shadow-sm hover:bg-blue-100 transition-all duration-200 active:scale-95">
                            <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                            Duplicate
                          </Link>
                          <button 
                            onClick={() => handleDeleteClick(complaint._id, complaint.title)}
                            className="inline-flex items-center px-6 py-3 bg-red-50 text-red-700 text-sm font-semibold rounded-2xl text-center shadow-sm hover:bg-red-100 transition-all duration-200 active:scale-95"
                          >
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setDeleteModal({ isOpen: false, complaintId: null, complaintTitle: '' })}
          ></div>
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-6">
              <TrashIcon className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">Delete Complaint</h3>
            <p className="text-gray-600 text-center mb-8">
              Are you sure you want to delete "<span className="font-semibold text-gray-900">{deleteModal.complaintTitle}</span>"? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteModal({ isOpen: false, complaintId: null, complaintTitle: '' })}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-2xl hover:bg-gray-200 transition-all duration-200 active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-2xl hover:bg-red-700 transition-all duration-200 active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.isVisible && (
        <div className={`fixed bottom-8 right-8 z-50 transform transition-all duration-300 ${toast.isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
          <div className={`px-6 py-4 rounded-2xl shadow-lg text-white font-semibold flex items-center space-x-3 ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5" />
            ) : (
              <ExclamationTriangleIcon className="h-5 w-5" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintHistory;
