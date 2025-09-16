import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';

/**
 * Admin Profile Component
 * View and edit admin profile information
 */
export default function AdminProfile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    department: '',
    access_level: '',
    last_login: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await API.get('/profile/admin/me');
      if (response.data) {
        const formattedProfile = {
          ...response.data,
          last_login: response.data.last_login 
            ? new Date(response.data.last_login).toISOString().split('T')[0]
            : ''
        };
        setProfile(formattedProfile);
        setProfileExists(true);
      } else {
        setProfileExists(false);
        setEditing(true);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfileExists(false);
      setEditing(true);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      if (profileExists) {
        await API.put('/profile/admin', profile);
        setMessage(t('profile.profileUpdated'));
      } else {
        await API.post('/profile/admin', profile);
        setMessage(t('profile.profileCreated'));
        setProfileExists(true);
      }
      setEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage(t('errors.unexpectedError'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profileExists) {
      setEditing(false);
      fetchProfile();
    } else {
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('profile.myProfile')}
              </h1>
              <p className="text-gray-600 mt-1">
                {profileExists ? t('admin.systemAdministration') : t('profile.createProfile')}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {!editing && profileExists && (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {t('common.edit')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`rounded-lg p-4 ${
          message.includes('success') || message.includes('created') || message.includes('updated')
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              <span className={message.includes('success') || message.includes('created') || message.includes('updated') ? 'text-green-400' : 'text-red-400'}>
                {message.includes('success') || message.includes('created') || message.includes('updated') ? '✅' : '⚠️'}
              </span>
            </div>
            <div className="ml-3">
              <p className={`text-sm ${
                message.includes('success') || message.includes('created') || message.includes('updated')
                  ? 'text-green-800' 
                  : 'text-red-800'
              }`}>
                {message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('admin.systemAdministration')}
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Department */}
            <div>
              <label className="form-label">
                {t('profile.department')} *
              </label>
              <input
                type="text"
                name="department"
                value={profile.department}
                onChange={handleInputChange}
                disabled={!editing}
                className="form-input"
                required
                placeholder={t('profile.departmentPlaceholder', 'e.g., IT, Operations, Management')}
              />
            </div>

            {/* Access Level */}
            <div>
              <label className="form-label">
                {t('profile.accessLevel')} *
              </label>
              <select
                name="access_level"
                value={profile.access_level}
                onChange={handleInputChange}
                disabled={!editing}
                className="form-input"
                required
              >
                <option value="">{t('common.select', 'Select access level')}</option>
                <option value="super_admin">{t('admin.superAdmin', 'Super Administrator')}</option>
                <option value="admin">{t('admin.admin', 'Administrator')}</option>
                <option value="moderator">{t('admin.moderator', 'Moderator')}</option>
              </select>
            </div>

            {/* Last Login (Read-only) */}
            <div className="md:col-span-2">
              <label className="form-label">
                {t('profile.lastLogin')}
              </label>
              <input
                type="text"
                value={profile.last_login ? new Date(profile.last_login).toLocaleString() : t('common.never', 'Never')}
                disabled
                className="form-input bg-gray-50"
                readOnly
              />
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('admin.systemInfo', 'System Information')}
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">{t('admin.permissions')}</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• {t('admin.userManagement')}</li>
                <li>• {t('admin.systemSettings')}</li>
                <li>• {t('admin.systemLogs')}</li>
                <li>• {t('admin.aiManagement', 'AI Management')}</li>
              </ul>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">{t('admin.systemStatus', 'System Status')}</h3>
              <div className="text-sm text-green-800 space-y-1">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  {t('admin.systemOnline', 'System Online')}
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  {t('admin.databaseConnected', 'Database Connected')}
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  {t('admin.aiModelsActive', 'AI Models Active')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {editing && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4">
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="btn btn-outline"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? (
                  <span className="flex items-center">
                    <div className="spinner mr-2"></div>
                    {t('common.loading')}
                  </span>
                ) : (
                  profileExists ? t('profile.updateProfile') : t('profile.saveProfile')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
