import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobsAPI } from '../services/api';
import { 
  Briefcase, 
  Search, 
  PlusCircle, 
  Sparkles, 
  Trash2, 
  GraduationCap, 
  Clock, 
  Tag, 
  AlertCircle 
} from 'lucide-react';

export default function JobsList() {
  const { isRecruiter } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await jobsAPI.getAll();
      setJobs(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load job listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      await jobsAPI.delete(jobId);
      setJobs(jobs.filter((j) => j.id !== jobId));
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete job.');
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const term = search.toLowerCase();
    const matchesTitle = job.title?.toLowerCase().includes(term);
    const matchesDesc = job.description?.toLowerCase().includes(term);
    const matchesSkills = (job.required_skills || []).some((s) => s.toLowerCase().includes(term));
    return matchesTitle || matchesDesc || matchesSkills;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Job Openings
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Browse and manage positions for automated AI resume ranking
          </p>
        </div>

        {isRecruiter && (
          <Link
            to="/jobs/create"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Post New Job
          </Link>
        )}
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by job title, skill, or keyword..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
        />
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center gap-2 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Jobs Grid */}
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No job openings found</h3>
          <p className="text-sm text-slate-500 mt-1">
            {search ? 'Try adjusting your search terms.' : 'Be the first to post a new job opening!'}
          </p>
          {isRecruiter && !search && (
            <Link
              to="/jobs/create"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Post a Job
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md hover:border-blue-200 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {job.title}
                  </h2>
                  {isRecruiter && (
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      title="Delete Job"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {job.description}
                </p>

                {/* Metadata Pills */}
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{job.min_experience_years || 0}+ yrs exp</span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                    <GraduationCap className="w-3 h-3 text-slate-400" />
                    <span>{job.education_level || 'Any Degree'}</span>
                  </div>
                </div>

                {/* Skills tags */}
                <div className="mt-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Required Skills
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(job.required_skills || []).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Card Action */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => navigate(`/matching?jobId=${job.id}`)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  Evaluate & Rank Candidates
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
