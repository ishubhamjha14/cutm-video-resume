import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { TeamMemberCV } from '../../types';
import { Download, ExternalLink, FileText, ZoomIn, ZoomOut, AlertCircle } from 'lucide-react';

interface CvViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  cv: TeamMemberCV | null;
}

export const CvViewerModal: React.FC<CvViewerModalProps> = ({ isOpen, onClose, cv }) => {
  const [zoom, setZoom] = useState<number>(100);

  if (!cv) return null;

  const isPdf = cv.fileUrl?.toLowerCase().endsWith('.pdf') || cv.mimeType?.includes('pdf');
  const isDoc = cv.fileUrl?.toLowerCase().endsWith('.doc') || cv.fileUrl?.toLowerCase().endsWith('.docx');

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Curriculum Vitae — ${cv.personName}`}
      subtitle={`${cv.role} • Team 03`}
      maxWidth="max-w-5xl"
    >
      <div className="flex flex-col gap-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FileText size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-medium text-slate-200 truncate max-w-[200px] sm:max-w-md">
                {cv.fileName || `${cv.personName}_CV.pdf`}
              </span>
              <span className="text-[11px] text-slate-400">
                {cv.fileSize ? formatFileSize(cv.fileSize) : 'Document'} {cv.uploadedAt ? `• Uploaded ${new Date(cv.uploadedAt).toLocaleDateString()}` : ''}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isPdf && (
              <div className="hidden sm:flex items-center gap-1 bg-slate-800/80 rounded-lg p-1 border border-slate-700/50">
                <button
                  onClick={() => setZoom(prev => Math.max(prev - 15, 60))}
                  className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white"
                  title="Zoom Out"
                >
                  <ZoomOut size={15} />
                </button>
                <span className="px-2 text-xs font-mono text-slate-300">{zoom}%</span>
                <button
                  onClick={() => setZoom(prev => Math.min(prev + 15, 160))}
                  className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white"
                  title="Zoom In"
                >
                  <ZoomIn size={15} />
                </button>
              </div>
            )}

            {cv.fileUrl && (
              <>
                <a
                  href={cv.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  <ExternalLink size={14} />
                  <span className="hidden sm:inline">New Tab</span>
                </a>

                <a
                  href={cv.fileUrl}
                  download={cv.fileName || `${cv.personName}_CV`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 transition-all"
                >
                  <Download size={14} />
                  <span>Download CV</span>
                </a>
              </>
            )}
          </div>
        </div>

        {/* Document Viewer Frame */}
        <div className="relative w-full h-[65vh] rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 flex items-center justify-center">
          {cv.fileUrl ? (
            isPdf ? (
              <iframe
                src={`${cv.fileUrl}#toolbar=0&navpanes=0`}
                title={`${cv.personName} CV`}
                className="w-full h-full border-0 rounded-xl"
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
              />
            ) : (
              /* If Word Document / DOCX */
              <div className="flex flex-col items-center justify-center p-8 text-center max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mb-4">
                  <FileText size={32} />
                </div>
                <h4 className="text-lg font-heading font-bold text-slate-100 mb-2">Word Document (.docx)</h4>
                <p className="text-sm text-slate-400 mb-6">
                  This CV is saved as a Microsoft Word document. Click below to download or view it with your office reader.
                </p>
                <a
                  href={cv.fileUrl}
                  download={cv.fileName || `${cv.personName}_CV.docx`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/25 transition-all"
                >
                  <Download size={16} />
                  <span>Download Document</span>
                </a>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
                <AlertCircle size={28} />
              </div>
              <h4 className="text-base font-semibold text-slate-200 mb-1">CV will be available soon.</h4>
              <p className="text-xs text-slate-400 max-w-xs">
                The resume for {cv.personName} has not been uploaded to the portal yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
