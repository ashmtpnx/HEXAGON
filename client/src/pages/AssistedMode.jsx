import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Handshake, UserPlus, ArrowRight, ShieldCheck, Volume2 } from 'lucide-react';

export default function AssistedMode() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [audioPrompt, setAudioPrompt] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'SC',
    gender: 'Female',
    annualIncome: 120000,
    sector: 'Manufacturing',
    district: 'Varanasi',
    state: 'Uttar Pradesh'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAudioHelp = () => {
    setAudioPrompt(true);
    const msg = new SpeechSynthesisUtterance("Welcome to NyaySetu Field Kiosk. Please enter applicant name, category, and income details to find eligible schemes.");
    msg.lang = 'en-IN';
    window.speechSynthesis.speak(msg);
    setTimeout(() => setAudioPrompt(false), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email || `applicant_${Date.now()}@nyaysetu.local`,
        password: 'password123',
        role: 'applicant',
        demographics: {
          category: formData.category,
          gender: formData.gender,
          district: formData.district,
          state: formData.state
        },
        financials: {
          annualIncome: Number(formData.annualIncome)
        },
        businessDetails: {
          sector: formData.sector
        }
      };

      const res = await api.post('/auth/register', payload);
      navigate('/match', { state: { userId: res.data.user.id } });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create assisted profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="cleo-card p-6 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="cleo-badge bg-emerald-50 text-emerald-800 border-emerald-200">Field Kiosk Active</span>
            <span className="text-xs text-slate-500 font-mono">NGO / District Officer Desk</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Assisted Application Kiosk</h1>
          <p className="text-xs text-slate-500 mt-0.5">Register ground-level applicants lacking digital access & instantly evaluate entitlements.</p>
        </div>

        <button
          onClick={handleAudioHelp}
          className={`cleo-btn text-xs ${audioPrompt ? 'bg-amber-600 text-white border-amber-600' : 'cleo-btn-secondary'}`}
        >
          <Volume2 className="w-4 h-4 text-amber-600" />
          <span>{audioPrompt ? 'Speaking Prompt...' : 'Voice Assist'}</span>
        </button>
      </div>

      {/* Main Kiosk Form */}
      <form onSubmit={handleSubmit} className="cleo-card p-6 sm:p-8 bg-white space-y-6">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
          Applicant Profile Details
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Sunita Devi"
              className="cleo-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile / Email Address</label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="sunita@example.com (optional)"
              className="cleo-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Social Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="cleo-input"
            >
              <option value="SC">SC (Scheduled Caste)</option>
              <option value="ST">ST (Scheduled Tribe)</option>
              <option value="OBC">OBC (Other Backward Class)</option>
              <option value="Minority">Minority Community</option>
              <option value="General">General</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Gender *</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="cleo-input"
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Transgender / Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Family Income (₹) *</label>
            <input
              type="number"
              name="annualIncome"
              required
              value={formData.annualIncome}
              onChange={handleChange}
              className="cleo-input font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Enterprise Sector *</label>
            <select
              name="sector"
              value={formData.sector}
              onChange={handleChange}
              className="cleo-input"
            >
              <option value="Manufacturing">Manufacturing & Handicrafts</option>
              <option value="Services">Services & Retail</option>
              <option value="Agriculture">Agri-Processing & Dairy</option>
              <option value="Textiles">Textiles & Weaving</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="cleo-btn cleo-btn-accent px-6 py-2.5 text-xs font-semibold"
          >
            {loading ? 'Processing Profile...' : 'Submit Profile & Evaluate Schemes'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
