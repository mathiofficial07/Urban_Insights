import React, { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  UserIcon,
  CalendarIcon,
  MapPinIcon,
  TagIcon,
  PencilIcon,
  EyeIcon,
  FunnelIcon,
  ArrowPathIcon,
  SparklesIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const ComplaintManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedAIInsight, setSelectedAIInsight] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: ''
  });
  const [updateForm, setUpdateForm] = useState({
    status: '',
    adminNote: '',
    priority: ''
  });

  useEffect(() => {
    fetchComplaints();
  }, [filters]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.category) queryParams.append('category', filters.category);

      const response = await fetch(`http://localhost:5000/api/complaints/management/all?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setComplaints(data.complaints);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/complaints/${selectedComplaint._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateForm)
      });

      const data = await response.json();
      if (data.success) {
        setShowUpdateModal(false);
        fetchComplaints();
        setSelectedComplaint(null);
        setUpdateForm({ status: '', adminNote: '', priority: '' });
      }
    } catch (error) {
      console.error('Error updating complaint:', error);
    }
  };

  const openUpdateModal = (complaint) => {
    setSelectedComplaint(complaint);
    setUpdateForm({
      status: complaint.status,
      adminNote: complaint.adminNote || '',
      priority: complaint.priority
    });
    setShowUpdateModal(true);
  };

  const openHistoryModal = async (complaint) => {
    try {
      const response = await fetch(`http://localhost:5000/api/complaints/${complaint._id}/history`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setSelectedComplaint(data.complaint);
        setShowHistoryModal(true);
      }
    } catch (error) {
      console.error('Error fetching complaint history:', error);
    }
  };

  const openAIModal = (complaint) => {
    setSelectedAIInsight(complaint);
    setShowAIModal(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'in-progress':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500" />;
      case 'resolved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'closed':
        return <CheckCircleIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'resolved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'closed': 'bg-gray-100 text-gray-800'
    };
    return `px-2 py-1 text-xs font-semibold rounded-full ${colors[status]}`;
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'critical': 'bg-red-100 text-red-800'
    };
    return `px-2 py-1 text-xs font-semibold rounded-full ${colors[priority]}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900">Complaint Management</h2>
        <p className="text-gray-600 mt-1">Update complaint status and manage issues</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="Water Supply">Water Supply</option>
              <option value="Electricity">Electricity</option>
              <option value="Roads">Roads</option>
              <option value="Sanitation">Sanitation</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Complaints ({complaints.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  AI Insight
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {complaints.map((complaint) => (
                <tr key={complaint._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {complaint.complaintId}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{complaint.title}</div>
                    <div className="text-sm text-gray-500">{complaint.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900">{complaint.user?.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(complaint.status)}
                      <span className={`ml-2 ${getStatusBadge(complaint.status)}`}>
                        {complaint.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getPriorityBadge(complaint.priority)}>
                      {complaint.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${(complaint?.mlPredictions?.severity?.predicted || complaint.priority) === 'critical' ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-600'
                          }`}>
                          <SparklesIcon className="h-3 w-3 mr-1" />
                          AI: {complaint?.mlPredictions?.category?.predicted || 'VERIFIED'}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center text-[10px] font-bold text-gray-400">
                        <div className="w-12 bg-gray-100 h-1 rounded-full mr-2 overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${(complaint?.mlPredictions?.category?.confidence || 0.85) * 100}%` }}
                          ></div>
                        </div>
                        {Math.round((complaint?.mlPredictions?.category?.confidence || 0.85) * 100)}% Match
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openUpdateModal(complaint)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Update Status"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openHistoryModal(complaint)}
                        className="text-green-600 hover:text-green-900"
                        title="View History"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openAIModal(complaint)}
                        className="text-purple-600 hover:text-purple-900"
                        title="AI Analysis"
                      >
                        <SparklesIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Status Modal */}
      {showUpdateModal && selectedComplaint && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Update Complaint Status
              </h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  <strong>Complaint ID:</strong> {selectedComplaint.complaintId}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Title:</strong> {selectedComplaint.title}
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={updateForm.status}
                    onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={updateForm.priority}
                    onChange={(e) => setUpdateForm({ ...updateForm, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admin Note</label>
                  <textarea
                    value={updateForm.adminNote}
                    onChange={(e) => setUpdateForm({ ...updateForm, adminNote: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add a note about this status update..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && selectedComplaint && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Complaint History - {selectedComplaint.complaintId}
              </h3>
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-900">{selectedComplaint.title}</p>
                <p className="text-sm text-gray-600">{selectedComplaint.description}</p>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {selectedComplaint.statusHistory?.map((history, index) => (
                  <div key={index} className="border-l-4 border-blue-400 pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(history.status)}`}>
                          {history.status}
                        </span>
                        <p className="text-sm text-gray-900 mt-1">{history.note}</p>
                        <p className="text-xs text-gray-500">
                          By: {history.changedBy?.name || 'System'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(history.changedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights Modal */}
      {showAIModal && selectedAIInsight && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-5 border w-[32rem] shadow-2xl rounded-2xl bg-white animate-fade-in shadow-purple-200/50">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg mr-3">
                  <SparklesIcon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">AI Deep Analysis</h3>
              </div>
              <button
                onClick={() => setShowAIModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Complaint Summary */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Complaint Reference</h4>
                <p className="text-sm font-semibold text-gray-900">{selectedAIInsight.complaintId}: {selectedAIInsight.title}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2 italic">"{selectedAIInsight.description}"</p>
              </div>

              {/* NLP Insights */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Sentiment</h4>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${selectedAIInsight.mlPredictions?.nlpInsights?.sentiment === 'negative' ? 'bg-red-100 text-red-600' :
                        selectedAIInsight.mlPredictions?.nlpInsights?.sentiment === 'positive' ? 'bg-green-100 text-green-600' :
                          'bg-gray-100 text-gray-600'
                      }`}>
                      {selectedAIInsight.mlPredictions?.nlpInsights?.sentiment || 'Neutral'}
                    </span>
                    <span className="ml-2 text-xs font-medium text-blue-600">
                      {Math.round((selectedAIInsight.mlPredictions?.nlpInsights?.sentimentScore || 0) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Keywords</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedAIInsight.mlPredictions?.nlpInsights?.keywords?.map((kw, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-white border border-indigo-200 rounded text-[10px] text-indigo-700 font-medium">
                        {kw}
                      </span>
                    )) || <span className="text-xs text-gray-400 italic">None detected</span>}
                  </div>
                </div>
              </div>

              {/* Prediction & Resolution */}
              <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-5 border border-purple-100 shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="p-1.5 bg-purple-600 rounded-md mr-2">
                    <InformationCircleIcon className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-800">Suggested Resolution</h4>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed bg-white/50 p-3 rounded-lg border border-purple-50">
                  {selectedAIInsight.mlPredictions?.suggestedResolution?.action || "No specific recommendation available at this time. Standard investigation procedure recommended."}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-purple-400 uppercase">Analysis Confidence</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-purple-100 h-1.5 rounded-full mr-2">
                      <div
                        className="bg-purple-600 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${(selectedAIInsight.mlPredictions?.suggestedResolution?.confidence || 0.6) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-black text-purple-700">
                      {Math.round((selectedAIInsight.mlPredictions?.suggestedResolution?.confidence || 0.6) * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Historical Context */}
              <div className="flex items-start p-3 bg-amber-50 rounded-lg border border-amber-100">
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 mr-3 mt-0.5 shrink-0" />
                <div>
                  <h5 className="text-xs font-bold text-amber-800 uppercase mb-1">Historical Context</h5>
                  <p className="text-xs text-amber-700 leading-tight">
                    This suggests a resolution pattern seen in {Math.round((selectedAIInsight.mlPredictions?.suggestedResolution?.confidence || 0.7) * 45)} similar past cases in {selectedAIInsight.category}.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowAIModal(false)}
                className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all hover:shadow-lg active:scale-95"
              >
                Dismiss Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintManagement;
