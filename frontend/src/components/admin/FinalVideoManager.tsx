import React, { useRef, useState } from 'react';
import { FinalVideoItem } from '../../types';
import { videoApi } from '../../services/api';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Upload, 
  Trash2, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Video, 
  Award, 
  Edit3, 
  Save, 
  X, 
  Download, 
  Copy, 
  Check, 
  ExternalLink,
  QrCode,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { normalizeUrl, isExternalUrl } from '../../utils/urlHelper';

interface FinalVideoManagerProps {
  finalVideo: FinalVideoItem | null;
  onRefresh: () => void;
  onPreviewVideo: (video: any) => void;
}

export const FinalVideoManager: React.FC<FinalVideoManagerProps> = ({ finalVideo, onRefresh, onPreviewVideo }) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Public link editing state
  const defaultPublicUrl = `${window.location.origin}/final-video`;
  const currentPublicUrl = finalVideo?.publicUrl && finalVideo.publicUrl.trim()
    ? normalizeUrl(finalVideo.publicUrl)
    : defaultPublicUrl;

  const [isEditingLink, setIsEditingLink] = useState<boolean>(false);
  const [linkInput, setLinkInput] = useState<string>(currentPublicUrl);
  const [isSavingLink, setIsSavingLink] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // State for Replace QR Modal & Upload
  const [qrPreviewModal, setQrPreviewModal] = useState<{
    file: File;
    previewUrl: string;
    currentPublicUrl: string;
    currentQrMode: 'dynamic' | 'custom';
    currentCustomQrUrl?: string | null;
  } | null>(null);
  const [isUploadingQr, setIsUploadingQr] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const qrFileInputRef = useRef<HTMLInputElement | null>(null);

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '-';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(10);
    setFeedback(null);

    try {
      const res = await videoApi.uploadFinalVideo(file, (percent) => {
        setUploadProgress(percent);
      });

      if (res.success) {
        setFeedback({
          message: 'Final Video Resume uploaded successfully!',
          type: 'success',
        });
        onRefresh();
      }
    } catch (err: any) {
      setFeedback({
        message: err.response?.data?.message || 'Failed to upload final video.',
        type: 'error',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (e.target) e.target.value = '';
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete the Final Video Resume? This will also remove the associated custom QR code and reset the section.')) return;

    try {
      const res = await videoApi.deleteFinalVideo();
      if (res.success) {
        setFeedback({
          message: 'Final video and QR removed successfully.',
          type: 'success',
        });
        onRefresh();
      }
    } catch (err: any) {
      setFeedback({
        message: err.response?.data?.message || 'Failed to delete final video.',
        type: 'error',
      });
    }
  };

  const handleStartEditLink = () => {
    setLinkInput(finalVideo?.publicUrl || defaultPublicUrl);
    setIsEditingLink(true);
    setFeedback(null);
  };

  const handleCancelEditLink = () => {
    setIsEditingLink(false);
    setLinkInput(finalVideo?.publicUrl || defaultPublicUrl);
  };

  const handleSaveLink = async (resetQrMode: boolean = false) => {
    const trimmed = linkInput.trim();
    if (!trimmed) {
      setFeedback({
        message: 'Please enter a valid URL.',
        type: 'error'
      });
      return;
    }

    const normalized = normalizeUrl(trimmed);

    setIsSavingLink(true);
    try {
      const res = await videoApi.updateFinalVideoLink(normalized, resetQrMode);
      if (res.success) {
        setFeedback({
          message: resetQrMode
            ? 'Public link updated and dynamic QR regenerated successfully.'
            : 'Public link updated successfully.',
          type: 'success'
        });
        setIsEditingLink(false);
        onRefresh();
      }
    } catch (err: any) {
      setFeedback({
        message: err.response?.data?.message || 'Failed to update public link.',
        type: 'error'
      });
    } finally {
      setIsSavingLink(false);
    }
  };

  const handleSelectQrFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validExtensions = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const validExts = ['.png', '.jpg', '.jpeg', '.webp'];
    const fileName = file.name.toLowerCase();
    const hasValidExt = validExts.some(ext => fileName.endsWith(ext));

    if (!validExtensions.includes(file.type) && !hasValidExt) {
      setFeedback({
        message: 'Please upload a valid QR image (PNG, JPG, JPEG, WEBP).',
        type: 'error'
      });
      if (e.target) e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFeedback({
        message: 'QR image size exceeds maximum of 5MB.',
        type: 'error'
      });
      if (e.target) e.target.value = '';
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setQrPreviewModal({
      file,
      previewUrl,
      currentPublicUrl,
      currentQrMode: finalVideo?.qrMode || 'dynamic',
      currentCustomQrUrl: finalVideo?.customQrUrl
    });

    if (e.target) e.target.value = '';
  };

  const handleConfirmReplaceQr = async () => {
    if (!qrPreviewModal) return;

    setIsUploadingQr(true);
    try {
      const res = await videoApi.replaceFinalVideoQr(qrPreviewModal.file);
      if (res.success) {
        setFeedback({
          message: 'Final Video QR code replaced successfully.',
          type: 'success'
        });
        setQrPreviewModal(null);
        onRefresh();
      }
    } catch (err: any) {
      setFeedback({
        message: err.response?.data?.message || 'Failed to replace QR code.',
        type: 'error'
      });
    } finally {
      setIsUploadingQr(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentPublicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadQR = () => {
    // If Custom QR is active, download custom image
    if (finalVideo?.qrMode === 'custom' && finalVideo?.customQrUrl) {
      const downloadLink = document.createElement('a');
      downloadLink.href = `${finalVideo.customQrUrl}?t=${Date.now()}`;
      downloadLink.download = 'CUTM_Team03_Final_Video_QR.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      return;
    }

    // Dynamic QR generation
    const svgElement = document.getElementById('admin-final-video-qr') as unknown as SVGElement;
    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1000;
      canvas.height = 1000;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 50, 50, 900, 900);

        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = 'CUTM_Team03_Final_Video_QR.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    };
    image.src = blobURL;
  };

  const hasVideo = !!finalVideo?.fileUrl;
  const isCustomQr = finalVideo?.qrMode === 'custom' && !!finalVideo?.customQrUrl;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg sm:text-xl font-heading font-bold text-slate-100 flex items-center gap-2">
            <Award size={20} className="text-amber-400" />
            <span>Final Video Resume Showcase</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage master video resume file, edit public video link, and replace custom QR code.
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

      {/* Main Single Card Container */}
      <div className="max-w-4xl mx-auto w-full">
        <div className={`rounded-2xl glass-card overflow-hidden border p-6 sm:p-8 flex flex-col gap-6 transition-all ${
          hasVideo || isCustomQr ? 'border-slate-800 hover:border-amber-500/40' : 'border-dashed border-slate-700 bg-slate-900/30'
        }`}>
          {/* Status Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                MASTER CUT
              </span>
              <span className="text-xs text-slate-400">Centurion University Team 03</span>
            </div>

            {hasVideo ? (
              <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <CheckCircle2 size={13} />
                Live on Portal
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-mono text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
                <Clock size={13} />
                Pending Upload
              </span>
            )}
          </div>

          {/* Feedback & Progress */}
          {feedback && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              feedback.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
            }`}>
              {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* 2-Column Grid: Video Preview & QR Code Card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Column: Video Preview / Dropzone (7 cols) */}
            <div className="md:col-span-7 flex flex-col gap-4">
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center shadow-md">
                {hasVideo ? (
                  <>
                    <video
                      src={finalVideo?.fileUrl!}
                      className="w-full h-full object-cover"
                      preload="metadata"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <button
                        onClick={() => onPreviewVideo({ title: 'Final Video Resume', fileUrl: finalVideo?.fileUrl })}
                        className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95"
                        title="Play Video"
                      >
                        <Play size={24} className="fill-slate-950 ml-1" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center max-w-sm">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 text-amber-400 flex items-center justify-center mb-3">
                      <Video size={26} />
                    </div>
                    <h4 className="text-sm font-heading font-bold text-slate-200 mb-1">
                      No Final Video Uploaded
                    </h4>
                    <p className="text-xs text-slate-400">
                      Upload the completed video resume presentation (MP4, WebM, MOV supported up to 500MB).
                    </p>
                  </div>
                )}
              </div>

              {/* Video Meta Info */}
              {hasVideo && (
                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] font-mono">
                  <div className="flex flex-col">
                    <span className="text-slate-500">Filename:</span>
                    <span className="text-slate-200 truncate" title={finalVideo?.fileName || ''}>
                      {finalVideo?.fileName || 'final_resume.mp4'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500">File Size:</span>
                    <span className="text-slate-200">{formatFileSize(finalVideo?.fileSize ?? null)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500">Upload Date:</span>
                    <span className="text-slate-200">
                      {finalVideo?.uploadedAt ? new Date(finalVideo.uploadedAt).toLocaleDateString() : '-'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: QR Code Box with Download & Replace QR buttons (5 cols) */}
            <div className="md:col-span-5 flex flex-col items-center p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 mb-2">
                <QrCode size={11} />
                <span>DYNAMIC / CUSTOM QR CODE</span>
              </div>
              <h5 className="text-xs font-heading font-bold text-slate-100 mb-2">
                FINAL VIDEO QR CODE
              </h5>

              {/* QR Image Display */}
              <div 
                onClick={() => window.open(currentPublicUrl, '_blank', 'noopener,noreferrer')}
                className="p-3 bg-white rounded-xl shadow-lg border border-amber-500/30 mb-2 w-[140px] h-[140px] flex items-center justify-center cursor-pointer hover:scale-105 hover:border-amber-400 transition-all"
                title="Click to test open public link"
              >
                {isCustomQr ? (
                  <img
                    src={`${finalVideo?.customQrUrl}?t=${finalVideo?.qrUpdatedAt ? new Date(finalVideo.qrUpdatedAt).getTime() : Date.now()}`}
                    alt="Final Video Custom QR"
                    className="w-full h-full object-contain rounded"
                  />
                ) : (
                  <QRCodeSVG
                    id="admin-final-video-qr"
                    value={currentPublicUrl}
                    size={115}
                    level="H"
                    includeMargin={false}
                  />
                )}
              </div>

              {/* Status Indicator */}
              <div className="mb-3 text-[11px] font-mono">
                {isCustomQr ? (
                  <span className="font-semibold text-emerald-400 flex items-center justify-center gap-1">
                    <span>🟢</span>
                    <span>Custom QR Active</span>
                  </span>
                ) : (
                  <span className="font-semibold text-amber-400/90 flex items-center justify-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span>Dynamic QR Active</span>
                  </span>
                )}
              </div>

              {/* Hidden File Input for QR */}
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,.png,.jpg,.jpeg,.webp"
                ref={qrFileInputRef}
                onChange={handleSelectQrFile}
                className="hidden"
              />

              {/* Action Buttons: [ Download QR Code ] & [ Replace QR Code ] */}
              <div className="w-full flex flex-col gap-2">
                <button
                  onClick={handleDownloadQR}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all active:scale-98"
                >
                  <Download size={13} />
                  <span>Download QR Code</span>
                </button>

                <button
                  onClick={() => qrFileInputRef.current?.click()}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-amber-300 border border-slate-700/80 hover:border-amber-500/30 transition-all shadow-sm"
                >
                  <QrCode size={13} className="text-amber-400" />
                  <span>Replace QR Code</span>
                </button>
              </div>
            </div>
          </div>

          {/* Public Link Management Box with Edit Functionality */}
          <div className="flex flex-col gap-2 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium text-slate-400">
                Public Video URL
              </span>

              {!isEditingLink && (
                <button
                  onClick={handleStartEditLink}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/20 transition-colors"
                >
                  <Edit3 size={12} />
                  <span>Edit Link</span>
                </button>
              )}
            </div>

            {isEditingLink ? (
              <div className="space-y-2.5 pt-1">
                <input
                  type="text"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  placeholder="https://example.com/final-video"
                  className="w-full bg-slate-900 border border-amber-500/50 focus:border-amber-400 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 outline-none transition-colors"
                  autoFocus
                />

                {/* Warning if Custom QR is active */}
                {isCustomQr && (
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-300 flex items-start gap-2">
                    <AlertTriangle size={15} className="shrink-0 mt-0.5 text-amber-400" />
                    <span>
                      This Final Video currently uses a custom QR code. Changing the public URL will not update the custom QR automatically.
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {isCustomQr ? (
                    <>
                      <button
                        onClick={() => handleSaveLink(false)}
                        disabled={isSavingLink}
                        className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
                      >
                        <Save size={12} />
                        <span>Keep Custom QR</span>
                      </button>

                      <button
                        onClick={() => handleSaveLink(true)}
                        disabled={isSavingLink}
                        className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md transition-all disabled:opacity-50"
                      >
                        <RotateCcw size={12} />
                        <span>Generate New QR</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleSaveLink(false)}
                      disabled={isSavingLink}
                      className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Save size={12} />
                      <span>{isSavingLink ? 'Saving...' : 'Save Link'}</span>
                    </button>
                  )}

                  <button
                    onClick={handleCancelEditLink}
                    disabled={isSavingLink}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700 transition-colors"
                  >
                    <X size={12} />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300">
                <a
                  href={currentPublicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate max-w-[280px] sm:max-w-md hover:underline hover:text-amber-300 block flex-1"
                  title={currentPublicUrl}
                >
                  {currentPublicUrl}
                </a>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={handleCopyLink}
                    className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                    title="Copy Link"
                  >
                    {copiedLink ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>
                  <a
                    href={currentPublicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                    title="Open Link"
                  >
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono text-amber-400">
                <span>Uploading Final Video Presentation...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Video Upload & Delete Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80">
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/x-matroska,.mp4,.webm,.mov"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            {hasVideo ? (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all active:scale-98 disabled:opacity-50"
                >
                  <Upload size={16} />
                  <span>Replace Video File</span>
                </button>

                <button
                  onClick={handleDelete}
                  className="inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
                >
                  <Trash2 size={15} />
                  <span>Delete Video</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm sm:text-base font-heading font-semibold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 shadow-xl shadow-amber-500/25 transition-all duration-200 active:scale-98 disabled:opacity-50"
              >
                <Upload size={18} />
                <span>Upload Final Video Presentation</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation & Comparison Preview Modal for Replace QR */}
      {qrPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                  <QrCode size={16} />
                </div>
                <div>
                  <h4 className="text-base font-heading font-bold text-slate-100">
                    Replace Final Video QR Code?
                  </h4>
                  <p className="text-xs text-slate-400">
                    Master cut presentation QR
                  </p>
                </div>
              </div>
              <button
                onClick={() => setQrPreviewModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Side-by-Side Comparison */}
            <div className="grid grid-cols-2 gap-4">
              {/* Left: Current QR */}
              <div className="flex flex-col items-center p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                  Current QR
                </span>
                <div className="p-3 bg-white rounded-xl shadow-md border border-slate-700 w-32 h-32 flex items-center justify-center">
                  {qrPreviewModal.currentQrMode === 'custom' && qrPreviewModal.currentCustomQrUrl ? (
                    <img
                      src={`${qrPreviewModal.currentCustomQrUrl}?t=${Date.now()}`}
                      alt="Current Custom QR"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <QRCodeSVG
                      value={qrPreviewModal.currentPublicUrl}
                      size={110}
                      level="H"
                      includeMargin={false}
                    />
                  )}
                </div>
                <span className="text-[10px] text-slate-500 font-mono mt-2">
                  {qrPreviewModal.currentQrMode === 'custom' ? 'Custom QR' : 'Dynamic QR'}
                </span>
              </div>

              {/* Right: New QR Preview */}
              <div className="flex flex-col items-center p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-center">
                <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider mb-2 font-semibold">
                  New QR Preview
                </span>
                <div className="p-3 bg-white rounded-xl shadow-md border border-amber-500/40 w-32 h-32 flex items-center justify-center">
                  <img
                    src={qrPreviewModal.previewUrl}
                    alt="Newly Selected QR Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-[10px] text-amber-300 font-mono mt-2 truncate max-w-[140px]" title={qrPreviewModal.file.name}>
                  {qrPreviewModal.file.name}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              Confirming will store this QR as <span className="font-mono text-amber-400">final-video.png</span> and activate <span className="font-mono text-emerald-400">Custom QR Active</span> mode. The uploaded video file and public URL will remain unchanged.
            </p>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setQrPreviewModal(null)}
                disabled={isUploadingQr}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmReplaceQr}
                disabled={isUploadingQr}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
              >
                <QrCode size={13} />
                <span>{isUploadingQr ? 'Replacing...' : 'Replace QR'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
