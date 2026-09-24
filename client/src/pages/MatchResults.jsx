import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { ShieldAlert, CheckCircle, XCircle, ArrowRight, BookOpen, Scale } from 'lucide-react';

export default function MatchResults() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingSchemeId, setApplyingSchemeId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    runMatch();
  }, []);

  const runMatch = async () => {
    try {
      const targetUserId = location.state?.userId;
      const endpoint = targetUserId ? `/match/user/${targetUserId}` : '/match/me';
      const res = await api.get(endpoint);
      setMatches(res.data.matches || []);
    } catch (err) {
      console.error('Failed to run matching engine', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (schemeId) => {
    setApplyingSchemeId(schemeId);
    try {
      const targetUserId = location.state?.userId;
      const payload = { schemeId };
      if (targetUserId) payload.applicantUserId = targetUserId;

      const res = await api.post('/applications/apply', payload);
      const appData = res.data?.application || res.data;
      const appId = appData?._id || appData?.id;

      if (appId) {
        navigate(`/applications/${appId}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setApplyingSchemeId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="cleo-card p-6 bg-white space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
          <Scale className="w-4 h-4 text-amber-600" />
          <span>Deterministic Matching Engine Output</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Verified Scheme Eligibility Results</h1>
        <p className="text-xs text-slate-500">Evaluated against statutory guidelines, income thresholds, and category entitlements.</p>
      </div>

      {loading ? (
        <div className="cleo-card p-12 text-center space-y-3">
          <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-600 font-medium">Evaluating scheme criteria and statutory rules...</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="cleo-card p-8 text-center space-y-3">
          <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-xs text-slate-600">No matching welfare schemes found for the current profile parameters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map(({ scheme, matchPercentage, matchReasons, missingRequirements }) => (
            <div key={scheme._id} className="cleo-card cleo-card-hover p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="cleo-badge bg-slate-100 text-slate-800 border-slate-200 mb-1">{scheme.category}</span>
                  <h3 className="text-lg font-extrabold text-slate-900">{scheme.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{scheme.ministry || 'Ministry of Social Justice & Empowerment'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xl font-extrabold text-emerald-700 font-mono">{matchPercentage}%</p>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Eligibility Match</p>
                  </div>
                  <button
                    onClick={() => handleApply(scheme._id)}
                    disabled={applyingSchemeId === scheme._id}
                    className="cleo-btn cleo-btn-accent text-xs px-4 py-2"
                  >
                    {applyingSchemeId === scheme._id ? 'Submitting...' : 'Claim & Apply'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Match Reasons Grid */}
              <div className="grid md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5 p-3 bg-emerald-50/60 border border-emerald-200 rounded-md">
                  <p className="font-bold text-emerald-900 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Entitlements
                  </p>
                  <ul className="space-y-1 text-emerald-800">
                    {matchReasons.map((reason, i) => (
                      <li key={i}>• {reason}</li>
                    ))}
                  </ul>
                </div>

                {missingRequirements && missingRequirements.length > 0 && (
                  <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-200 rounded-md">
                    <p className="font-bold text-slate-700 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                      Self-Declaration Checklist
                    </p>
                    <ul className="space-y-1 text-slate-600">
                      {missingRequirements.map((req, i) => (
                        <li key={i}>• {req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
