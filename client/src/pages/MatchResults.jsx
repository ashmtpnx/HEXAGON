import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { ShieldAlert, CheckCircle, XCircle, ArrowRight, BookOpen } from 'lucide-react';

export default function MatchResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyingTo, setApplyingTo] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const assistedUserId = location.state?.assistedUserId; // For VLE mode

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await api.post('/match/find', { assistedUserId });
        setResults(res.data.matches);
      } catch (err) {
        setError('Failed to run matching engine.');
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [assistedUserId]);

  const handleApply = async (schemeId) => {
    setApplyingTo(schemeId);
    try {
      const res = await api.post('/applications', { 
        schemeId,
        assistedUserId
      });
      navigate(`/application/${res.data.application._id}`);
    } catch (err) {
      if (err.response?.status === 409) {
        // Duplicate detection
        alert(`Fraud Prevention Alert: ${err.response.data.message}`);
        navigate(`/application/${err.response.data.existingApplicationId}`);
      } else {
        alert('Failed to start application.');
      }
      setApplyingTo(null);
    }
  };

  if (loading) return (
    <div className="flex-grow flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mb-4"></div>
      <p className="text-primary-300 font-medium">Running Verified Matching Engine...</p>
      <p className="text-surface-400 text-sm mt-2">Checking eligibility against live government rules.</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Matched Schemes</h1>
        <p className="text-surface-400">Based on your validated profile, here are the schemes you are eligible for. The "Why you matched" section provides full transparency to bypass middlemen.</p>
        
        {assistedUserId && (
          <div className="mt-4 p-3 bg-surface-800 rounded-lg border border-surface-700 text-sm text-surface-300 inline-block">
            VLE Mode: Showing results for assisted profile.
          </div>
        )}
      </div>

      {error && <div className="bg-danger-500/10 text-danger-400 p-4 rounded mb-6">{error}</div>}

      {results.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-xl text-white mb-2">No matching schemes found right now.</p>
          <p className="text-surface-400">Try updating your profile or check back later as new schemes are added.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {results.map((result, idx) => (
            <div key={result.scheme._id} className="glass-card overflow-hidden animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  
                  {/* Left: Scheme Info & Match Score */}
                  <div className="md:w-1/3 flex flex-col justify-between border-r border-surface-700/0 md:border-surface-700/50 md:pr-8">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="px-3 py-1 bg-surface-800 text-primary-300 text-xs font-bold rounded-full uppercase tracking-wider">
                          {result.scheme.schemeType}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black text-white">{result.matchScore}%</span>
                          <span className="text-xs text-surface-400 uppercase tracking-widest">Match</span>
                        </div>
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-2">{result.scheme.name}</h2>
                      <p className="text-sm text-primary-400 font-medium mb-4">{result.scheme.ministry}</p>
                      <p className="text-surface-300 text-sm mb-6">{result.scheme.description}</p>
                    </div>

                    <button 
                      onClick={() => handleApply(result.scheme._id)}
                      disabled={applyingTo === result.scheme._id}
                      className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                    >
                      {applyingTo === result.scheme._id ? 'Starting...' : 'Start Application'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Right: Explanations & Rights */}
                  <div className="md:w-2/3 space-y-6">
                    {/* Why you matched */}
                    <div>
                      <h3 className="text-sm font-bold text-surface-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-success-500" />
                        Why you matched
                      </h3>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {result.matchReasons.map((reason, i) => (
                          <li key={i} className="bg-surface-800/50 p-3 rounded-lg border border-surface-700/50">
                            <p className="text-sm text-surface-200">{reason.explanation}</p>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Unmatched rules (if score < 100) */}
                    {result.unmatchedReasons?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-surface-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-danger-500" />
                          Partial Mismatches
                        </h3>
                        <ul className="space-y-2">
                          {result.unmatchedReasons.map((reason, i) => (
                            <li key={i} className="text-sm text-surface-400 flex gap-2">
                              <span>•</span>
                              <span>{reason.explanation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Rights Awareness Alert (Crucial Feature) */}
                    {result.scheme.applicantRights?.length > 0 && (
                      <div className="rights-alert p-4 mt-6">
                        <h3 className="font-bold text-warning-500 mb-3 flex items-center gap-2">
                          <ShieldAlert className="w-5 h-5" />
                          Before you apply, know your rights:
                        </h3>
                        <ul className="space-y-4">
                          {result.scheme.applicantRights.slice(0, 2).map((right, i) => (
                            <li key={i}>
                              <p className="font-semibold text-surface-100 text-sm mb-1">{right.right}</p>
                              <p className="text-xs text-surface-300 leading-relaxed">{right.explanation}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
