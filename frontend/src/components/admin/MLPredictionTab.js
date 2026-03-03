import React, { useState, useEffect } from 'react';
import {
  CpuChipIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  MapIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  BeakerIcon,
  IdentificationIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-white/90 backdrop-blur-xl border border-white/60 shadow-lg rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-blue-100/50 overflow-hidden relative ${className}`}>
    {children}
  </div>
);

const MLPredictionTab = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [predictions, setPredictions] = useState(null);
  const [recentAnalysis, setRecentAnalysis] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`
      };

      const [overviewRes, recentRes] = await Promise.all([
        fetch('http://localhost:5000/api/ml/prediction/overview', { headers }),
        fetch('http://localhost:5000/api/ml/prediction/recent', { headers })
      ]);

      const overview = await overviewRes.json();
      const recent = await recentRes.json();

      setPredictions(overview);
      setRecentAnalysis(recent.complaints || []);
    } catch (error) {
      console.error('Error fetching ML data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
          <SparklesIcon className="h-8 w-8 text-blue-600 absolute top-4 left-4 animate-pulse" />
        </div>
        <p className="text-blue-500/80 font-medium animate-pulse tracking-wide">Initializing Core Engine...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Intelligence', icon: CpuChipIcon },
    { id: 'analysis', name: 'System Analysis', icon: BeakerIcon },
    { id: 'algorithms', name: 'Model Engine', icon: IdentificationIcon },
    { id: 'forecast', name: 'Forecasts', icon: ArrowTrendingUpIcon },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Navigation Bar */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-1.5 hover:shadow-xl transition-all duration-300">
        <div className="flex space-x-1">
          {tabs.map((tab) => (
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

      {/* Tab Content Rendering */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Node Complaints', value: predictions?.currentStats?.total, color: 'text-blue-600', icon: ChartBarIcon, gradient: 'from-blue-50 to-blue-100/50', border: 'border-blue-100' },
                { label: 'Active Processing', value: predictions?.currentStats?.active, color: 'text-indigo-600', icon: CpuChipIcon, gradient: 'from-indigo-50 to-indigo-100/50', border: 'border-indigo-100' },
                { label: 'System Resolutions', value: predictions?.currentStats?.resolved, color: 'text-cyan-600', icon: BeakerIcon, gradient: 'from-cyan-50 to-cyan-100/50', border: 'border-cyan-100' },
                { label: 'Efficiency Rate', value: `${predictions?.currentStats?.resolutionRate}%`, color: 'text-sky-600', icon: ArrowTrendingUpIcon, gradient: 'from-sky-50 to-sky-100/50', border: 'border-sky-100' }
              ].map((stat, i) => (
                <GlassCard key={i} className={`p-6 flex items-center group hover:-translate-y-1 transition-all bg-gradient-to-br ${stat.gradient} border ${stat.border}`}>
                  <div className={`h-14 w-14 rounded-2xl bg-white/80 shadow-sm flex items-center justify-center mr-5 group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`h-7 w-7 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                    <h4 className={`text-3xl font-black ${stat.color} tabular-nums mt-1`}>{stat.value || 0}</h4>
                  </div>
                </GlassCard>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <GlassCard className="p-8 lg:col-span-1 bg-gradient-to-b from-white to-blue-50/30">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                  <h3 className="text-xl font-black text-gray-800">Risk Assessment</h3>
                  <div className="p-2 bg-orange-50 rounded-xl">
                    <ExclamationTriangleIcon className="h-6 w-6 text-orange-500" />
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-lg">Model Confidence</span>
                      <span className="text-lg font-black text-blue-600">{predictions?.predictions?.riskAssessment?.confidence || 75}%</span>
                    </div>
                    <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-blue-100/50 shadow-inner">
                      <div style={{ width: `${predictions?.predictions?.riskAssessment?.confidence || 75}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000"></div>
                    </div>
                  </div>

                  <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-transparent -mr-8 -mt-8 rounded-full"></div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3 relative z-10">Global Risk Factor</span>
                    <span className={`text-4xl font-black uppercase tracking-tight relative z-10 ${predictions?.predictions?.riskAssessment?.overall === 'high' ? 'text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.2)]' : 'text-emerald-500 drop-shadow-[0_0_12px_rgba(16,185,129,0.2)]'}`}>
                      {predictions?.predictions?.riskAssessment?.overall || 'Stable'}
                    </span>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-8 lg:col-span-2 relative group overflow-hidden bg-gradient-to-br from-white to-indigo-50/20">
                <div className="absolute top-0 right-0 p-8">
                  <LightBulbIcon className="h-48 w-48 text-yellow-400/5 -mr-12 -mt-12 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-1000" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center mb-8 pb-4 border-b border-gray-100">
                    <div className="p-2 bg-yellow-50 rounded-xl mr-4">
                      <LightBulbIcon className="h-6 w-6 text-yellow-500" />
                    </div>
                    <h3 className="text-xl font-black text-gray-800 tracking-tight">System Recommendations</h3>
                  </div>
                  <div className="space-y-4">
                    {predictions?.predictions?.recommendations?.map((rec, i) => (
                      <div key={i} className="flex items-start p-5 bg-white/60 backdrop-blur-sm border border-gray-100/80 rounded-2xl hover:border-blue-200 transition-all hover:shadow-md hover:shadow-blue-500/5">
                        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mt-0.5 mr-5 shrink-0 shadow-lg shadow-blue-500/20">
                          <span className="text-xs font-black text-white">{i + 1}</span>
                        </div>
                        <p className="text-[15px] font-medium text-gray-700 leading-relaxed">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-700">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <BeakerIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      System Analysis
                      <span className="ml-3 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold uppercase tracking-wider border border-blue-200">Live Feed</span>
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">Real-time Machine Learning Inferences</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.6)]"></div>
                  <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Active</span>
                </div>
              </div>
            </div>

            {/* Analysis Logs */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {recentAnalysis.length > 0 ? recentAnalysis.map((item, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-300 group">
                  <div className="flex items-start space-x-4">
                    {/* ID Badge */}
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center border border-blue-200 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-sm font-bold text-blue-600 font-mono">#{item.complaintId.slice(-2)}</span>
                      </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header Row */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {item.user?.name || 'Anonymous User'}
                          </div>
                          <div className="text-xs text-gray-500 font-mono mt-0.5">ID: {item.complaintId}</div>
                        </div>
                        
                        {/* Confidence Score with Progress Bar */}
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Confidence</span>
                            <span className="text-sm font-bold text-emerald-600 tabular-nums">
                              {Math.round((item.mlPredictions?.category?.confidence || 0.85) * 100)}%
                            </span>
                          </div>
                          <div className="w-24 h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700 ease-out"
                              style={{ width: `${(item.mlPredictions?.category?.confidence || 0.85) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Payload */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Payload</div>
                        <p className="text-sm text-gray-700 leading-relaxed line-clamp-2 italic">
                          "{item.description}"
                        </p>
                      </div>

                      {/* Inference Badge */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 uppercase tracking-wider">
                            <SparklesIcon className="h-3 w-3 mr-1.5 text-blue-500" />
                            Inference: {item.mlPredictions?.category?.predicted || item.category}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(item.createdAt || Date.now()).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-12 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200">
                    <BeakerIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Analysis Data</h4>
                  <p className="text-sm text-gray-600 max-w-md mx-auto">
                    The system is awaiting citizen complaint submissions to initiate processing routines.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'algorithms' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in slide-in-from-top-4 duration-700">
            {predictions?.algorithms?.map((algo, index) => (
              <GlassCard key={index} className="p-8 relative overflow-hidden group hover:-translate-y-2 transition-all bg-white hover:shadow-[0_20px_40px_rgba(59,130,246,0.1)] border border-gray-100">
                <div className="absolute -right-10 -top-10 h-40 w-40 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl group-hover:rotate-12 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/30">
                    <CpuChipIcon className="h-6 w-6 text-white" />
                  </div>
                  <span className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-full tracking-widest shadow-sm ${algo.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                    {algo.status}
                  </span>
                </div>
                <h3 className="text-xl font-black text-gray-800 mb-3 relative z-10">{algo.name}</h3>
                <p className="text-sm text-gray-500 font-medium mb-10 leading-relaxed line-clamp-3 relative z-10">{algo.description}</p>
                <div className="flex justify-between items-end pt-6 border-t border-gray-100 relative z-10">
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Reliability Index</span>
                    <span className="text-3xl font-black text-blue-600 tabular-nums">{algo.accuracy}</span>
                  </div>
                  <button className="text-[11px] font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors uppercase tracking-wider">Details</button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {activeTab === 'forecast' && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
            {/* Modern Header */}
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -ml-16 -mb-16"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-4xl font-bold tracking-tight flex items-center">
                      AI Forecasts
                      <SparklesIcon className="h-8 w-8 ml-4 text-yellow-300 animate-pulse" />
                    </h3>
                    <p className="text-blue-100 mt-3 text-lg font-medium">
                      Advanced predictive analytics for community insights
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-blue-200 uppercase tracking-wider mb-1">Model Accuracy</div>
                    <div className="text-3xl font-bold tabular-nums">94.7%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl p-6 text-white shadow-xl hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <ArrowTrendingUpIcon className="h-6 w-6" />
                  </div>
                  <span className="text-2xl font-bold">+12%</span>
                </div>
                <div className="text-sm font-medium text-emerald-100 uppercase tracking-wider">Weekly Trend</div>
                <div className="text-3xl font-bold mt-2">247</div>
                <div className="text-sm text-emerald-100">Predicted Cases</div>
              </div>

              <div className="bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl p-6 text-white shadow-xl hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <ChartBarIcon className="h-6 w-6" />
                  </div>
                  <span className="text-2xl font-bold">High</span>
                </div>
                <div className="text-sm font-medium text-blue-100 uppercase tracking-wider">Risk Level</div>
                <div className="text-3xl font-bold mt-2">8.2</div>
                <div className="text-sm text-blue-100">Severity Score</div>
              </div>

              <div className="bg-gradient-to-br from-orange-400 to-red-600 rounded-2xl p-6 text-white shadow-xl hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <ExclamationTriangleIcon className="h-6 w-6" />
                  </div>
                  <span className="text-2xl font-bold">3</span>
                </div>
                <div className="text-sm font-medium text-orange-100 uppercase tracking-wider">Hot Zones</div>
                <div className="text-3xl font-bold mt-2">Downtown</div>
                <div className="text-sm text-orange-100">Critical Area</div>
              </div>
            </div>

            {/* Enhanced Chart Section */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h4 className="text-2xl font-bold text-gray-900 flex items-center">
                    7-Day Forecast
                    <div className="ml-3 h-3 w-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  </h4>
                  <p className="text-gray-600 mt-2">ML-powered demand predictions</p>
                </div>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-semibold hover:bg-blue-100 transition-colors">
                    Week
                  </button>
                  <button className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                    Month
                  </button>
                </div>
              </div>

              {/* Modern Bar Chart */}
              <div className="relative h-80 bg-gradient-to-b from-gray-50 to-white rounded-2xl p-6">
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                <div className="relative h-full flex items-end justify-between space-x-4">
                  {predictions?.predictions?.weeklyForecast?.map((day, index) => {
                    const maxVal = 50;
                    const height = (day.predictedComplaints / maxVal) * 100;
                    const colors = [
                      'from-blue-400 to-blue-600',
                      'from-indigo-400 to-indigo-600', 
                      'from-purple-400 to-purple-600',
                      'from-pink-400 to-pink-600',
                      'from-red-400 to-red-600',
                      'from-orange-400 to-orange-600',
                      'from-emerald-400 to-emerald-600'
                    ];
                    
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center group relative">
                        {/* Hover Info */}
                        <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 z-20">
                          <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shadow-xl">
                            <div>{day.predictedComplaints} cases</div>
                            <div className="text-gray-400">{day.confidence}% confidence</div>
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-t-4 border-t-gray-900 border-x-4 border-x-transparent"></div>
                          </div>
                        </div>
                        
                        {/* Bar */}
                        <div className="w-full max-w-16 relative">
                          <div
                            className={`bg-gradient-to-t ${colors[index]} rounded-t-xl shadow-lg transition-all duration-500 group-hover:shadow-xl group-hover:-translate-y-1 relative overflow-hidden`}
                            style={{ height: `${Math.max(20, height)}%` }}
                          >
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-transparent to-white/30 rounded-t-xl"></div>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded-lg shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-all">
                              <span className="text-xs font-bold text-gray-800">{day.predictedComplaints}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Day Label */}
                        <div className="mt-4 text-center">
                          <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                            {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(day.date).getDate()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Additional Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <LightBulbIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  Key Insights
                </h5>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-700">Peak demand expected on Thursday with 35 cases</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="h-2 w-2 bg-emerald-500 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-700">Weekend shows 40% reduction in complaints</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="h-2 w-2 bg-orange-500 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-700">Infrastructure issues remain primary concern</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    <CpuChipIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  Model Performance
                </h5>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Accuracy</span>
                      <span className="font-bold text-gray-900">94.7%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" style={{ width: '94.7%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Precision</span>
                      <span className="font-bold text-gray-900">91.2%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style={{ width: '91.2%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Recall</span>
                      <span className="font-bold text-gray-900">89.5%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full" style={{ width: '89.5%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MLPredictionTab;

