import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { jobsAPI, matchingAPI } from '../services/api';
import { 
  Sparkles, 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  BarChart3, 
  Briefcase, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  AlertCircle, 
  RefreshCw 
} from 'lucide-react';

export default function MatchingDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialJobId = searchParams.get('jobId') || '';

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [selectedJob, setSelectedJob] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [evaluating, setEvaluating] = useState(false);
  const [loadingRankings, setLoadingRankings] = useState(false);
  const [error, setError] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);

  // Fetch jobs on mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await jobsAPI.getAll();
        setJobs(res.data);
        if (res.data.length > 0 && !selectedJobId) {
          setSelectedJobId(res.data[0].id.toString());
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch job postings.');
      }
    };
    fetchJobs();
  }, []);

  // Update selectedJob and fetch existing rankings when selectedJobId changes
  useEffect(() => {
    if (!selectedJobId) return;

    const job = jobs.find((j) => j.id.toString() === selectedJobId.toString());
    setSelectedJob(job || null);
    setSearchParams({ jobId: selectedJobId });

    const fetchRankings = async () => {
      setLoadingRankings(true);
      setError('');
      try {
        const res = await matchingAPI.getRankings(selectedJobId);
        setRankings(res.data || []);
      } catch (err) {
        // If 404 or no evaluation exists yet, clear rankings
        setRankings([]);
      } finally {
        setLoadingRankings(false);
      }
    };

    fetchRankings();
  }, [selectedJobId, jobs]);

  // Run ML evaluation pipeline
  const handleEvaluate = async () => {
    if (!selectedJobId) return;
    setEvaluating(true);
    setError('');

    try {
      const res = await matchingAPI.evaluate(selectedJobId);
      setRankings(res.data || []);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || 'Failed to run ML evaluation. Ensure resumes have been uploaded.'
      );
    } finally {
      setEvaluating(false);
    }
  };

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-extrabold text-xs shadow-sm">
          <Trophy className="w-3.5 h-3.5 text-slate-950" />
          #1 Rank
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-slate-200 to-slate-300 text-slate-800 font-extrabold text-xs shadow-sm">
          <Trophy className="w-3.5 h-3.5 text-slate-600" />
          #2 Rank
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-700 to-amber-800 text-amber-50 font-extrabold text-xs shadow-sm">
          <Trophy className="w-3.5 h-3.5 text-amber-200" />
          #3 Rank
        </div>
      );
    }
    return (
      <div className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-bold text-xs">
        #{rank}
      </div>
    );
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 35) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const getProgressBarColor = (score) => {
    if (score >= 75) return 'bg-emerald-500';
    if (score >= 50) return 'bg-blue-500';
    if (score >= 35) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            Machine Learning Matcher & Ranking Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Candidate Matching Leaderboard
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Evaluates candidates against job criteria using <strong>TF-IDF vectorization</strong>, <strong>semantic skill extraction</strong>, and a trained <strong>Random Forest Classifier</strong> model.
          </p>
        </div>

        {/* Job Selector and Evaluate Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="min-w-[240px]">
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleEvaluate}
            disabled={evaluating || !selectedJobId}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
          >
            {evaluating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Evaluating with ML...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-yellow-300" />
                Run ML Evaluation
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center gap-2 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Selected Job Requirements Summary Pill Box */}
      {selectedJob && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
              Active Evaluation Target
            </div>
            <div className="text-lg font-bold text-white">{selectedJob.title}</div>
            <div className="text-xs text-slate-300 mt-1 line-clamp-1">
              {selectedJob.description}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="text-slate-400">Min Exp: </span>
              <span className="font-bold text-slate-100">{selectedJob.min_experience_years || 0} yrs</span>
            </div>
            <div className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="text-slate-400">Target Edu: </span>
              <span className="font-bold text-slate-100">{selectedJob.education_level || 'Any'}</span>
            </div>
            <div className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="text-slate-400">Target Skills: </span>
              <span className="font-bold text-blue-400">{(selectedJob.required_skills || []).join(', ')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table / Rankings Display */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Ranked Candidates ({rankings.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ordered by Random Forest win probability & multi-feature predictive match score
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" /> Matched Skills
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500 ml-2" /> Missing Skills
          </div>
        </div>

        {loadingRankings ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm">Fetching rankings...</p>
          </div>
        ) : rankings.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No evaluation results yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Click <strong>"Run ML Evaluation"</strong> to run candidate resumes through our trained Random Forest model.
            </p>
            <button
              onClick={handleEvaluate}
              disabled={evaluating || !selectedJobId}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Run ML Evaluation Now
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {rankings.map((cand, index) => {
              const isExpanded = expandedRow === index;
              return (
                <div
                  key={index}
                  className={`p-6 transition-colors ${
                    index === 0 ? 'bg-amber-50/20' : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Left: Rank & Candidate info */}
                    <div className="flex items-start sm:items-center gap-4">
                      <div>{getRankBadge(cand.rank || index + 1)}</div>
                      <div>
                        <div className="text-base font-bold text-slate-900">
                          {cand.candidate_name || `Candidate #${cand.resume_id}`}
                        </div>
                        <div className="text-xs text-slate-500">
                          {cand.candidate_email || 'No email provided'}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Progress Bar & Match Score */}
                    <div className="flex-1 max-w-xs sm:max-w-md">
                      <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                        <span className="text-slate-600">ML Match Probability</span>
                        <span
                          className={`px-2 py-0.5 rounded-md border font-extrabold text-xs ${getScoreColor(
                            cand.overall_score
                          )}`}
                        >
                          {cand.overall_score?.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(
                            cand.overall_score
                          )}`}
                          style={{ width: `${Math.min(cand.overall_score || 0, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Right: Toggle details */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setExpandedRow(isExpanded ? null : index)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            Hide Explainability <ChevronUp className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            View Explainability <ChevronDown className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Skills Pills preview */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {/* Matched skills (Green) */}
                    {(cand.matched_skills || []).map((skill, i) => (
                      <span
                        key={`matched-${i}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {skill}
                      </span>
                    ))}

                    {/* Missing skills (Red) */}
                    {(cand.missing_skills || []).map((skill, i) => (
                      <span
                        key={`missing-${i}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 shadow-xs"
                      >
                        <XCircle className="w-3 h-3 text-rose-600" />
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Expandable ML Explainability Drawer */}
                  {isExpanded && (
                    <div className="mt-5 p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-in fade-in duration-200">
                      <div>
                        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 text-blue-600" />
                          AI Decision Summary
                        </div>
                        <p className="text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                          {cand.match_summary || 'Evaluated using Random Forest Classifier.'}
                        </p>
                      </div>

                      {/* Feature Contributions Grid */}
                      <div>
                        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-indigo-600" />
                          Feature Vector Contributions
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="bg-white p-3 rounded-xl border border-slate-200">
                            <div className="text-[11px] text-slate-500 font-semibold">TF-IDF Similarity</div>
                            <div className="text-sm font-bold text-slate-900 mt-0.5">
                              {cand.feature_contributions?.tfidf_similarity !== undefined
                                ? `${(cand.feature_contributions.tfidf_similarity * 100).toFixed(1)}%`
                                : 'N/A'}
                            </div>
                          </div>

                          <div className="bg-white p-3 rounded-xl border border-slate-200">
                            <div className="text-[11px] text-slate-500 font-semibold">Skill Overlap</div>
                            <div className="text-sm font-bold text-slate-900 mt-0.5">
                              {cand.feature_contributions?.skill_overlap !== undefined
                                ? `${(cand.feature_contributions.skill_overlap * 100).toFixed(1)}%`
                                : 'N/A'}
                            </div>
                          </div>

                          <div className="bg-white p-3 rounded-xl border border-slate-200">
                            <div className="text-[11px] text-slate-500 font-semibold">Exp Delta (Candidate - Job)</div>
                            <div className="text-sm font-bold text-slate-900 mt-0.5">
                              {cand.feature_contributions?.experience_delta !== undefined
                                ? `${cand.feature_contributions.experience_delta > 0 ? '+' : ''}${cand.feature_contributions.experience_delta} yrs`
                                : 'N/A'}
                            </div>
                          </div>

                          <div className="bg-white p-3 rounded-xl border border-slate-200">
                            <div className="text-[11px] text-slate-500 font-semibold">ML Model Architecture</div>
                            <div className="text-xs font-bold text-indigo-600 mt-0.5 truncate" title={cand.model_used}>
                              {cand.model_used || 'RandomForest'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
