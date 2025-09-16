import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

/**
 * Geographic Analytics Component
 * Shows geographic distribution of patients and appointments
 */
export default function GeographicAnalytics() {
  const { t } = useTranslation();
  const { role } = useAuth();
  const [geographicData, setGeographicData] = useState({
    geographic_distribution: [],
    total_locations: 0
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchGeographicData();
  }, []);

  const fetchGeographicData = async () => {
    try {
      const response = await API.get('/analytics/geographic');
      setGeographicData(response.data);
    } catch (error) {
      console.error('Error fetching geographic data:', error);
      setMessage('Failed to load geographic data');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk) => {
    if (risk > 0.6) return 'bg-red-100 text-red-800';
    if (risk > 0.3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="px-6 py-4 bg-primary-600">
            <h1 className="text-2xl font-bold text-white">
              {t('analytics.geographic')}
            </h1>
          </div>

          <div className="p-6">
            {message && (
              <div className="mb-4 p-4 rounded-md bg-red-50 text-red-800 border border-red-200">
                {message}
              </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{geographicData.total_locations}</div>
                <div className="text-sm text-blue-600">Total Locations</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">
                  {geographicData.geographic_distribution.reduce((sum, loc) => sum + parseInt(loc.appointment_count), 0)}
                </div>
                <div className="text-sm text-green-600">Total Appointments</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {geographicData.geographic_distribution.length > 0 
                    ? (geographicData.geographic_distribution.reduce((sum, loc) => sum + parseFloat(loc.avg_noshow_risk || 0), 0) / geographicData.geographic_distribution.length * 100).toFixed(1)
                    : 0
                  }%
                </div>
                <div className="text-sm text-purple-600">Avg No-Show Risk</div>
              </div>
            </div>

            {/* Geographic Distribution Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Geographic Distribution (Last 30 Days)
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Appointments
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg No-Show Risk
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Risk Level
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {geographicData.geographic_distribution.map((location, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {location.address || 'Unknown Location'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {location.appointment_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {(parseFloat(location.avg_noshow_risk || 0) * 100).toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(parseFloat(location.avg_noshow_risk || 0))}`}>
                            {parseFloat(location.avg_noshow_risk || 0) > 0.6 ? 'High Risk' :
                             parseFloat(location.avg_noshow_risk || 0) > 0.3 ? 'Medium Risk' : 'Low Risk'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Locations */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Top Locations by Appointments
                </h3>
                <div className="space-y-3">
                  {geographicData.geographic_distribution
                    .sort((a, b) => parseInt(b.appointment_count) - parseInt(a.appointment_count))
                    .slice(0, 5)
                    .map((location, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {location.address || 'Unknown Location'}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${(parseInt(location.appointment_count) / Math.max(...geographicData.geographic_distribution.map(l => parseInt(l.appointment_count)))) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">{location.appointment_count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Locations by No-Show Risk
                </h3>
                <div className="space-y-3">
                  {geographicData.geographic_distribution
                    .sort((a, b) => parseFloat(b.avg_noshow_risk || 0) - parseFloat(a.avg_noshow_risk || 0))
                    .slice(0, 5)
                    .map((location, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {location.address || 'Unknown Location'}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              parseFloat(location.avg_noshow_risk || 0) > 0.6 ? 'bg-red-500' :
                              parseFloat(location.avg_noshow_risk || 0) > 0.3 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ 
                              width: `${(parseFloat(location.avg_noshow_risk || 0) * 100)}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">
                          {(parseFloat(location.avg_noshow_risk || 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Geographic Insights */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Geographic Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Resource Allocation</h4>
                  <p className="text-sm text-gray-600">
                    Focus resources on areas with high appointment volumes and consider 
                    mobile clinics for underserved locations.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">No-Show Prevention</h4>
                  <p className="text-sm text-gray-600">
                    Implement targeted reminder systems for high-risk areas to reduce 
                    no-show rates and improve appointment adherence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


