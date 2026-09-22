import React, { useRef, useState } from 'react';
import { RawVideoItem } from '../../types';
import { videoApi } from '../../services/api';
import { QRCodeSVG } from 'qrcode.react';
import {
  Upload,
  Trash2,
  Download,
  RefreshCw,
  Film,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Edit3,
  X,
  Save,
  QrCode,
  Image as ImageIcon,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { normalizeUrl, isExternalUrl } from '../../utils/urlHelper';

interface RawVideoManagerProps {
  videos: RawVideoItem[];
  onRefresh: () => void;
  onPreviewVideo?: (video: RawVideoItem) => void;
}

export const RawVideoManager: React.FC<RawVideoManagerProps> = ({ videos, onRefresh, onPreviewVideo }) => {
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ slot: number; message: string; type: 'success' | 'error' } | null>(null);
  const [copiedSlot, setCopiedSlot] = useState<number | null>(null);

  // State for Editing Public Link per slot
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [editedUrl, setEditedUrl] = useState<{ [key: number]: string }>({});
  const [isSavingLink, setIsSavingLink] = useState<boolean>(false);

  // State for Replace QR Modal & File Selection
  const [qrPreviewModal, setQrPreviewModal] = useState<{
    slotId: number;
    file: File;
    previewUrl: string;
    currentPublicUrl: string;
    currentQrMode: 'dynamic' | 'custom';
    currentCustomQrUrl?: string | null;
  } | null>(null);
  const [isUploadingQr, setIsUploadingQr] = useState<boolean>(false);

  const videoFileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const qrFileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '-';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const getPublicUrl = (video: RawVideoItem) => {
    if (video.publicUrl && video.publicUrl.trim()) {
      return normalizeUrl(video.publicUrl);
    }
    const origin = window.location.origin;
    return `${origin}/raw/${video.slotId}`;
  };

  const handleCopyUrl = (slotId: number, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedSlot(slotId);
    setTimeout(() => setCopiedSlot(null), 2000);
  };

  const handleStartEdit = (slotId: number, currentUrl: string) => {
    setEditingSlot(slotId);
    setEditedUrl(prev => ({ ...prev, [slotId]: currentUrl }));
    setFeedback(null);
  };

  const handleCancelEdit = () => {
    setEditingSlot(null);
  };

  // Save Link with option to keep custom QR or generate new dynamic QR
  const handleSaveLink = async (slotId: number, resetQrMode: boolean = false) => {
    const inputUrl = (editedUrl[slotId] || '').trim();
    if (!inputUrl) {
      setFeedback({
        slot: slotId,
        message: 'Please enter a valid URL.',
        type: 'error',
      });
      return;
    }

    const normalizedUrl = normalizeUrl(inputUrl);

    setIsSavingLink(true);
    setFeedback(null);

    try {
      const res = await videoApi.updateRawVideoLink(slotId, normalizedUrl, resetQrMode);
      if (res.success) {
        setFeedback({
          slot: slotId,
          message: resetQrMode
            ? 'Public link updated and dynamic QR regenerated successfully.'
            : 'Public link updated successfully.',
          type: 'success',
        });
        setEditingSlot(null);
        onRefresh();
      }
    } catch (err: any) {
      setFeedback({
        slot: slotId,
        message: err.response?.data?.message || 'Failed to update public link. Please try again.',
        type: 'error',
      });
    } finally {
      setIsSavingLink(false);
    }
  };

  // Trigger file selection for QR replacement
  const handleSelectQrFile = (slotId: number, e: React.ChangeEvent<HTMLInputElement>, video: RawVideoItem) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format (.png, .jpg, .jpeg, .webp) and max 5MB
    const validExtensions = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const validExts = ['.png', '.jpg', '.jpeg', '.webp'];
    const fileName = file.name.toLowerCase();
    const hasValidExt = validExts.some(ext => fileName.endsWith(ext));

    if (!validExtensions.includes(file.type) && !hasValidExt) {
      setFeedback({
        slot: slotId,
        message: 'Please upload a valid QR image (PNG, JPG, JPEG, WEBP).',
        type: 'error'
      });
      if (e.target) e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFeedback({
        slot: slotId,
        message: 'QR image size exceeds recommended maximum of 5MB.',
        type: 'error'
      });
      if (e.target) e.target.value = '';
      return;
    }

    // Open confirmation/preview dialog
    const previewUrl = URL.createObjectURL(file);
    setQrPreviewModal({
      slotId,
      file,
      previewUrl,
      currentPublicUrl: getPublicUrl(video),
      currentQrMode: video.qrMode || 'dynamic',
      currentCustomQrUrl: video.customQrUrl
    });

    if (e.target) e.target.value = '';
  };

  // Confirm and upload new QR Code image
  const handleConfirmReplaceQr = async () => {
    if (!qrPreviewModal) return;

    setIsUploadingQr(true);
    try {
      const res = await videoApi.replaceRawVideoQr(qrPreviewModal.slotId, qrPreviewModal.file);
      if (res.success) {
        setFeedback({
          slot: qrPreviewModal.slotId,
          message: 'QR code replaced successfully.',
          type: 'success'
        });
        setQrPreviewModal(null);
        onRefresh();
      }
    } catch (err: any) {
      setFeedback({
        slot: qrPreviewModal.slotId,
        message: err.response?.data?.message || 'Failed to replace QR code.',
        type: 'error'
      });
    } finally {
      setIsUploadingQr(false);
    }
  };

  const handleDownloadQr = (video: RawVideoItem) => {
    const slotId = video.slotId;
    
    // If Custom QR is active, download the custom image directly
    if (video.qrMode === 'custom' && video.customQrUrl) {
      const downloadLink = document.createElement('a');
      downloadLink.href = `${video.customQrUrl}?t=${Date.now()}`;
      downloadLink.download = `raw-video-0${slotId}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      return;
    }

    // Else generate and export PNG from SVG
    const svgElement = document.getElementById(`admin-raw-qr-${slotId}`) as unknown as SVGElement;
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
        downloadLink.download = `CUTM_Team03_Raw_Video_0${slotId}_QR.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    };
    image.src = blobURL;
  };

  const handleVideoFileChange = async (slotId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSlot(slotId);
    setUploadProgress(10);
    setFeedback(null);

    try {
      const res = await videoApi.uploadRawVideo(slotId, file, (percent) => {
        setUploadProgress(percent);
      });

      if (res.success) {
        setFeedback({
          slot: slotId,
          message: 'Video uploaded successfully.',
          type: 'success',
        });
        onRefresh();
      }
    } catch (err: any) {
      setFeedback({
        slot: slotId,
        message: err.response?.data?.message || 'Something went wrong while uploading video.',
        type: 'error',
      });
    } finally {
      setUploadingSlot(null);
      setUploadProgress(0);
      if (e.target) e.target.value = '';
    }
  };

  const handleDelete = async (slotId: number) => {
    if (!confirm(`Are you sure you want to delete Raw Video 0${slotId}? This will remove the video file, custom QR code, and reset this slot.`)) return;

    try {
      const res = await videoApi.deleteRawVideo(slotId);
      if (res.success) {
        setFeedback({
          slot: slotId,
          message: 'Raw video and QR removed successfully.',
          type: 'success',
        });
        onRefresh();
      }
    } catch (err: any) {
      setFeedback({
        slot: slotId,
        message: err.response?.data?.message || 'Failed to delete raw video.',
        type: 'error',
      });
    }
  };

  // ONLY TWO SLOTS (1 and 2)
  const slots = [1, 2].map(slotNum => {
    const existing = videos.find(v => Number(v.slotId) === slotNum);
    return existing || {
      slotId: slotNum,
      title: `Raw Video 0${slotNum}`,
      description: 'Behind the scenes raw footage',
      fileUrl: null,
      publicUrl: null,
      qrMode: 'dynamic' as const,
      customQrUrl: null,
      qrFileName: null,
      qrUpdatedAt: null,
      fileName: null,
      fileSize: null,
      mimeType: null,
      thumbnailUrl: null,
      duration: null,
      uploadedAt: null,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg sm:text-xl font-heading font-bold text-slate-100 flex items-center gap-2">
            <Film size={20} className="text-cyan-400" />
            <span>Raw Video Management (Video, Link & Custom QR)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage Raw Video 01 and Raw Video 02. Independently replace videos, edit public links, and upload custom QR codes.
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

      {/* Exactly 2 Upload Slots */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {slots.map((video) => {
          const slotNum = video.slotId;
          const hasFile = !!video.fileUrl;
          const isUploading = uploadingSlot === slotNum;
          const cardFeedback = feedback?.slot === slotNum ? feedback : null;
          const currentPublicUrl = getPublicUrl(video);
          const isCopied = copiedSlot === slotNum;
          const isEditingLink = editingSlot === slotNum;
          const isCustomQr = video.qrMode === 'custom' && !!video.customQrUrl;

          return (
            <div
              key={slotNum}
              className={`rounded-2xl glass-card p-6 flex flex-col justify-between border transition-all duration-300 ${
                hasFile || isCustomQr ? 'border-slate-800 hover:border-cyan-500/40' : 'border-dashed border-slate-700 bg-slate-900/40'
              }`}
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                    RAW VIDEO 0{slotNum}
                  </span>
                  {hasFile ? (
                    <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 size={13} />
                      Live on Portal
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-mono text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded">
                      <Clock size={13} />
                      No Video File
                    </span>
                  )}
                </div>

                <h4 className="text-lg font-heading font-bold text-slate-100 uppercase mb-1">
                  {video.title || `Raw Video 0${slotNum}`}
                </h4>

                {/* Uploaded File Info & QR Preview */}
                <div className="space-y-4 my-4">
                  {/* Public URL Box with Edit Link Support */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-300 font-semibold">Public Video URL:</span>
                      {!isEditingLink && (
                        <button
                          onClick={() => handleStartEdit(slotNum, currentPublicUrl)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 transition-colors"
                          title="Edit Public Link"
                        >
                          <Edit3 size={11} />
                          <span>Edit Link</span>
                        </button>
                      )}
                    </div>

                    {isEditingLink ? (
                      /* Editable Input Form */
                      <div className="space-y-2.5 pt-1">
                        <input
                          type="url"
                          value={editedUrl[slotNum] ?? currentPublicUrl}
                          onChange={(e) => setEditedUrl({ ...editedUrl, [slotNum]: e.target.value })}
                          placeholder="https://example.com/video1"
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-cyan-500/50 text-slate-100 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-cyan-400"
                          autoFocus
                        />

                        {/* Warning if Custom QR is active */}
                        {isCustomQr && (
                          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-300 flex items-start gap-1.5">
                            <AlertTriangle size={14} className="shrink-0 mt-0.5 text-amber-400" />
                            <span>
                              Your QR code is manually uploaded. Changing the public URL will not update this QR automatically.
                            </span>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {isCustomQr ? (
                            <>
                              <button
                                onClick={() => handleSaveLink(slotNum, false)}
                                disabled={isSavingLink}
                                className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
                              >
                                <Save size={12} />
                                <span>Keep Custom QR</span>
                              </button>

                              <button
                                onClick={() => handleSaveLink(slotNum, true)}
                                disabled={isSavingLink}
                                className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 shadow-md transition-all disabled:opacity-50"
                              >
                                <RotateCcw size={12} />
                                <span>Generate New QR</span>
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleSaveLink(slotNum, false)}
                              disabled={isSavingLink}
                              className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 shadow-md transition-all disabled:opacity-50"
                            >
                              <Save size={13} />
                              <span>{isSavingLink ? 'Saving...' : 'Save Link'}</span>
                            </button>
                          )}

                          <button
                            onClick={handleCancelEdit}
                            disabled={isSavingLink}
                            className="inline-flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                          >
                            <X size={13} />
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Normal Display Box */
                      <div className="flex items-center justify-between gap-2 bg-slate-900/90 p-2 rounded-lg border border-slate-800/80">
                        <a
                          href={currentPublicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-mono text-cyan-300 hover:text-cyan-200 hover:underline truncate block flex-1"
                          title={currentPublicUrl}
                        >
                          {currentPublicUrl}
                        </a>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleCopyUrl(slotNum, currentPublicUrl)}
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Copy URL"
                          >
                            {isCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          </button>
                          <a
                            href={currentPublicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Open link in new tab"
                          >
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* QR Code Preview & Status Card */}
                  <div className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    {/* QR Display Container */}
                    <div 
                      onClick={() => window.open(currentPublicUrl, '_blank', 'noopener,noreferrer')}
                      className="p-2.5 bg-white rounded-xl shadow-lg border border-cyan-500/30 shrink-0 flex items-center justify-center w-[105px] h-[105px] cursor-pointer hover:scale-105 hover:border-cyan-400 transition-all"
                      title="Click to test open public link"
                    >
                      {isCustomQr ? (
                        <img
                          src={`${video.customQrUrl}?t=${video.qrUpdatedAt ? new Date(video.qrUpdatedAt).getTime() : Date.now()}`}
                          alt={`Raw Video 0${slotNum} Custom QR`}
                          className="w-full h-full object-contain rounded"
                        />
                      ) : (
                        <QRCodeSVG
                          id={`admin-raw-qr-${slotNum}`}
                          value={currentPublicUrl}
                          size={90}
                          level="H"
                          includeMargin={false}
                        />
                      )}
                    </div>

                    {/* Metadata & Status Text */}
                    <div className="flex flex-col justify-center text-xs font-mono text-slate-300 space-y-1 overflow-hidden flex-1">
                      {isCustomQr ? (
                        <span className="font-semibold text-emerald-400 flex items-center gap-1 text-[11px]">
                          <span className="text-emerald-400">🟢</span>
                          <span>Custom QR Active</span>
                        </span>
                      ) : (
                        <span className="font-semibold text-cyan-400 flex items-center gap-1 text-[11px]">
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                          <span>Dynamic QR Active</span>
                        </span>
                      )}

                      <span className="text-slate-400 truncate text-[11px]">
                        QR File: {isCustomQr ? (video.qrFileName || `raw-video-0${slotNum}.png`) : 'Generated Vector'}
                      </span>

                      <span className="text-slate-400 truncate text-[11px]">
                        Video File: {video.fileName || (hasFile ? 'raw_video.mp4' : 'None')}
                      </span>

                      {hasFile && (
                        <span className="text-slate-400 text-[11px]">Size: {formatFileSize(video.fileSize)}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Feedback status message */}
                {cardFeedback && (
                  <div className={`p-2.5 rounded-lg text-xs mb-3 flex items-center gap-1.5 ${
                    cardFeedback.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                  }`}>
                    {cardFeedback.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    <span>{cardFeedback.message}</span>
                  </div>
                )}

                {/* Video Upload Progress Bar */}
                {isUploading && (
                  <div className="mb-3 space-y-1">
                    <div className="flex justify-between text-[11px] font-mono text-cyan-400">
                      <span>Uploading video...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons Layout as Requested */}
              <div className="flex flex-col gap-2 pt-4 border-t border-slate-800">
                {/* Hidden File Inputs */}
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/x-matroska,.mp4,.webm,.mov"
                  ref={el => (videoFileInputRefs.current[slotNum] = el)}
                  onChange={(e) => handleVideoFileChange(slotNum, e)}
                  className="hidden"
                />

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,.png,.jpg,.jpeg,.webp"
                  ref={el => (qrFileInputRefs.current[slotNum] = el)}
                  onChange={(e) => handleSelectQrFile(slotNum, e, video)}
                  className="hidden"
                />

                {/* Row 1: [ Download QR ] [ Replace Video ] */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleDownloadQr(video)}
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 transition-colors"
                  >
                    <Download size={13} />
                    <span>Download QR</span>
                  </button>

                  <button
                    onClick={() => videoFileInputRefs.current[slotNum]?.click()}
                    disabled={isUploading}
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
                  >
                    <Upload size={13} />
                    <span>{hasFile ? 'Replace Video' : 'Upload Video'}</span>
                  </button>
                </div>

                {/* Row 2: [ Replace QR ] */}
                <button
                  onClick={() => qrFileInputRefs.current[slotNum]?.click()}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-cyan-300 border border-slate-700/80 hover:border-cyan-500/30 transition-all shadow-sm"
                >
                  <QrCode size={13} className="text-cyan-400" />
                  <span>Replace QR</span>
                </button>

                {/* Row 3: [ Delete Video & QR ] */}
                {(hasFile || isCustomQr) && (
                  <button
                    onClick={() => handleDelete(slotNum)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors"
                  >
                    <Trash2 size={13} />
                    <span>Delete Video & QR</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation & Comparison Preview Modal for Replace QR */}
      {qrPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                  <QrCode size={16} />
                </div>
                <div>
                  <h4 className="text-base font-heading font-bold text-slate-100">
                    Replace QR Code?
                  </h4>
                  <p className="text-xs text-slate-400">
                    Raw Video 0{qrPreviewModal.slotId}
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
                  Current QR Code
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
              <div className="flex flex-col items-center p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-center">
                <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-2 font-semibold">
                  Newly Selected QR
                </span>
                <div className="p-3 bg-white rounded-xl shadow-md border border-cyan-500/40 w-32 h-32 flex items-center justify-center">
                  <img
                    src={qrPreviewModal.previewUrl}
                    alt="Newly Selected QR Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-[10px] text-cyan-300 font-mono mt-2 truncate max-w-[140px]" title={qrPreviewModal.file.name}>
                  {qrPreviewModal.file.name}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              Confirming will store this QR as <span className="font-mono text-cyan-400">raw-video-0{qrPreviewModal.slotId}.png</span> and activate <span className="font-mono text-emerald-400">Custom QR Active</span> mode. The uploaded video file and public URL will remain unchanged.
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
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
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
