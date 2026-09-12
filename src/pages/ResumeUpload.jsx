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
  Mail 
} from 'lucide-react';

export default function ResumeUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [parsedResult, setParsedResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
      ];
      if (
        validTypes.includes(droppedFile.type) ||
        droppedFile.name.endsWith('.pdf') ||
        droppedFile.name.endsWith('.docx')
      ) {
        setFile(droppedFile);
        setError('');
      } else {
        setError('Please drop a valid PDF or DOCX resume document.');
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await resumesAPI.upload(formData);
      setParsedResult(res.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || 'Failed to parse resume. Please ensure file is a readable PDF or DOCX.'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Upload & Parse Resume (CV)
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Upload a PDF or Word document to instantly extract candidate skills, experience, and educational background using NLP.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center gap-2 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Upload Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleUpload}>
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all ${
              dragActive
                ? 'border-blue-500 bg-blue-50/50'
                : file
                ? 'border-emerald-400 bg-emerald-50/20'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
            }`}
          >
            <input
              type="file"
              id="resume-file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
                  file ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-50 text-blue-600'
                }`}
              >
                {file ? <FileText className="w-8 h-8" /> : <UploadCloud className="w-8 h-8" />}
              </div>

              {file ? (
                <div>
                  <p className="text-base font-bold text-slate-800">{file.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to parse
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-base font-semibold text-slate-700">
                    Drag and drop your resume file here, or{' '}
                    <span className="text-blue-600 font-bold hover:underline">browse</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports PDF, DOCX (up to 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              * Text is processed with PyPDF2 / python-docx and parsed through our NLP extractor
            </span>

            <button
              type="submit"
              disabled={!file || uploading}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Parsing Resume with NLP...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  Upload & Analyze
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Live NLP Extraction Result Card */}
      {parsedResult && (
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
              <h2 className="text-lg font-bold text-slate-900">
                Resume Extracted Successfully!
              </h2>
            </div>
            <button
              onClick={() => navigate('/matching')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Match with Jobs Now
            </button>
          </div>

          {/* Candidate Profile Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                <User className="w-4 h-4 text-blue-600" />
                Candidate Name
              </div>
              <p className="text-sm font-bold text-slate-800">
                {parsedResult.candidate_name || 'Not detected'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                <Mail className="w-4 h-4 text-blue-600" />
                Email
              </div>
              <p className="text-sm font-bold text-slate-800 truncate">
                {parsedResult.candidate_email || 'Not detected'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                <Briefcase className="w-4 h-4 text-blue-600" />
                Experience
              </div>
              <p className="text-sm font-bold text-slate-800">
                {parsedResult.experience_years
                  ? `${parsedResult.experience_years} Years`
                  : '0 Years (Entry level)'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                Education
              </div>
              <p className="text-sm font-bold text-slate-800">
                {parsedResult.education_level || 'Not detected'}
              </p>
            </div>
          </div>

          {/* Extracted Skills */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-600" />
              Identified Skills ({parsedResult.skills?.length || 0})
            </div>
            <div className="flex flex-wrap gap-2">
              {parsedResult.skills && parsedResult.skills.length > 0 ? (
                parsedResult.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">No explicit keywords matched.</span>
              )}
            </div>
          </div>

          {/* Raw Text preview collapsible */}
          {parsedResult.raw_text && (
            <div className="mt-4">
              <details className="text-xs text-slate-600 group">
                <summary className="cursor-pointer font-semibold text-slate-700 hover:text-blue-600 select-none">
                  View Raw Extracted Text ({parsedResult.raw_text.length} characters)
                </summary>
                <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl max-h-48 overflow-y-auto whitespace-pre-wrap font-mono text-[11px] text-slate-700">
                  {parsedResult.raw_text}
                </div>
              </details>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
