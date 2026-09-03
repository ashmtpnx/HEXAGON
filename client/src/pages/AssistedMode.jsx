import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Handshake, UserPlus, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AssistedMode() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'General',
    gender: 'Male',
    age: '',
    businessStage: 'idea',
    sector: 'services',
    district: '',
    isRural: 'true',
    annualIncome: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Create a dummy email if not provided, just for the system
      const emailToUse = formData.email || `assisted_${Date.now()}@demo.com`;
      
      const payload = {
        ...formData,
        email: emailToUse,
        password: 'demo123', // Default password for assisted accounts
        role: 'applicant',
        isAssistedProfile: true,
        assistedBy: user._id,
        isRural: formData.isRural === 'true',
        age: parseInt(formData.age),
        annualIncome: parseInt(formData.annualIncome || 0),
        location: { district: formData.district, isRural: formData.isRural === 'true' }
      };

      const res = await api.post('/auth/register', payload);
      const newUserId = res.data.user.id;
      
      // Navigate directly to match engine, passing the assisted user ID
      navigate('/match', { state: { assistedUserId: newUserId } });
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-900/30 border border-primary-500/30 mb-4">
          <Handshake className="w-8 h-8 text-primary-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">VLE Assisted Mode</h1>
        <p className="text-surface-400 max-w-xl mx-auto">
          Create a profile on behalf of a beneficiary. This form is simplified for Village Level Entrepreneurs to quickly capture eligibility criteria.
        </p>
      </div>

      <div className="glass-card p-6 md:p-8">
        {error && <div className="bg-danger-500/10 text-danger-400 p-4 rounded mb-6 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identity */}
          <div>
            <h3 className="text-sm font-bold text-surface-300 uppercase tracking-wider mb-4 border-b border-surface-700 pb-2">Identity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-surface-400 mb-1">Full Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="input-field" placeholder="Beneficiary name" />
              </div>
              <div>
                <label className="block text-sm text-surface-400 mb-1">Age</label>
                <input required type="number" min="18" max="100" name="age" value={formData.age} onChange={handleChange} className="input-field" placeholder="e.g., 35" />
              </div>
              <div>
                <label className="block text-sm text-surface-400 mb-1">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="input-field">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-surface-400 mb-1">Social Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="input-field">
                  <option value="SC">SC (Scheduled Caste)</option>
                  <option value="ST">ST (Scheduled Tribe)</option>
                  <option value="OBC">OBC (Other Backward Classes)</option>
                  <option value="Minority">Minority</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>
          </div>

          {/* Business & Geography */}
          <div>
            <h3 className="text-sm font-bold text-surface-300 uppercase tracking-wider mb-4 border-b border-surface-700 pb-2 mt-8">Business & Geography</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-surface-400 mb-1">Business Stage</label>
                <select name="businessStage" value={formData.businessStage} onChange={handleChange} className="input-field">
                  <option value="idea">Idea / Greenfield (New)</option>
                  <option value="startup">Startup (Less than 2 years)</option>
                  <option value="growing">Growing</option>
                  <option value="established">Established</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-surface-400 mb-1">Sector</label>
                <select name="sector" value={formData.sector} onChange={handleChange} className="input-field">
                  <option value="manufacturing">Manufacturing</option>
                  <option value="services">Services</option>
                  <option value="trading">Trading</option>
                  <option value="agriculture">Agriculture / Allied</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-surface-400 mb-1">Annual Family Income (₹)</label>
                <input required type="number" name="annualIncome" value={formData.annualIncome} onChange={handleChange} className="input-field" placeholder="e.g., 120000" />
              </div>
              <div>
                <label className="block text-sm text-surface-400 mb-1">Location Type</label>
                <select name="isRural" value={formData.isRural} onChange={handleChange} className="input-field">
                  <option value="true">Rural</option>
                  <option value="false">Urban</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-surface-800 p-4 rounded-lg flex items-start gap-3 mt-8">
            <ShieldCheck className="w-5 h-5 text-success-500 shrink-0 mt-0.5" />
            <p className="text-xs text-surface-300">
              By proceeding, you verify that you have collected the beneficiary's consent to enter their details. A cryptographic hash will be generated to prevent duplicate claims across schemes.
            </p>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            {loading ? 'Processing...' : 'Create Profile & Find Schemes'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
