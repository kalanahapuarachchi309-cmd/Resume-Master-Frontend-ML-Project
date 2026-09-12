import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resumesAPI } from '../services/api';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Tag, 
  Briefcase, 
  GraduationCap, 
  User, 
  X, 
  Layers, 
  RefreshCw, 
  ArrowRight 
} from 'lucide-react';

export default function ResumeUpload() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [parsedResults, setParsedResults] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const isValidFile = (file) => {
    return file.name.endsWith('.pdf') || file.name.endsWith('.docx') || file.name.endsWith('.doc');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files).filter(isValidFile);
      if (selected.length === 0) {
        setError('Please select valid .pdf or .docx resume documents.');
        return;
      }
      setFiles((prev) => {
        const existingNames = new Set(prev.map((f) => f.name));
        const newOnes = selected.filter((f) => !existingNames.has(f.name));
        return [...prev, ...newOnes];
      });
      setError('');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const dropped = Array.from(e.dataTransfer.files).filter(isValidFile);
      if (dropped.length === 0) {
        setError('Please drop valid PDF or DOCX resume documents.');
        return;
      }
      setFiles((prev) => {
        const existingNames = new Set(prev.map((f) => f.name));
        const newOnes = dropped.filter((f) => !existingNames.has(f.name));
        return [...prev, ...newOnes];
      });
      setError('');
    }
  };

  const removeFile = (fileName) => {
    setFiles((prev) => prev.filter((f) => f.name !== fileName));
  };

  const clearAllFiles = () => {
    setFiles([]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setError('Please select at least one resume file to upload.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      if (files.length === 1) {
        // Single resume upload
        const formData = new FormData();
        formData.append('file', files[0]);
        const res = await resumesAPI.upload(formData);
        setParsedResults([res.data]);
      } else {
        // Bulk / Batch multi-resume upload
        const formData = new FormData();
        files.forEach((f) => {
          formData.append('files', f);
        });
        const res = await resumesAPI.uploadBulk(formData);
        setParsedResults(Array.isArray(res.data) ? res.data : [res.data]);
      }
      // Clear staged files after upload
      setFiles([]);
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((d) => d.msg || `${d.loc?.join('.')}: ${d.msg}`).join(', '));
      } else {
        setError(detail || 'Failed to process resumes. Please ensure files are readable PDF or DOCX.');
      }
    } finally {
      setUploading(false);
    }
  };

  const totalBytes = files.reduce((acc, f) => acc + f.size, 0);
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-2">
          <Layers className="w-3.5 h-3.5" />
          Bulk & Single CV Ingestion Engine
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Upload & Parse Resumes (Bulk Supported)
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Select or drag multiple candidate CVs (PDF/DOCX) to simultaneously extract skills, experience years, and degrees with NLP.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-2xl flex items-center gap-2 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Upload Drop Zone Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <form onSubmit={handleUpload}>
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all ${
              dragActive
                ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
                : files.length > 0
                ? 'border-indigo-400 bg-indigo-50/20'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
            }`}
          >
            <input
              type="file"
              id="resume-file-input"
              multiple
              accept=".pdf,.docx,.doc"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
                  files.length > 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-50 text-blue-600'
                }`}
              >
                {files.length > 0 ? <FileText className="w-8 h-8" /> : <UploadCloud className="w-8 h-8" />}
              </div>

              <div>
                <p className="text-base font-semibold text-slate-800">
                  Drag and drop <span className="font-bold text-blue-600">multiple CVs</span> here, or{' '}
                  <span className="text-blue-600 font-bold hover:underline">browse</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supports bulk selection of PDF and DOCX documents (up to 10MB per file)
                </p>
              </div>
            </div>
          </div>

          {/* Staged Files Queue Display */}
          {files.length > 0 && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>
                  Ready to upload: <strong>{files.length} {files.length === 1 ? 'file' : 'files'}</strong> ({totalMB} MB)
                </span>
                <button
                  type="button"
                  onClick={clearAllFiles}
                  className="text-red-600 hover:underline"
                >
                  Clear all
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap gap-2">
                {files.map((file, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="font-medium truncate max-w-[200px]" title={file.name}>
                      {file.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ({(file.size / 1024).toFixed(0)} KB)
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(file.name)}
                      className="text-slate-400 hover:text-red-600 focus:outline-none ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Submit Action */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-500">
              * Natural Language Processing extracts candidate skills, experience, and education tiers.
            </span>

            <button
              type="submit"
              disabled={files.length === 0 || uploading}
              className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Parsing {files.length} {files.length === 1 ? 'Resume' : 'Resumes'} with NLP...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  {files.length > 1
                    ? `Upload & Parse ${files.length} Resumes (Bulk)`
                    : 'Upload & Parse Resume'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Parsed Candidates Results Display */}
      {parsedResults.length > 0 && (
        <div className="bg-white rounded-3xl border border-emerald-200 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {parsedResults.length} {parsedResults.length === 1 ? 'Resume' : 'Resumes'} Successfully Parsed & Indexed!
                </h2>
                <p className="text-xs text-slate-500">
                  Candidates are now available in the database for AI matching
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/matching')}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Match All with Jobs Now
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Cards Grid for Parsed Candidates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parsedResults.map((cand, index) => (
              <div
                key={cand.id || index}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                      {cand.candidate_name ? cand.candidate_name[0].toUpperCase() : 'C'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        {cand.candidate_name || cand.filename}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono truncate max-w-[220px]">
                        {cand.filename}
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-semibold shrink-0">
                    ID #{cand.id}
                  </span>
                </div>

                {/* Candidate Metadata Badges */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    <Briefcase className="w-3 h-3 text-blue-600" />
                    <span>{cand.experience_years ? `${cand.experience_years} yrs exp` : 'Entry level'}</span>
                  </div>

                  <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    <GraduationCap className="w-3 h-3 text-blue-600" />
                    <span>{cand.education_level || "Bachelor's Degree"}</span>
                  </div>
                </div>

                {/* Extracted Skills Chips */}
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-slate-400" />
                    Extracted Skills ({(cand.parsed_skills || []).length})
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(cand.parsed_skills || []).slice(0, 5).map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-[11px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {(cand.parsed_skills || []).length > 5 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{(cand.parsed_skills || []).length - 5} more
                      </span>
                    )}
                    {(!cand.parsed_skills || cand.parsed_skills.length === 0) && (
                      <span className="text-[11px] text-slate-400 italic">No explicit skills detected</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
