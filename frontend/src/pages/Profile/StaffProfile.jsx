import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';

/**
 * Staff Profile Component
 * View and edit clinic staff profile information
 */
export default function StaffProfile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    position: '',
    specialization: '',
    license_number: '',
    experience_years: '',
    clinic_id: ''
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
      const response = await API.get('/profile/clinic-staff/me');
      if (response.data) {
        setProfile(response.data);
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
        await API.put('/profile/clinic-staff', profile);
        setMessage(t('profile.profileUpdated'));
      } else {
        await API.post('/profile/clinic-staff', profile);
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
                {profileExists ? t('profile.workInfo', 'Work Information') : t('profile.createProfile')}
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
            {t('profile.workInfo', 'Work Information')}
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Position */}
            <div>
              <label className="form-label">
                {t('profile.position')} *
              </label>
              <input
                type="text"
                name="position"
                value={profile.position}
                onChange={handleInputChange}
                disabled={!editing}
                className="form-input"
                required
                placeholder={t('profile.positionPlaceholder', 'e.g., Doctor, Nurse, Receptionist')}
              />
            </div>

            {/* Specialization */}
            <div>
              <label className="form-label">
                {t('profile.specialization')}
              </label>
              <input
                type="text"
                name="specialization"
                value={profile.specialization}
                onChange={handleInputChange}
                disabled={!editing}
                className="form-input"
                placeholder={t('profile.specializationPlaceholder', 'e.g., Cardiology, Emergency Medicine, General Practice')}
              />
            </div>

            {/* License Number */}
            <div>
              <label className="form-label">
                {t('profile.licenseNumber')}
              </label>
              <input
                type="text"
                name="license_number"
                value={profile.license_number}
                onChange={handleInputChange}
                disabled={!editing}
                className="form-input"
                placeholder={t('profile.licenseNumberPlaceholder', 'Medical license number')}
              />
            </div>

            {/* Experience Years */}
            <div>
              <label className="form-label">
                {t('profile.experienceYears')}
              </label>
              <input
                type="number"
                name="experience_years"
                value={profile.experience_years}
                onChange={handleInputChange}
                disabled={!editing}
                className="form-input"
                min="0"
                max="50"
                placeholder={t('profile.experienceYearsPlaceholder', 'Years of experience')}
              />
            </div>

            {/* Clinic ID */}
            <div>
              <label className="form-label">
                {t('profile.clinicId')}
              </label>
              <input
                type="number"
                name="clinic_id"
                value={profile.clinic_id}
                onChange={handleInputChange}
                disabled={!editing}
                className="form-input"
                placeholder={t('profile.clinicIdPlaceholder', 'Clinic ID (usually 1)')}
              />
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

