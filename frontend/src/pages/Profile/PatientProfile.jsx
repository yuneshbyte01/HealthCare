import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';

/**
 * Patient Profile Component
 * View and edit patient profile information
 */
export default function PatientProfile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    date_of_birth: '',
    gender: '',
    address: '',
    blood_group: '',
    allergies: '',
    chronic_conditions: '',
    emergency_contact: ''
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
      const response = await API.get('/profile/patient/me');
      if (response.data) {
        // Format date for input field (yyyy-MM-dd)
        const formattedProfile = {
          ...response.data,
          date_of_birth: response.data.date_of_birth 
            ? new Date(response.data.date_of_birth).toISOString().split('T')[0]
            : ''
        };
        setProfile(formattedProfile);
        setProfileExists(true);
      } else {
        setProfileExists(false);
        setEditing(true); // Auto-edit mode for new profiles
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
        // Update existing profile
        await API.put('/profile/patient', profile);
        setMessage(t('profile.profileUpdated'));
      } else {
        // Create new profile
        await API.post('/profile/patient', profile);
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
      fetchProfile(); // Reset to original data
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
                {profileExists ? t('profile.personalInfo') : t('profile.createProfile')}
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
            {t('profile.personalInfo')}
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date of Birth */}
            <div>
              <label className="form-label">
                {t('profile.dob')} *
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={profile.date_of_birth}
                onChange={handleInputChange}
                disabled={!editing}
                className="form-input"
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label className="form-label">
                {t('profile.gender')} *
              </label>
              <select
                name="gender"
                value={profile.gender}
                onChange={handleInputChange}
                disabled={!editing}
                className="form-input"
                required
              >
                <option value="">{t('common.select', 'Select gender')}</option>
                <option value="male">{t('profile.male')}</option>
                <option value="female">{t('profile.female')}</option>
                <option value="other">{t('profile.other')}</option>
              </select>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="form-label">
                {t('profile.address')} *
              </label>
              <textarea
                name="address"
                value={profile.address}
                onChange={handleInputChange}
                disabled={!editing}
                className="form-input"
                rows={3}
                required
                placeholder={t('profile.addressPlaceholder', 'Enter your full address')}
              />
            </div>

            {/* Blood Group */}
            <div>
              <label className="form-label">
                {t('profile.bloodGroup')}
              </label>
              <select
                name="blood_group"
                value={profile.blood_group}
                onChange={handleInputChange}
                disabled={!editing}
                className="form-input"
              >
                <option value="">{t('common.select', 'Select blood group')}</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            {/* Emergency Contact */}
            <div>
              <label className="form-label">
                {t('profile.emergencyContact')} *
              </label>
              <input
                type="text"
                name="emergency_contact"
                value={profile.emergency_contact}
                onChange={handleInputChange}
                disabled={!editing}
                className="form-input"
                required
                placeholder={t('profile.emergencyContactPlaceholder', 'Emergency contact name and phone')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Medical Information */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('profile.medicalHistory')}
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Allergies */}
            <div>
              <label className="form-label">
                {t('profile.allergies')}
              </label>
              <textarea
                name="allergies"
                value={profile.allergies}
                onChange={handleInputChange}
                disabled={!editing}
                className="form-input"
                rows={3}
                placeholder={t('profile.allergiesPlaceholder', 'List any known allergies (e.g., penicillin, nuts)')}
              />
            </div>

            {/* Chronic Conditions */}
            <div>
              <label className="form-label">
                {t('profile.chronicConditions')}
              </label>
              <textarea
                name="chronic_conditions"
                value={profile.chronic_conditions}
                onChange={handleInputChange}
                disabled={!editing}
                className="form-input"
                rows={3}
                placeholder={t('profile.chronicConditionsPlaceholder', 'List any chronic conditions (e.g., diabetes, hypertension)')}
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