import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCodeResponse, RawVideoItem, FinalVideoItem } from '../../types';
import { QrCode, Download, Copy, Check, ExternalLink, Sparkles } from 'lucide-react';
import { normalizeUrl } from '../../utils/urlHelper';

interface QrCodeManagerProps {
  rawQr: QrCodeResponse | null;
  finalQr: QrCodeResponse | null;
  rawVideos?: RawVideoItem[];
  finalVideo?: FinalVideoItem | null;
}

export const QrCodeManager: React.FC<QrCodeManagerProps> = ({ rawQr, finalQr, rawVideos, finalVideo }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const raw1Video = rawVideos?.find(v => v.slotId === 1);
  const raw2Video = rawVideos?.find(v => v.slotId === 2);

  const raw1Url = raw1Video?.publicUrl && raw1Video.publicUrl.trim()
    ? normalizeUrl(raw1Video.publicUrl)
    : `${window.location.origin}/raw/1`;

  const raw2Url = raw2Video?.publicUrl && raw2Video.publicUrl.trim()
    ? normalizeUrl(raw2Video.publicUrl)
    : `${window.location.origin}/raw/2`;

  const finalUrl = finalVideo?.publicUrl && finalVideo.publicUrl.trim()
    ? normalizeUrl(finalVideo.publicUrl)
    : (finalQr?.targetUrl || `${window.location.origin}/final-video`);

  const handleCopy = (key: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadPNG = (elementId: string, filename: string) => {
    const svgElement = document.getElementById(elementId) as unknown as SVGElement;
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
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    };
    image.src = blobURL;
  };

  const handleDownloadQR = (item: typeof qrItems[0]) => {
    if (item.isCustom && item.customQrUrl) {
      const downloadLink = document.createElement('a');
      downloadLink.href = `${item.customQrUrl}?t=${Date.now()}`;
      downloadLink.download = item.downloadName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      return;
    }

    handleDownloadPNG(item.id, item.downloadName);
  };

  const qrItems = [
    {
      id: 'qr-raw-1',
      title: 'Raw Video 01 QR Code',
      category: 'Behind the scenes',
      url: raw1Url,
      downloadName: 'CUTM_Team03_Raw_Video_01_QR.png',
      caption: 'Direct mobile viewer link for Raw Video 01',
      color: 'cyan',
      isCustom: raw1Video?.qrMode === 'custom' && !!raw1Video?.customQrUrl,
      customQrUrl: raw1Video?.customQrUrl,
      qrUpdatedAt: raw1Video?.qrUpdatedAt
    },
    {
      id: 'qr-raw-2',
      title: 'Raw Video 02 QR Code',
      category: 'Behind the scenes',
      url: raw2Url,
      downloadName: 'CUTM_Team03_Raw_Video_02_QR.png',
      caption: 'Direct mobile viewer link for Raw Video 02',
      color: 'cyan',
      isCustom: raw2Video?.qrMode === 'custom' && !!raw2Video?.customQrUrl,
      customQrUrl: raw2Video?.customQrUrl,
      qrUpdatedAt: raw2Video?.qrUpdatedAt
    },
    {
      id: 'qr-final-video',
      title: 'Final Video Resume QR Code',
      category: 'Completed Video Resume',
      url: finalUrl,
      downloadName: 'CUTM_Team03_Final_Video_QR.png',
      caption: 'Direct link to Final Video Resume viewer page',
      color: 'amber',
      isCustom: finalVideo?.qrMode === 'custom' && !!finalVideo?.customQrUrl,
      customQrUrl: finalVideo?.customQrUrl,
      qrUpdatedAt: finalVideo?.qrUpdatedAt
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg sm:text-xl font-heading font-bold text-slate-100 flex items-center gap-2">
            <QrCode size={20} className="text-amber-400" />
            <span>Dynamic / Custom QR Code Management</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Auto-generated dynamic QR codes and uploaded custom QR codes linking to Raw Video 01, Raw Video 02, and Final Video Resume.
          </p>
        </div>
      </div>

      {/* 3 QR Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {qrItems.map((item) => {
          const isCopied = copiedKey === item.id;
          const isAmber = item.color === 'amber';

          return (
            <div
              key={item.id}
              className={`rounded-2xl glass-card p-6 flex flex-col justify-between border transition-all ${
                isAmber ? 'border-slate-800 hover:border-amber-500/40' : 'border-slate-800 hover:border-cyan-500/40'
              }`}
            >
              {/* Top Tag */}
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                  isAmber ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
                }`}>
                  {item.category.toUpperCase()}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {item.isCustom ? '🟢 Custom QR' : 'Dynamic Vector'}
                </span>
              </div>

              {/* Center QR Code Container */}
              <div className="flex flex-col items-center text-center my-2">
                <h4 className="text-base font-heading font-bold text-slate-100 mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                  {item.caption}
                </p>

                {/* QR Code SVG Display with white background */}
                <div 
                  onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
                  className={`p-3.5 bg-white rounded-2xl shadow-xl border-2 transition-transform hover:scale-105 mb-4 w-[160px] h-[160px] flex items-center justify-center cursor-pointer ${
                    isAmber ? 'border-amber-500/40 shadow-amber-500/10 hover:border-amber-400' : 'border-cyan-500/40 shadow-cyan-500/10 hover:border-cyan-400'
                  }`}
                  title="Click to open link in new tab"
                >
                  {item.isCustom && item.customQrUrl ? (
                    <img
                      src={`${item.customQrUrl}?t=${item.qrUpdatedAt ? new Date(item.qrUpdatedAt).getTime() : Date.now()}`}
                      alt={item.title}
                      className="w-full h-full object-contain rounded"
                    />
                  ) : (
                    <QRCodeSVG
                      id={item.id}
                      value={item.url}
                      size={140}
                      level="H"
                      includeMargin={true}
                    />
                  )}
                </div>

                {/* Target URL Preview */}
                <div className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-left mb-3">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-mono text-slate-300 hover:text-white hover:underline truncate max-w-[180px] block"
                    title={item.url}
                  >
                    {item.url}
                  </a>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white p-1"
                    title="Open in new tab"
                  >
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800">
                <button
                  onClick={() => handleCopy(item.id, item.url)}
                  className="inline-flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  {isCopied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{isCopied ? 'Copied' : 'Copy URL'}</span>
                </button>

                <button
                  onClick={() => handleDownloadQR(item)}
                  className={`inline-flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl text-xs font-semibold text-slate-950 transition-all shadow-md active:scale-98 ${
                    isAmber
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-amber-500/20'
                      : 'bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 shadow-cyan-500/20'
                  }`}
                >
                  <Download size={13} />
                  <span>Download</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
