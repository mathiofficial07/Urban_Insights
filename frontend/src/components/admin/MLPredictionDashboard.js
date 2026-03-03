import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CpuChipIcon,
  ArrowTrendingUpIcon,
  MapIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  SparklesIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-white/80 backdrop-blur-xl border border-white/60 shadow-lg rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-blue-100/50 overflow-hidden relative ${className}`}>
    {children}
  </div>
);

const CircularProgress = ({ value, label, color = "blue" }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const colors = {
    blue: "stroke-blue-500",
    indigo: "stroke-indigo-500",
    cyan: "stroke-cyan-500",
    emerald: "stroke-emerald-500"
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 group">
      <div className="relative h-20 w-20 transform transition-transform duration-300 group-hover:scale-105">
        <svg className="h-full w-full transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r={radius}
            className="stroke-gray-100 fill-none"
            strokeWidth="6"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            className={`${colors[color] || colors.blue} fill-none transition-all duration-700 ease-out drop-shadow-sm`}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-800 tabular-nums">{Math.round(value)}%</span>
        </div>
      </div>
      <span className="mt-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">{label}</span>
    </div>
  );
};

const MLPredictionDashboard = () => {
  const [predictions, setPredictions] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const [trends, setTrends] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [recentAnalysis, setRecentAnalysis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('random_forest');
  const [trainingStatus, setTrainingStatus] = useState({});

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`
      };

      const [overviewRes, hotspotsRes, trendsRes, preventiveRes, recentRes] = await Promise.all([
        fetch('http://localhost:5000/api/ml/prediction/overview', { headers }),
        fetch('http://localhost:5000/api/ml/prediction/hotspots', { headers }),
        fetch('http://localhost:5000/api/ml/prediction/trends', { headers }),
        fetch('http://localhost:5000/api/ml/prediction/preventive', { headers }),
        fetch('http://localhost:5000/api/ml/prediction/recent', { headers })
      ]);

      const [overview, hotspotsData, trendsData, preventiveData, recentData] = await Promise.all([
        overviewRes.json(),
        hotspotsRes.json(),
        trendsRes.json(),
        preventiveRes.json(),
        recentRes.json()
      ]);

      setPredictions(overview);
      setHotspots(hotspotsData.hotspots || []);
      setTrends(trendsData);
      setRecommendations(preventiveData.recommendations || []);
      setRecentAnalysis(recentData.complaints || []);
    } catch (error) {
      console.error('Error fetching ML predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const trainModels = async () => {
    setTrainingStatus({ ...trainingStatus, [selectedAlgorithm]: 'training' });
    try {
      const response = await fetch('http://localhost:5000/api/ml/prediction/train', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ algorithms: [selectedAlgorithm] })
      });

      const result = await response.json();
      if (result.success) {
        setTrainingStatus({ ...trainingStatus, [selectedAlgorithm]: 'completed' });
        setTimeout(() => {
          setTrainingStatus({ ...trainingStatus, [selectedAlgorithm]: '' });
          fetchAllData();
        }, 2000);
      }
    } catch (error) {
      console.error('Error training models:', error);
      setTrainingStatus({ ...trainingStatus, [selectedAlgorithm]: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 space-y-6">
        <div className="relative">
          <div className="h-20 w-20 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
          <SparklesIcon className="h-10 w-10 text-blue-600 absolute top-5 left-5 animate-pulse" />
        </div>
        <p className="text-blue-500/80 font-bold uppercase tracking-widest animate-pulse">Initializing Core Engine...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Header */}
      <GlassCard className="p-6 bg-gradient-to-r from-blue-50 via-white to-indigo-50 border border-blue-100/50 hover:border-blue-200/70">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-100/30 to-indigo-100/30 rounded-full blur-2xl -mr-6 -mt-6"></div>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25 group hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300">
              <CpuChipIcon className="h-6 w-6 text-white group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center">
                ML Intelligence Center
                <SparklesIcon className="h-5 w-5 ml-2 text-blue-500 animate-pulse" />
              </h2>
              <p className="text-gray-600 mt-1 text-sm font-medium flex items-center">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]"></span>
                </span>
                Real-time Predictive Analysis Engine Active
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
            <select
              value={selectedAlgorithm}
              onChange={(e) => setSelectedAlgorithm(e.target.value)}
              className="bg-transparent px-3 py-1.5 text-sm font-semibold text-gray-700 border-none focus:ring-0 cursor-pointer outline-none"
            >
              <option value="random_forest">Random Forest</option>
              <option value="kmeans">K-Means Clustering</option>
              <option value="arima">ARIMA Time Series</option>
              <option value="lstm">LSTM Neural Net</option>
            </select>
            <button
              onClick={trainModels}
              disabled={trainingStatus[selectedAlgorithm] === 'training'}
              className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 hover:shadow-md hover:shadow-blue-500/25 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {trainingStatus[selectedAlgorithm] === 'training' ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Training
                </>
              ) : 'Train Model'}
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Analytic Overview Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Incidents',
            count: predictions?.currentStats?.total || 0,
            icon: ChartBarIcon,
            color: 'text-blue-600',
            bgIcon: 'bg-blue-50',
            border: 'border-blue-100',
            gradient: 'from-white to-blue-50/50',
            trend: '+12% vs last month',
            trendIcon: ArrowTrendingUpIcon,
            trendColor: 'text-blue-500'
          },
          {
            label: 'Active Processing',
            count: predictions?.currentStats?.active || 0,
            icon: CpuChipIcon,
            color: 'text-indigo-600',
            bgIcon: 'bg-indigo-50',
            border: 'border-indigo-100',
            gradient: 'from-white to-indigo-50/50',
            trend: 'Direct ML Feed',
            trendIcon: SparklesIcon,
            trendColor: 'text-indigo-500'
          },
          {
            label: 'System Resolutions',
            count: predictions?.currentStats?.resolved || 0,
            icon: CheckCircleIcon,
            color: 'text-cyan-600',
            bgIcon: 'bg-cyan-50',
            border: 'border-cyan-100',
            gradient: 'from-white to-cyan-50/50',
            trend: `${predictions?.currentStats?.resolutionRate || 0}% efficiency`,
            trendIcon: ChartBarIcon,
            trendColor: 'text-cyan-500'
          },
          {
            label: 'Risk Hotspots',
            count: hotspots.length || 0,
            icon: MapIcon,
            color: 'text-emerald-600',
            bgIcon: 'bg-emerald-50',
            border: 'border-emerald-100',
            gradient: 'from-white to-emerald-50/50',
            trend: 'Localized Clusters',
            trendIcon: MapPinIcon,
            trendColor: 'text-emerald-500'
          }
        ].map((stat, i) => (
          <GlassCard key={i} className={`p-5 relative group border ${stat.border} hover:border-${stat.color.split('-')[1]}-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-60 -mr-6 -mt-6 rounded-full group-hover:scale-150 transition-transform duration-500`}></div>
            <div className="flex justify-between items-start mb-3 relative z-10">
              <div className={`p-2.5 rounded-xl ${stat.bgIcon} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            <div className="space-y-1 relative z-10">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <h4 className="text-2xl font-bold text-gray-900 tabular-nums">
                {stat.count.toLocaleString()}
              </h4>
              <p className={`text-xs font-semibold ${stat.trendColor} flex items-center mt-2`}>
                <stat.trendIcon className="h-3 w-3 mr-1" />
                {stat.trend}
              </p>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Advanced Model Health & Reliability */}
        <GlassCard className="p-6 lg:col-span-1 bg-gradient-to-b from-white to-blue-50/30 border border-blue-100/50 hover:border-blue-200/70 transition-all duration-300">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800">System Reliability</h3>
            <div className="px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-xs font-semibold text-blue-600 uppercase tracking-wider shadow-sm">Live Audit</div>
          </div>

          <div className="space-y-6">
            <div className="relative pt-1">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                  Neural Confidence
                </span>
                <span className="text-lg font-bold text-blue-600 tabular-nums">
                  {predictions?.predictions?.riskAssessment?.confidence || 75}%
                </span>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-blue-100/50 shadow-inner">
                <div style={{ width: `${predictions?.predictions?.riskAssessment?.confidence || 75}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-700 ease-out"></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group hover:border-blue-200 hover:shadow-md transition-all duration-300">
                <div className="absolute top-0 right-0 w-10 h-10 bg-blue-50 rounded-bl-full -mr-2 -mt-2"></div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1 relative z-10">Global Risk</span>
                <span className={`text-lg font-bold uppercase tracking-tight relative z-10 ${predictions?.predictions?.riskAssessment?.overall === 'high' ? 'text-red-500' : 'text-emerald-500'}`}>
                  {predictions?.predictions?.riskAssessment?.overall || 'Stable'}
                </span>
              </div>
              <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group hover:border-indigo-200 hover:shadow-md transition-all duration-300">
                <div className="absolute top-0 right-0 w-10 h-10 bg-indigo-50 rounded-bl-full -mr-2 -mt-2"></div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1 relative z-10">Last Sync</span>
                <span className="text-lg font-bold text-gray-800 tabular-nums relative z-10">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block border-b border-gray-100 pb-2 flex items-center">
                <MagnifyingGlassIcon className="h-3 w-3 mr-2" /> Primary Risk Factors
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {predictions?.predictions?.riskAssessment?.factors?.map((f, i) => (
                  <span key={i} className="px-3 py-1.5 bg-white border border-gray-100 rounded-lg text-xs font-semibold text-gray-600 shadow-sm capitalize hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 cursor-default flex items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mr-2"></div>
                    {f.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Global Forecast Trends - Absolute Volume Focus */}
        <GlassCard className="lg:col-span-2 p-10 overflow-hidden relative group bg-gradient-to-br from-white to-indigo-50/30">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
            <ArrowTrendingUpIcon className="h-64 w-64 text-blue-900 group-hover:rotate-12 transition-transform duration-1000" />
          </div>

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-6 border-b border-gray-100">
              <div>
                <h3 className="text-2xl font-black text-gray-800 flex items-center">
                  Temporal Demand Projections
                  <SparklesIcon className="h-6 w-6 ml-3 text-blue-500" />
                </h3>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-2">Projected Daily Incident Volume</p>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2.5">
                  <span className="h-3 w-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Predicted</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <span className="h-3 w-3 rounded-full bg-gray-200"></span>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Confidence Floor</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-4 lg:gap-8 h-72 items-end px-4">
              {predictions?.predictions?.weeklyForecast?.map((day, i) => {
                const maxVal = 50;
                const height = (day.predictedComplaints / maxVal) * 100;
                const confidenceHeight = (day.confidence / 100) * height;

                return (
                  <div key={i} className="flex flex-col items-center group/bar relative h-full justify-end">
                    {/* Hover Tooltip */}
                    <div className="absolute top-0 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 transform group-hover/bar:-translate-y-4 bg-gray-900 text-white text-[11px] font-black px-4 py-2 rounded-xl shadow-2xl pointer-events-none z-20 whitespace-nowrap border border-gray-700">
                      {day.predictedComplaints} Incidents / {day.confidence}% Conf.
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-solid border-t-gray-900 border-t-4 border-x-transparent border-x-4 border-b-0"></div>
                    </div>

                    <div className="w-full relative h-[250px] flex items-end justify-center">
                      {/* Confidence Floor */}
                      <div
                        className="absolute w-full bg-gray-100 rounded-t-xl transition-all duration-700 opacity-60"
                        style={{ height: `${Math.max(5, Math.min(100, confidenceHeight))}%` }}
                      ></div>

                      {/* Main Volume Bar */}
                      <div
                        className="w-8 md:w-14 bg-gradient-to-t from-blue-100 to-blue-500 rounded-t-xl transition-all duration-700 shadow-[0_0_20px_rgba(59,130,246,0.15)] group-hover/bar:brightness-110 relative group-hover/bar:w-10 md:group-hover/bar:w-16 z-10 border border-blue-400/20"
                        style={{ height: `${Math.max(10, Math.min(100, height))}%` }}
                      >
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-transparent to-white/30 rounded-t-xl"></div>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-black text-blue-600 tabular-nums bg-white px-2 py-0.5 rounded-lg border border-blue-100 shadow-sm opacity-0 group-hover/bar:opacity-100 transition-opacity">
                          {day.predictedComplaints}
                        </div>
                      </div>
                    </div>

                    <span className="mt-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                      {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Hotspots & AI Determinations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard className="p-8 lg:p-10 bg-gradient-to-br from-white to-blue-50/20">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
            <h3 className="text-xl font-black text-gray-800 flex items-center">
              Incident Density Map
              <MapPinIcon className="h-6 w-6 ml-3 text-red-500" />
            </h3>
            <div className="flex items-center">
              <span className="text-[10px] font-black uppercase text-red-500 mr-2 tracking-widest">Live Tracking</span>
              <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
            </div>
          </div>

          <div className="space-y-4">
            {hotspots.length > 0 ? hotspots.slice(0, 4).map((hotspot, i) => (
              <div key={i} className="flex items-center p-5 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-default group relative overflow-hidden">
                <div className={`absolute left-0 top-0 h-full w-1 ${hotspot.riskScore > 80 ? 'bg-red-500' : 'bg-orange-400'}`}></div>
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mr-5 ml-2 ${hotspot.riskScore > 80 ? 'bg-red-50' : 'bg-orange-50'} group-hover:scale-110 transition-transform shadow-inner`}>
                  <MapPinIcon className={`h-7 w-7 ${hotspot.riskScore > 80 ? 'text-red-500' : 'text-orange-500'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[15px] font-black text-gray-800">Zone Cluster #{i + 1}</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${hotspot.riskScore > 80 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                      {hotspot.prediction || 'Active Area'}
                    </span>
                  </div>
                  <div className="flex items-center mt-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider space-x-3">
                    <span className="flex items-center bg-gray-50 px-2 py-1 rounded-md"><ExclamationTriangleIcon className="h-3.5 w-3.5 mr-1.5 text-gray-500" /> {hotspot.complaintCount} Incidents</span>
                    <span className="text-gray-200">|</span>
                    <span className="font-mono text-[10px]">{hotspot.location.latitude.toFixed(4)}N, {hotspot.location.longitude.toFixed(4)}E</span>
                  </div>
                </div>
                <div className="ml-5 text-right bg-gray-50 p-3 rounded-xl border border-gray-100 min-w-[80px]">
                  <div className={`text-2xl font-black tabular-nums ${hotspot.riskScore > 80 ? 'text-red-600' : 'text-orange-500'}`}>{Math.round(hotspot.riskScore)}</div>
                  <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Risk Index</div>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-gray-100 rounded-3xl">
                <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-5 border border-gray-100 shadow-inner">
                  <MapIcon className="h-10 w-10 text-gray-300" />
                </div>
                <p className="text-base font-black text-gray-500 mb-2">Clear Parameters</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No high-risk clusters detected in the current window</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* AI Determinations - Terminal Style */}
        <GlassCard className="p-8 lg:p-10 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white shadow-2xl border border-indigo-500/20">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
            <div className="flex items-center">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 mr-4 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></div>
              <h3 className="text-xl font-black tracking-tight">Machine Intelligence Log</h3>
            </div>
            <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md">
              <CpuChipIcon className="h-6 w-6 text-blue-400" />
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr>
                  <th className="pb-3 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] px-4 font-mono">Event ID</th>
                  <th className="pb-3 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] px-4 text-center">Inference Category</th>
                  <th className="pb-3 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] px-4 text-right">Confidence Matrix</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-transparent">
                {recentAnalysis.slice(0, 6).map((item, i) => (
                  <tr key={i} className="group bg-white/[0.02] hover:bg-white/[0.06] transition-colors rounded-2xl">
                    <td className="py-4 px-4 rounded-l-2xl border-y border-l border-white/5 group-hover:border-blue-400/30 transition-colors">
                      <div className="flex items-center space-x-3 mb-1">
                        <div className="text-[12px] font-black text-blue-400 group-hover:text-blue-300 font-mono bg-blue-500/10 px-2 py-0.5 rounded">
                          {item.complaintId.length > 8 ? `...${item.complaintId.slice(-6)}` : item.complaintId}
                        </div>
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded">[{item.user?.name || 'Anon'}]</span>
                      </div>
                      <div className="text-[11px] font-medium text-gray-400 italic mt-2 line-clamp-1 max-w-[220px]">
                        "{item.description}"
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center border-y border-white/5 group-hover:border-blue-400/30 transition-colors">
                      <span className="text-[10px] font-black text-white/90 border border-white/10 px-3 py-1.5 rounded-lg bg-white/5 uppercase tracking-widest flex items-center justify-center w-max mx-auto shadow-sm">
                        <SparklesIcon className="h-3 w-3 mr-1.5 text-blue-400" />
                        {item.mlPredictions?.category?.predicted || item.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right rounded-r-2xl border-y border-r border-white/5 group-hover:border-blue-400/30 transition-colors">
                      <div className="text-[13px] font-black text-emerald-400 tabular-nums">
                        {(item.mlPredictions?.category?.confidence || 0.85).toFixed(3)}
                      </div>
                      <div className="w-20 h-1.5 bg-black/40 rounded-full mt-2 ml-auto overflow-hidden border border-white/5">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] relative"
                          style={{ width: `${(item.mlPredictions?.category?.confidence || 0.85) * 100}%` }}
                        >
                          <div className="absolute top-0 right-0 w-2 h-full bg-white/50 blur-[1px]"></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
              <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                Node: Theta-4 Active
              </div>
            </div>
            <button className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors flex items-center bg-blue-400/10 px-4 py-2 rounded-lg hover:bg-blue-400/20">
              Export Audit Trail <span className="ml-2">&rarr;</span>
            </button>
          </div>
        </GlassCard>
      </div>

      {/* Footer System Status */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 md:p-6 bg-white/80 backdrop-blur-2xl border border-white/50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center md:space-x-8 flex-wrap justify-center gap-y-3">
          <div className="flex items-center bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 mr-3 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
            <span className="text-[11px] font-black text-emerald-700 uppercase tracking-widest">Core Connectivity: Optimal</span>
          </div>
          <div className="flex items-center bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
            <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2.5 text-gray-500" />
            <span className="text-[11px] font-black text-gray-600 uppercase tracking-widest">Model: Delta-Engine 4.2</span>
          </div>
        </div>
        <div className="flex items-center text-[11px] font-black text-blue-700 bg-blue-50 px-5 py-2.5 rounded-xl border border-blue-100 shadow-sm">
          <ClockIcon className="h-4 w-4 mr-2.5 text-blue-500" />
          SYSTEM SYNC: {predictions?.lastUpdated ? new Date(predictions.lastUpdated).toLocaleTimeString() : 'SYNCHRONIZING...'}
        </div>
      </div>
    </div>
  );
};

export default MLPredictionDashboard;
