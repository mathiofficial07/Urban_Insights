import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  DocumentTextIcon,
  MapPinIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  PlusCircleIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
    inProgressComplaints: 0
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(userData));

    // Fetch dashboard data
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/complaints/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const complaints = data.complaints || [];

        // Calculate stats
        const stats = {
          totalComplaints: complaints.length,
          pendingComplaints: complaints.filter(c => c.status === 'pending').length,
          resolvedComplaints: complaints.filter(c => c.status === 'resolved').length,
          inProgressComplaints: complaints.filter(c => c.status === 'in-progress').length
        };

        setStats(stats);
        setRecentComplaints(complaints.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getStatusBadge = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'resolved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'closed': 'bg-gray-100 text-gray-800'
    };
    return `inline-flex px-2 py-1 text-xs font-medium rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      'low': 'bg-gray-100 text-gray-800',
      'medium': 'bg-orange-100 text-orange-800',
      'high': 'bg-red-100 text-red-800',
      'critical': 'bg-purple-100 text-purple-800'
    };
    return `inline-flex px-2 py-1 text-xs font-medium rounded-full ${colors[priority] || 'bg-gray-100 text-gray-800'}`;
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
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
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-blue-600 to-blue-800 transform transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] lg:relative lg:translate-x-0 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
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
      <main className="flex-1 h-full overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10">
          {/* Welcome Header */}
          <header className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                Welcome back, <span className="text-blue-600">{user?.name || 'User'}</span>!
              </h1>
              <p className="text-lg text-gray-600 font-medium">Here's what's happening with your complaints today.</p>
            </div>
            <Link
              to="/submit-complaint"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl text-sm font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-200/50 active:scale-95 transform"
            >
              <PlusCircleIcon className="h-5 w-5 mr-3" />
              Report New Issue
            </Link>
          </header>

          {/* Stats Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Total Files', val: stats.totalComplaints, icon: DocumentTextIcon, color: 'blue' },
              { label: 'Pending', val: stats.pendingComplaints, icon: ClockIcon, color: 'yellow' },
              { label: 'In Progress', val: stats.inProgressComplaints, icon: ChartBarIcon, color: 'indigo' },
              { label: 'Resolved', val: stats.resolvedComplaints, icon: CheckCircleIcon, color: 'green' }
            ].map((stat, index) => {
              const Icon = stat.icon;
              const colorClasses = {
                blue: 'from-blue-500 to-blue-600 text-blue-600 shadow-blue-200/50',
                yellow: 'from-yellow-500 to-yellow-600 text-yellow-600 shadow-yellow-200/50',
                indigo: 'from-indigo-500 to-indigo-600 text-indigo-600 shadow-indigo-200/50',
                green: 'from-green-500 to-green-600 text-green-600 shadow-green-200/50'
              };
              return (
                <div key={index} className="group relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[stat.color]} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  <div className="relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[stat.color]} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className={`text-3xl font-bold text-gray-900 group-hover:scale-105 transition-transform duration-300`}>
                        {stat.val}
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">{stat.label}</h3>
                  </div>
                </div>
              );
            })}
          </section>

          {/* Recent Activity Section */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden">
            <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Recent Activity</h3>
                  <p className="text-sm font-medium text-gray-500">Last 5 submissions</p>
                </div>
                <Link
                  to="/complaint-history"
                  className="inline-flex items-center px-6 py-3 bg-blue-50 text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-all duration-300 hover:shadow-md hover:shadow-blue-200/50 active:scale-95"
                >
                  View All History
                  <ArrowRightOnRectangleIcon className="h-4 w-4 ml-2 rotate-180" />
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto">
              {recentComplaints.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Title</th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Category</th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Priority</th>
                      <th className="px-8 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentComplaints.map((complaint) => (
                      <tr key={complaint._id} className="hover:bg-blue-50/30 transition-colors duration-200 group">
                        <td className="px-8 py-5">
                          <p className="text-sm font-semibold text-gray-900 tracking-tight group-hover:text-blue-700 transition-colors">{complaint.title}</p>
                          <p className="text-xs text-gray-500 font-medium mt-1">
                            {new Date(complaint.createdAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                        </td>
                        <td className="px-8 py-5">
                          <span className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold border border-gray-200 group-hover:bg-blue-100 group-hover:text-blue-700 transition-all duration-200">
                            {complaint.category}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold uppercase shadow-sm ${getStatusBadge(complaint.status)}`}>
                            {complaint.status}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold uppercase shadow-sm ${getPriorityBadge(complaint.priority)}`}>
                            {complaint.priority}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button className="inline-flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg text-xs font-semibold transition-all duration-200 group">
                            View Details
                            <ArrowRightOnRectangleIcon className="h-3 w-3 ml-1.5 rotate-180 group-hover:translate-x-0.5 transition-transform duration-200" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="px-8 py-20 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">No Community Reports Found</h3>
                  <p className="text-sm text-gray-600 max-w-md mx-auto mb-8 leading-relaxed">Your reports will help your community grow. Start by sharing an issue you've encountered.</p>
                  <Link
                    to="/submit-complaint"
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl text-sm font-bold hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl hover:shadow-blue-200/50 active:scale-95 transition-all duration-300 transform"
                  >
                    <PlusCircleIcon className="h-5 w-5 mr-3" />
                    Submit First Report
                  </Link>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
