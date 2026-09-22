import React, { useRef, useState } from 'react';
import { TeamMemberCV } from '../../types';
import { cvApi } from '../../services/api';
import { Upload, Trash2, Eye, RefreshCw, FileText, CheckCircle2, AlertCircle, Clock, Sparkles } from 'lucide-react';

interface CvManagerProps {
  cvs: TeamMemberCV[];
  onRefresh: () => void;
  onPreviewCv: (cv: TeamMemberCV) => void;
}

export const CvManager: React.FC<CvManagerProps> = ({ cvs, onRefresh, onPreviewCv }) => {
  const [uploadingPerson, setUploadingPerson] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ person: string; message: string; type: 'success' | 'error' } | null>(null);

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const membersConfig = [
    { personKey: 'shubham', defaultName: 'Shubham Kumar Jha', role: 'Full Stack & Lead Developer' },
    { personKey: 'priyatam', defaultName: 'Priyatam Raj', role: 'System Architect & Backend Specialist' },
    { personKey: 'jisu', defaultName: 'Jisu Kumar Thakur', role: 'UI/UX Designer & Frontend Engineer' },
  ];

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '-';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const handleFileChange = async (personKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPerson(personKey);
    setUploadProgress(10);
    setFeedback(null);

    try {
      const res = await cvApi.upload(personKey, file, (percent) => {
        setUploadProgress(percent);
      });

      if (res.success) {
        setFeedback({
          person: personKey,
          message: 'Upload completed successfully.',
          type: 'success',
        });
        onRefresh();
      }
    } catch (err: any) {
      setFeedback({
        person: personKey,
        message: err.response?.data?.message || 'Something went wrong. Please try again.',
        type: 'error',
      });
    } finally {
      setUploadingPerson(null);
      setUploadProgress(0);
      if (e.target) e.target.value = '';
    }
  };

  const handleDelete = async (personKey: string) => {
    if (!confirm('Are you sure you want to remove this CV file?')) return;

    try {
      const res = await cvApi.delete(personKey);
      if (res.success) {
        setFeedback({
          person: personKey,
          message: 'CV removed successfully.',
          type: 'success',
        });
        onRefresh();
      }
    } catch (err: any) {
      setFeedback({
        person: personKey,
        message: err.response?.data?.message || 'Failed to delete CV.',
        type: 'error',
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg sm:text-xl font-heading font-bold text-slate-100 flex items-center gap-2">
            <FileText size={20} className="text-amber-400" />
            <span>CV & Resume Management</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Upload and maintain the official team member CV documents (PDF, DOC, DOCX supported).
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
        >
          <RefreshCw size={13} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 3 Upload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {membersConfig.map((cfg, index) => {
          const cv = cvs.find(c => c.personKey.toLowerCase() === cfg.personKey.toLowerCase());
          const hasFile = !!cv?.fileUrl;
          const isUploading = uploadingPerson === cfg.personKey;
          const cardFeedback = feedback?.person === cfg.personKey ? feedback : null;

          return (
            <div
              key={cfg.personKey}
              className={`rounded-2xl glass-card p-6 flex flex-col justify-between border transition-all duration-300 ${
                hasFile ? 'border-slate-800 hover:border-amber-500/40' : 'border-dashed border-slate-700 bg-slate-900/40'
              }`}
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    SLOT 0{index + 1}
                  </span>
                  {hasFile ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 size={12} />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                      <Clock size={12} />
                      Empty
                    </span>
                  )}
                </div>

                <h4 className="text-base font-heading font-bold text-slate-100 uppercase tracking-wide">
                  {cv?.personName || cfg.defaultName}
                </h4>
                <p className="text-xs text-cyan-400 mb-4 font-medium">
                  {cv?.role || cfg.role}
                </p>

                {/* Uploaded File Info */}
                {hasFile ? (
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 mb-4 space-y-1.5">
                    <div className="flex items-start gap-2">
                      <FileText size={15} className="text-amber-400 shrink-0 mt-0.5" />
                      <span className="text-xs font-medium text-slate-200 truncate" title={cv?.fileName || ''}>
                        {cv?.fileName || 'resume_document.pdf'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-900">
                      <span>Size: {formatFileSize(cv?.fileSize ?? null)}</span>
                      <span>{cv?.uploadedAt ? new Date(cv.uploadedAt).toLocaleDateString() : ''}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/50 text-center mb-4">
                    <p className="text-xs text-slate-500">
                      No CV file uploaded yet. Click below to add PDF or DOCX file.
                    </p>
                  </div>
                )}

                {/* Feedback status message */}
                {cardFeedback && (
                  <div className={`p-2.5 rounded-lg text-xs mb-3 flex items-center gap-1.5 ${
                    cardFeedback.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                  }`}>
                    {cardFeedback.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    <span>{cardFeedback.message}</span>
                  </div>
                )}

                {/* Upload Progress Bar */}
                {isUploading && (
                  <div className="mb-3 space-y-1">
                    <div className="flex justify-between text-[11px] font-mono text-amber-400">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-3 border-t border-slate-800/80">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  ref={el => (fileInputRefs.current[cfg.personKey] = el)}
                  onChange={(e) => handleFileChange(cfg.personKey, e)}
                  className="hidden"
                />

                {hasFile ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onPreviewCv(cv!)}
                        className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                      >
                        <Eye size={13} />
                        <span>Preview</span>
                      </button>

                      <button
                        onClick={() => fileInputRefs.current[cfg.personKey]?.click()}
                        disabled={isUploading}
                        className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-colors disabled:opacity-50"
                      >
                        <Upload size={13} />
                        <span>Replace</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleDelete(cfg.personKey)}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors"
                    >
                      <Trash2 size={13} />
                      <span>Delete CV</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => fileInputRefs.current[cfg.personKey]?.click()}
                    disabled={isUploading}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-heading font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20 transition-all duration-200 active:scale-98 disabled:opacity-50"
                  >
                    <Upload size={15} />
                    <span>Upload CV Document</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
