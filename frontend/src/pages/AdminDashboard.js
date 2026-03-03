import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  UsersIcon,
  DocumentTextIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  CpuChipIcon,
  ChartBarIcon,
  SparklesIcon,
  ClockIcon,
  BellIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import MLPredictionTab from '../components/admin/MLPredictionTab';
import ComplaintManagement from '../components/admin/ComplaintManagement';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');
  const [mlData, setMlData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const navigate = useNavigate();

  // Modern Glass Card Component
  const GlassCard = ({ children, className = "" }) => (
    <div className={`bg-white/80 backdrop-blur-xl border border-white/60 shadow-lg rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-blue-100/50 overflow-hidden relative ${className}`}>
      {children}
    </div>
  );

  // Fetch ML data
  const fetchMLData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/ml/prediction/overview', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setMlData(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching ML data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is logged in and is admin
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userData);
    if (user.userType !== 'admin') {
      navigate('/dashboard'); // Redirect non-admin users
      return;
    }

    setUser(user);
    fetchMLData(); // Fetch ML data on component mount

    // Set up auto-refresh for ML data
    const interval = setInterval(fetchMLData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Enhanced chart colors with modern gradients
  const complaintsByCategory = {
    labels: ['Infrastructure', 'Sanitation', 'Water Supply', 'Roads', 'Public Safety', 'Electricity'],
    datasets: [
      {
        label: 'Number of Complaints',
        data: [45, 38, 32, 28, 25, 20],
        backgroundColor: [
          'rgba(99, 102, 241, 0.9)',  // Indigo
          'rgba(34, 197, 94, 0.9)',   // Green
          'rgba(59, 130, 246, 0.9)',  // Blue
          'rgba(251, 146, 60, 0.9)',  // Orange
          'rgba(168, 85, 247, 0.9)',  // Purple
          'rgba(236, 72, 153, 0.9)'   // Pink
        ],
        borderColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(251, 146, 60, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(236, 72, 153, 1)'
        ],
        borderWidth: 2,
        borderRadius: 12,
        borderSkipped: false,
      },
    ],
  };

  const complaintsByStatus = {
    labels: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
    datasets: [
      {
        data: [30, 45, 120, 5],
        backgroundColor: [
          'rgba(251, 191, 36, 0.9)',
          'rgba(59, 130, 246, 0.9)',
          'rgba(34, 197, 94, 0.9)',
          'rgba(239, 68, 68, 0.9)'
        ],
        borderColor: [
          'rgba(251, 191, 36, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const weeklyTrends = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Complaints Received',
        data: [12, 19, 15, 25, 22, 30, 18],
        borderColor: 'rgba(99, 102, 241, 1)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Complaints Resolved',
        data: [8, 12, 10, 18, 15, 25, 12],
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgba(34, 197, 94, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const severityDistribution = {
    labels: ['Low', 'Medium', 'High', 'Critical'],
    datasets: [
      {
        data: [60, 80, 40, 20],
        backgroundColor: [
          'rgba(34, 197, 94, 0.9)',
          'rgba(251, 191, 36, 0.9)',
          'rgba(251, 146, 60, 0.9)',
          'rgba(239, 68, 68, 0.9)'
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(251, 146, 60, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  // Enhanced stats with ML integration
  const stats = [
    { 
      name: 'Total Users', 
      value: '1,234', 
      icon: UsersIcon, 
      change: '+12%', 
      changeType: 'increase',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50'
    },
    { 
      name: 'Total Complaints', 
      value: mlData?.currentStats?.total?.toLocaleString() || '2,456', 
      icon: DocumentTextIcon, 
      change: '+8%', 
      changeType: 'increase',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50'
    },
    { 
      name: 'ML Predictions', 
      value: mlData?.currentStats?.active?.toLocaleString() || '89', 
      icon: CpuChipIcon, 
      change: '+15%', 
      changeType: 'increase',
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50'
    },
    { 
      name: 'Resolution Rate', 
      value: `${mlData?.currentStats?.resolutionRate || 85}%`, 
      icon: CheckCircleIcon, 
      change: '+5%', 
      changeType: 'increase',
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50'
    },
  ];

  // Enhanced chart options
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(99, 102, 241, 0.5)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function (context) {
            return context.dataset.label + ': ' + context.parsed.y + ' complaints';
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            weight: '500'
          },
          color: '#6b7280'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(229, 231, 235, 0.5)',
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 12,
            weight: '500'
          },
          color: '#6b7280'
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          },
          color: '#374151'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(99, 102, 241, 0.5)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function (context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return context.label + ': ' + context.parsed + ' (' + percentage + '%)';
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          },
          color: '#374151',
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(99, 102, 241, 0.5)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            weight: '500'
          },
          color: '#6b7280'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(229, 231, 235, 0.5)',
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 12,
            weight: '500'
          },
          color: '#6b7280'
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  const hotspots = [
    { id: 1, area: 'Downtown District', complaints: 45, severity: 'High', trend: 'up' },
    { id: 2, area: 'Industrial Zone', complaints: 32, severity: 'Medium', trend: 'stable' },
    { id: 3, area: 'Residential North', complaints: 28, severity: 'Low', trend: 'down' },
    { id: 4, area: 'Commercial Center', complaints: 25, severity: 'High', trend: 'up' },
    { id: 5, area: 'University Area', complaints: 18, severity: 'Medium', trend: 'stable' },
  ];

  const recentActivity = [
    { id: 1, action: 'New complaint submitted', user: 'John Doe', time: '2 minutes ago', type: 'complaint' },
    { id: 2, action: 'Hotspot detected', area: 'Downtown District', time: '15 minutes ago', type: 'hotspot' },
    { id: 3, action: 'Complaint resolved', complaintId: 'CMP001', time: '1 hour ago', type: 'resolved' },
    { id: 4, action: 'Critical issue escalated', severity: 'High', time: '2 hours ago', type: 'critical' },
    { id: 5, action: 'New user registered', user: 'Jane Smith', time: '3 hours ago', type: 'user' },
  ];

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-red-500" />;
      case 'down':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 transform rotate-180" />;
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const getSeverityBadge = (severity) => {
    const colors = {
      'Low': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-orange-100 text-orange-800',
      'Critical': 'bg-red-100 text-red-800'
    };
    return `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[severity]}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Modern Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-white/60 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg shadow-blue-500/25">
                  <MapPinIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Urban Insights
                  </span>
                  <span className="ml-2 text-sm text-gray-500 font-medium">Admin Panel</span>
                </div>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {/* ML Status Indicator */}
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.6)]"></div>
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">ML Active</span>
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={fetchMLData}
                disabled={loading}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300"
              >
                <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {/* User Info */}
              <div className="flex items-center space-x-3 pl-3 pr-4 py-2 bg-gray-50 rounded-xl border border-gray-200">
                <UserIcon className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-semibold text-gray-700">
                  {user?.name || 'Admin'}
                </span>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 px-3 py-2 rounded-xl hover:bg-red-50 transition-all duration-300"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center">
                Admin Dashboard
                <SparklesIcon className="h-8 w-8 ml-3 text-blue-500 animate-pulse" />
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Monitor and manage community issues with AI-powered insights</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 uppercase tracking-wider">Last Updated</div>
              <div className="text-sm font-semibold text-gray-700 flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                {lastUpdate.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Modern Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/60 p-1.5 mb-8 hover:shadow-xl transition-all duration-300">
          <div className="flex space-x-1">
            {[
              { id: 'overview', name: 'Analytics Overview', icon: ChartBarIcon },
              { id: 'complaint-management', name: 'Complaint Management', icon: ExclamationTriangleIcon },
              { id: 'ml-prediction', name: 'ML Predictions', icon: CpuChipIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 relative ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className={`h-4 w-4 mr-2 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`} />
                {tab.name}
                {activeTab === tab.id && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 opacity-10"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'ml-prediction' ? (
          <MLPredictionTab />
        ) : activeTab === 'complaint-management' ? (
          <ComplaintManagement />
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Time Range Selector */}
            <div className="flex justify-end">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-4 py-2 bg-white/80 backdrop-blur-xl border border-white/60 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>

            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <GlassCard key={index} className="p-6 hover:scale-105 transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className={`h-6 w-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
                    </div>
                    <div className="flex items-center space-x-1">
                      {stat.changeType === 'increase' ? (
                        <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <ArrowTrendingUpIcon className="h-4 w-4 text-red-500 transform rotate-180" />
                      )}
                      <span className={`text-sm font-bold ${stat.changeType === 'increase' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">{stat.name}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                </GlassCard>
              ))}
            </div>

            {/* Enhanced Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Complaints by Category */}
              <GlassCard className="p-6 hover:scale-[1.02] transition-all duration-300">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <div className="p-2 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl mr-3 border border-indigo-100">
                    <ChartBarIcon className="h-5 w-5 text-indigo-600" />
                  </div>
                  Complaints by Category
                </h3>
                <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/60">
                  <Bar data={complaintsByCategory} options={barChartOptions} />
                </div>
              </GlassCard>

              {/* Complaints by Status */}
              <GlassCard className="p-6 hover:scale-[1.02] transition-all duration-300">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <div className="p-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl mr-3 border border-blue-100">
                    <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  Complaints by Status
                </h3>
                <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/60">
                  <Pie data={complaintsByStatus} options={pieChartOptions} />
                </div>
              </GlassCard>
            </div>

            {/* Enhanced Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Weekly Trends */}
              <GlassCard className="p-6 hover:scale-[1.02] transition-all duration-300">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <div className="p-2 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl mr-3 border border-emerald-100">
                    <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-600" />
                  </div>
                  Weekly Trends
                </h3>
                <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/60">
                  <Line data={weeklyTrends} options={lineChartOptions} />
                </div>
              </GlassCard>

              {/* Severity Distribution */}
              <GlassCard className="p-6 hover:scale-[1.02] transition-all duration-300">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <div className="p-2 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl mr-3 border border-orange-100">
                    <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />
                  </div>
                  Severity Distribution
                </h3>
                <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/60">
                  <Pie data={severityDistribution} options={pieChartOptions} />
                </div>
              </GlassCard>
            </div>

            {/* Enhanced Hotspots and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Hotspot Areas */}
              <GlassCard className="hover:scale-[1.02] transition-all duration-300">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <div className="p-2 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl mr-3 border border-red-100">
                      <MapPinIcon className="h-5 w-5 text-red-600" />
                    </div>
                    Hotspot Areas
                  </h3>
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Area
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Complaints
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Severity
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Trend
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white/50 divide-y divide-gray-100">
                        {hotspots.map((hotspot) => (
                          <tr key={hotspot.id} className="hover:bg-white/80 transition-colors duration-200">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                              {hotspot.area}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                              {hotspot.complaints}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={getSeverityBadge(hotspot.severity)}>
                                {hotspot.severity}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                              {getTrendIcon(hotspot.trend)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </GlassCard>

              {/* Recent Activity */}
              <GlassCard className="hover:scale-[1.02] transition-all duration-300">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <div className="p-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl mr-3 border border-purple-100">
                      <ArrowTrendingUpIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    Recent Activity
                  </h3>
                  <div className="flow-root">
                    <ul className="-mb-8">
                      {recentActivity.map((activity, index) => (
                        <li key={activity.id}>
                          <div className="relative pb-8">
                            {index !== recentActivity.length - 1 && (
                              <span
                                className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                aria-hidden="true"
                              />
                            )}
                            <div className="relative flex space-x-3">
                              <div>
                                <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white/80 shadow-md ${activity.type === 'complaint' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                                    activity.type === 'hotspot' ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                                      activity.type === 'resolved' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                                        activity.type === 'critical' ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                                          'bg-gradient-to-r from-purple-500 to-pink-500'
                                  }`}>
                                  <span className="text-white text-xs font-bold">
                                    {activity.type === 'complaint' ? 'C' :
                                      activity.type === 'hotspot' ? 'H' :
                                        activity.type === 'resolved' ? 'R' :
                                          activity.type === 'critical' ? '!' :
                                            'U'}
                                  </span>
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">{activity.action}</p>
                                  <p className="text-sm text-gray-600">
                                    {activity.user || activity.area || activity.severity}
                                  </p>
                                </div>
                                <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                  <time dateTime={activity.time}>{activity.time}</time>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
